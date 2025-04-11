const express = require("express");
const app = express();

const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const PORT = 3001;

app.use(cors());
app.use(express.json());
const usuariosPath = path.join(__dirname, "dados/usuarios.json");

app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;

  if (!fs.existsSync(usuariosPath)) {
    return res.status(404).json({ erro: "Arquivo de usuários não encontrado" });
  }

  const usuarios = JSON.parse(fs.readFileSync(usuariosPath));
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);

  if (!user) {
    return res.status(401).json({ erro: "Usuário ou senha inválidos" });
  }

  res.json({ status: "ok", tipo: user.tipo, usuario: user.usuario });
});


const LIVEPIX_TOKEN = "999c5d25-3b09-46ab-ac99-8aa46ddd9ad8";
const WEBHOOK_URL = "http://localhost:3001/pix/webhook";

const clientesPath = path.join(__dirname, "dados/clientes");

app.get("/", (req, res) => {
  res.send("✅ API AnnaBot rodando corretamente!");
});

app.post("/pix/gerar", async (req, res) => {
  const { usuario, valor } = req.body;

  try {
    const resposta = await axios.post("https://api.livepix.gg/v1/checkout", {
      valor,
      comentario: `Crédito para ${usuario}`,
      webhook: WEBHOOK_URL,
      identificador: usuario
    }, {
      headers: {
        Authorization: `Bearer ${LIVEPIX_TOKEN}`
      }
    });

    res.json(resposta.data);
  } catch (err) {
    console.error("Erro ao gerar cobrança:", err.response?.data || err.message);
    res.status(500).json({ erro: "Erro ao gerar cobrança" });
  }
});


app.post("/pix/webhook", (req, res) => {
  const usuario = req.body?.identificador;
  const valor = parseFloat(req.body?.valor || 0);
  if (!usuario || !valor) return res.status(400).json({ erro: "Dados inválidos" });

  const arq = path.join(clientesPath, `${usuario}.json`);
  let cliente = { saldo: 0 };
  if (fs.existsSync(arq)) cliente = JSON.parse(fs.readFileSync(arq));
  cliente.saldo = (cliente.saldo || 0) + valor;
  fs.writeFileSync(arq, JSON.stringify(cliente, null, 2));

  console.log(`💸 Crédito recebido via Pix: R$ ${valor} para ${usuario}`);
  res.json({ status: "Saldo atualizado" });
});

app.listen(PORT, () => {
  console.log(`✅ API backend rodando em http://localhost:${PORT}`);
});
