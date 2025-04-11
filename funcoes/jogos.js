const desafios = {
    sensual: [
      "Envie um áudio gemendo baixinho.",
      "Envie uma selfie sensual com olhar provocante.",
      "Mostre sua roupa íntima em viz única.",
      "Conte um fetiche que você tem.",
      "Faça uma pose de 'sedutora' e envie em foto viz única."
    ],
    erotico: [
      "Envie uma foto mostrando o quadril (viz única).",
      "Descreva como seria sua melhor preliminar.",
      "Mostre parte dos seios ou do bumbum (viz única).",
      "Envie um vídeo dançando de forma provocante.",
      "Faça uma descrição de uma cena quente com alguém do grupo."
    ],
    porno: [
      "Envie uma foto nua (com censura se quiser).",
      "Faça um vídeo dizendo o que faria com o cliente.",
      "Descreva em áudio sua fantasia sexual mais pesada.",
      "Mostre tudo por 10 segundos (viz única).",
      "Mostre uma parte íntima no espelho (viz única)."
    ]
  };
  
  function desafioAleatorio(nivel = "sensual") {
    const lista = desafios[nivel];
    const escolhidos = [];
    while (escolhidos.length < 5) {
      const i = Math.floor(Math.random() * lista.length);
      const frase = lista[i];
      if (!escolhidos.includes(frase)) escolhidos.push(frase);
    }
    return escolhidos;
  }
  
  function iniciarJogoDaVelha() {
    return `
  🎮 *Jogo da Velha Erótico* 🎮
  
  Você contra o bot. Use "🟤" (peito) e "🍑" (bunda) para jogar.
  
  Escolha a posição de 1 a 9:
  [1][2][3]
  [4][5][6]
  [7][8][9]
  
  Digite: /jogar <posição>
  `.trim();
  }
  
  module.exports = {
    desafioAleatorio,
    iniciarJogoDaVelha
  };
  