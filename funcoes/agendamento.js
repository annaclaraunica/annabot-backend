const fs = require("fs");
const path = require("path");

const pasta = "./dados/agendamentos/";

function exibirHorariosDisponiveis() {
  // Horários fixos como exemplo
  const horarios = [
    "10:00", "11:00", "14:00", "15:00", "16:00", "19:00", "20:00", "21:00", "22:00"
  ];

  const dias = ["Hoje", "Amanhã", "Depois de Amanhã"];
  let resposta = "📅 *Horários Disponíveis por Modelo:*\n\n";

  const arquivos = fs.readdirSync(pasta).filter(f => f.endsWith(".json"));

  const agendamentos = arquivos.map(arq => {
    const ag = JSON.parse(fs.readFileSync(path.join(pasta, arq)));
    return `${ag.data} ${ag.horario}`;
  });

  dias.forEach(dia => {
    resposta += `\n🗓 ${dia}:\n`;
    horarios.forEach(h => {
      const slot = `${dia} ${h}`;
      const ocupado = agendamentos.includes(slot);
      resposta += ` - ${h} ${ocupado ? "❌" : "✅"}\n`;
    });
  });

  return resposta;
}

function exibirAgendamentosModelo(modeloId) {
  const arquivos = fs.readdirSync(pasta).filter(f => f.endsWith(".json"));
  const agendamentos = arquivos
