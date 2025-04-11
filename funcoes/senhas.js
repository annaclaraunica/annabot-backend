const fs = require("fs");
const path = require("path");

const arquivoSenhas = "./dados/senhas.json";

// Cria estrutura de dados inicial
if (!fs.existsSync(arquivoSenhas)) fs.writeFileSync(arquivoSenhas, JSON.stringify({}));

function gerarSenhaTemporaria(link, duracaoSegundos = 3600) {
  const senhas = JSON.parse(fs.readFileSync(arquivoSenhas));
  const senha = Math.random().toString(36).substr(2, 6).toUpperCase();
  const expira = Date.now() + duracaoSegundos * 1000;

  senhas[senha] = { link, expira };
  fs.writeFileSync(arquivoSenhas, JSON.stringify(senhas, null, 2));

  return senha;
}

function acessarConteudoPremium(senha) {
  const senhas = JSON.parse(fs.readFileSync(arquivoSenhas));

  if (!senhas[senha]) return "❌ Senha inválida ou não encontrada.";

  const dados = senhas[senha];
  if (Date.now() > dados.expira) {
    delete senhas[senha];
    fs.writeFileSync(arquivoSenhas, JSON.stringify(senhas, null, 2));
    return "⏳ Esta senha expirou. Solicite uma nova.";
  }

  return `✅ Conteúdo liberado:\n${dados.link}`;
}

module.exports = {
  gerarSenhaTemporaria,
  acessarConteudoPremium
};
