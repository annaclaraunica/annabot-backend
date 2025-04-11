const fs = require("fs");
const path = require("path");

function atualizarCredito(numero, valor) {
  const caminho = `./dados/clientes/${numero}.json`;
  let dados = { saldo: 0 };

  if (fs.existsSync(caminho)) {
    dados = JSON.parse(fs.readFileSync(caminho));
  }

  dados.saldo += valor;
  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
}

function obterSaldo(numero) {
  const caminho = `./dados/clientes/${numero}.json`;
  if (!fs.existsSync(caminho)) return 0;

  const dados = JSON.parse(fs.readFileSync(caminho));
  return dados.saldo || 0;
}

function agendarChamada(numero, modelo, data, horario, minutos) {
  const agendamento = {
    cliente: numero,
    modelo,
    data,
    horario,
    minutos,
    timestamp: Date.now()
  };

  const arq = `./dados/agendamentos/${numero}.json`;
  fs.writeFileSync(arq, JSON.stringify(agendamento, null, 2));
}

function iniciarChamada(numero, callbackFim) {
  const caminho = `./dados/clientes/${numero}.json`;
  if (!fs.existsSync(caminho)) return false;

  let dados = JSON.parse(fs.readFileSync(caminho));
  if (dados.saldo < 5) return false;

  const intervalo = setInterval(() => {
    if (dados.saldo <= 0) {
      clearInterval(intervalo);
      callbackFim();
    } else {
      dados.saldo -= 5; // 5 reais por minuto
      fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
      console.log(`Saldo de ${numero}: R$${dados.saldo}`);
    }
  }, 60 * 1000); // 1 minuto

  return true;
}

module.exports = {
  atualizarCredito,
  obterSaldo,
  agendarChamada,
  iniciarChamada
};
