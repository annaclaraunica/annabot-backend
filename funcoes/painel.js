const fs = require("fs");
const path = require("path");

function registrarVenda(idModelo, tipo, valor) {
  const pasta = "./dados/vendas";
  const arquivo = path.join(pasta, `${idModelo}.json`);

  const venda = { tipo, valor, data: new Date().toISOString() };
  let vendas = [];

  if (fs.existsSync(arquivo)) {
    vendas = JSON.parse(fs.readFileSync(arquivo));
  }

  vendas.push(venda);
  fs.writeFileSync(arquivo, JSON.stringify(vendas, null, 2));
}

function gerarRelatorio(idModelo) {
  const arquivo = `./dados/vendas/${idModelo}.json`;
  if (!fs.existsSync(arquivo)) return "❌ Nenhuma venda registrada ainda.";

  const vendas = JSON.parse(fs.readFileSync(arquivo));
  const total = vendas.reduce((acc, v) => acc + parseFloat(v.valor), 0);
  const comissao = total * 0.20;
  const liquido = total - comissao;

  let texto = `📊 *Relatório de Vendas (${idModelo})*\n`;
  texto += `💰 Total: R$ ${total.toFixed(2)}\n`;
  texto += `📉 Comissão (20%): R$ ${comissao.toFixed(2)}\n`;
  texto += `✅ Valor líquido: R$ ${liquido.toFixed(2)}\n`;
  texto += `🧾 Vendas:\n`;

  vendas.forEach((v, i) => {
    texto += `${i + 1}. ${v.tipo} - R$ ${v.valor} - ${new Date(v.data).toLocaleString("pt-BR")}\n`;
  });

  return texto;
}

module.exports = {
  registrarVenda,
  gerarRelatorio
};
