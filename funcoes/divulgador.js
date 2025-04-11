const fs = require("fs");
const path = require("path");

module.exports.iniciarDivulgador = (client) => {
  const grupoDivulgacao = "120363xxxxxx@g.us"; // Substitua pelo ID real do grupo
  const pasta = "./assets/divulgacoes/";

  if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });

  const lista = fs.readdirSync(pasta).filter(arq => /\.(jpg|png|mp4|gif|jpeg)$/i.test(arq));

  let i = 0;
  setInterval(async () => {
    if (lista.length === 0) return;

    const arquivo = lista[i];
    const tipo = path.extname(arquivo).toLowerCase();
    const caminho = path.join(pasta, arquivo);

    let opcoes = { caption: "🔥 Confira as novidades das modelos hoje!" };

    if (tipo === ".mp4") {
      await client.sendMessage(grupoDivulgacao, { video: fs.readFileSync(caminho), ...opcoes });
    } else if (tipo === ".gif") {
      await client.sendMessage(grupoDivulgacao, { gifPlayback: true, video: fs.readFileSync(caminho), ...opcoes });
    } else {
      await client.sendMessage(grupoDivulgacao, { image: fs.readFileSync(caminho), ...opcoes });
    }

    i = (i + 1) % lista.length;
  }, 1000 * 60 * 60 * 4); // a cada 4 horas
};
