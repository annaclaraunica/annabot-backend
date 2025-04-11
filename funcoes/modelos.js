const fs = require("fs");
const path = require("path");

function carregarModelos() {
  const pasta = "./dados/modelos";
  const arquivos = fs.readdirSync(pasta).filter(arq => arq.endsWith(".json"));

  return arquivos.map(arq => {
    const dados = JSON.parse(fs.readFileSync(path.join(pasta, arq)));
    return dados;
  });
}

function divulgarModelos(client, grupoId) {
  const modelos = carregarModelos();
  const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });

  modelos.forEach((modelo) => {
    if (modelo.divulgacao?.ativo && modelo.divulgacao?.horarios.includes(horaAtual)) {
      const mensagem = `${modelo.divulgacao.mensagem}\n👙 *${modelo.nome}*\n📲 ${modelo.contato}`;
      const tipo = modelo.divulgacao.tipo;
      const midia = modelo.divulgacao.midia;

      if (tipo === "foto") {
        client.sendMessage(grupoId, { image: { url: midia }, caption: mensagem });
      } else if (tipo === "video") {
        client.sendMessage(grupoId, { video: { url: midia }, caption: mensagem });
      } else if (tipo === "gif") {
        client.sendMessage(grupoId, { gifPlayback: true, video: { url: midia }, caption: mensagem });
      } else {
        client.sendMessage(grupoId, { text: mensagem });
      }
    }
  });
}

module.exports = { listarModelos: carregarModelos, divulgarModelos };
