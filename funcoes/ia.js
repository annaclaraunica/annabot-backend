const fetch = require("node-fetch");

const mistralAPI = "https://api.mistral.ai/v1/chat/completions";
const mistralKey = "44288487-79e0-4b33-a21f-11b4a08b090f";

async function conversarComPsicologa(pergunta) {
  const resposta = await fetch(mistralAPI, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${mistralKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-medium",
      messages: [
        { role: "system", content: "Você é uma psicóloga sexual gentil, carinhosa, acolhedora e bem picante, focada em orientar adultos sobre sexualidade e prazer." },
        { role: "user", content: pergunta }
      ],
    }),
  });

  const json = await resposta.json();
  return json.choices?.[0]?.message?.content || "Algo deu errado na resposta da IA.";
}

module.exports = { conversarComPsicologa };
