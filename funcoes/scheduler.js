const moment = require("moment");
const fs = require("fs");

const { divulgarModelos } = require("./modelos");

module.exports.handleGroupSchedule = (client) => {
  setInterval(() => {
    divulgarModelos(client, "120363xxxxxx@g.us"); // ID do grupo real
  }, 60 * 1000);
};

module.exports.handleGroupSchedule = (client) => {
  setInterval(() => {
    const horaAtual = moment().format("HH:mm");

    if (horaAtual === "10:00") {
      client.sendMessage("120363xxxxx@g.us", {
        text: "📣 *Divulgação do Dia*\nConfira os novos conteúdos das modelos em destaque hoje! 😈🔥",
      });
    }

  }, 60 * 1000); // verifica a cada minuto
};
