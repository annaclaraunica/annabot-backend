const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const PORT = process.env.PORT || 3001; // importante para o Render
app.use(cors());
app.use(express.json());

const CLIENT_ID = "999c5d25-3b09-46ab-ac99-8aa46ddd9ad8";
const CLIENT_SECRET = "JqUpSkkmlM6nn6xPRMNpdGlOnTBRrJqIArzQvyDnBk2YX/iS8ExxaFhIECV1GLo9Uejss2anH3CXGOY9S35j5T4CPGBVDuKr1QdoWDhPxG34ssL10wGzkqkqI7CKsEjXNI2KpAlIjdJVYd/1djJZf7cwK71lB0l5nJs4RKgtjBw";

const usuariosPath = path.join(__dirname, "dados/usuarios.json");
const clientesPath = path.join(__dirname, "dados/clientes");

app.get("/", (req, res) => {
  res.send("✅ API LivePix v2 rodando com sucesso!");
});

// OAuth2 com LivePix
async function obterTokenLivePix() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);

  const response = await axios.post("https://oauth.livepix.gg/oauth2/token", params);
  return response.data.access_token;
}

// Login
app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;
  if (!fs.existsSync(usuariosPath)) return res.status(404).json({ erro: "Arquivo de usuários não encontrado." });

  const usuarios = JSON.parse(fs.readFileSync(usuariosPath));
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);

  if (!user) return res.status(401).json({ erro: "Usuário ou senha inválidos" });
  res.json({ status: "ok", tipo: user.tipo, usuario: user.usuario });
});

// Consulta de saldo
app.get("/saldo/:usuario", (req, res) => {
  const caminho = path.join(clientesPath, `${req.params.usuario}.json`);
  if (!fs.existsSync(caminho)) return res.json({ saldo: 0 });

  const dados = JSON.parse(fs.readFileSync(caminho));
  res.json({ saldo: dados.saldo || 0 });
});

// Geração de Pix
app.post("/pix/gerar", async (req, res) => {
  const { usuario, valor } = req.body;

  if (!usuario || !valor) {
    return res.status(400).json({ erro: "Usuário e valor são obrigatórios" });
  }

  try {
    const token = await obterTokenLivePix();
    const valorCentavos = Math.round(Number(valor) * 100);

    const resposta = await axios.post("https://api.livepix.gg/v2/payments", {
      amount: valorCentavos,
      currency: "BRL",
      redirectUrl: "http://localhost:5173"
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ Pix gerado para:", usuario);
    res.json({
      status: "ok",
      pixUrl: resposta.data.data.redirectUrl,
      referencia: resposta.data.data.reference
    });

  } catch (err) {
    console.error("❌ Erro ao gerar cobrança:", err.response?.data || err.message);
    res.status(500).json({ erro: "Erro ao gerar cobrança" });
  }
});

// Webhook Pix para atualizar saldo
app.post("/pix/webhook", (req, res) => {
  const { identificador, valor } = req.body;

  if (!identificador || !valor) {
    return res.status(400).json({ erro: "Webhook inválido" });
  }

  const filePath = path.join(clientesPath, `${identificador}.json`);
  let cliente = { saldo: 0 };
  if (fs.existsSync(filePath)) {
    cliente = JSON.parse(fs.readFileSync(filePath));
  }

  cliente.saldo = (cliente.saldo || 0) + parseFloat(valor);
  fs.writeFileSync(filePath, JSON.stringify(cliente, null, 2));

  console.log(`💰 Saldo atualizado para ${identificador}: R$ ${cliente.saldo}`);
  res.json({ status: "saldo atualizado" });
});

app.listen(PORT, () => {
  console.log(`✅ API LivePix v2 rodando em http://localhost:${PORT}`);
});
