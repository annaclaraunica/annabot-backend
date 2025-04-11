const fs = require("fs");

let infracoes = {}; // Armazena infrações por número
const tempoZerar = 1000 * 60 * 60 * 48; // 48 horas

function registrarInfracao(client, jid, numero, grupoId) {
  const agora = Date.now();
  if (!infracoes[numero]) {
    infracoes[numero] = { count: 1, ultimo: agora };
  } else {
    infracoes[numero].count += 1;
    infracoes[numero].ultimo = agora;
  }

  const nivel = infracoes[numero].count;

  // Define tempos por nível
  const tempos = {
    1: 30 * 60,     // 30min
    2: 60 * 60,     // 1h
    3: 3 * 60 * 60, // 3h
    4: 5 * 60 * 60, // 5h
    5: 24 * 60 * 60 // 24h
  };

  const mensagens = {
    1: "🚫 Você foi silenciado por 30 minutos. Motivo: postagem não autorizada. Cuidado para não repetir ou poderá ser banido.",
    2: "🚫 Silenciado por 1 hora. Último aviso!",
    3: "🚫 Silenciado por 3 horas. Mais uma infração e será banido!",
    4: "🚫 Silenciado por 5 horas. Você está na linha final.",
    5: "⛔ Banido por excesso de infrações. Regras foram ignoradas."
  };

  const tempoMute = tempos[nivel];
  const msg = mensagens[nivel];

  client.sendMessage(jid, { text: msg });

  if (nivel < 5) {
    client.groupParticipantsUpdate(grupoId, [numero], "mute");
    setTimeout(() => {
      client.groupParticipantsUpdate(grupoId, [numero], "unmute");
    }, tempoMute * 1000);
  } else {
    client.groupParticipantsUpdate(grupoId, [numero], "remove");
    delete infracoes[numero];
  }
}

// Limpa infrações a cada 48h
setInterval(() => {
  const agora = Date.now();
  for (let numero in infracoes) {
    if (agora - infracoes[numero].ultimo > tempoZerar) {
      delete infracoes[numero];
    }
  }
}, 60 * 1000);

module.exports = { registrarInfracao };
