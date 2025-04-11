// index.js COMPLETO com IA Psicóloga + Jogos + Divulgação + Moderação por Infração + Painel & Conteúdo Premium + Agendamento Visual

const fs = require("fs");
const pino = require("pino");
const readline = require("readline");
const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore } = require("@whiskeysockets/baileys");
const NodeCache = require("node-cache");
const cfonts = require("cfonts");
const colors = require("colors");
const moment = require("moment-timezone");

// Funções e módulos internos do bot
const { startComandos } = require("./funcoes/comandos.js");
const { handleGroupSchedule } = require("./funcoes/scheduler.js");
const { question } = require("./funcoes/utils.js");
const { responderIA } = require("./funcoes/ia.js");
const { iniciarDivulgador } = require("./funcoes/divulgador.js");
const { desafioAleatorio, iniciarJogoDaVelha } = require("./funcoes/jogos.js");
const { registrarInfracao } = require("./funcoes/moderador.js");
const { gerarSenhaTemporaria, acessarConteudoPremium } = require("./funcoes/senhas.js");
const { exibirHorariosDisponiveis, exibirAgendamentosModelo } = require("./funcoes/agendamento.js");

let client;
let phoneNumber;
const pairingCode = process.argv.includes("--pairing-code");
const useMobile = process.argv.includes("--mobile");

console.clear();
cfonts.say("Anna Bot", {
  font: "block",
  align: "center",
  gradient: ["cyan", "magenta"],
});

console.log(`\n${colors.cyan("BOT INICIADO")} - ${colors.green("Versão 1.0")}`);

async function startZulluX() {
  const store = makeInMemoryStore({ logger: pino().child({ level: "silent" }) });
  const msgRetryCounterCache = new NodeCache();
  const authFolder = "./dados/qr-code";

  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  client = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: !pairingCode,
    logger: pino({ level: "silent" }),
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    msgRetryCounterCache,
  });

  store.bind(client.ev);

  if (pairingCode && !client.authState.creds.registered) {
    if (useMobile) {
      throw new Error("Pareamento via celular não suportado nesta versão.");
    }

    let numero = await question("Digite o número com DDD (ex: +5511999999999): ");
    numero = numero.replace(/[^0-9]/g, "");

    if (!numero.startsWith("55")) {
      console.log("Número inválido, deve começar com o código do país. Ex: +55");
      process.exit(0);
    }

    phoneNumber = `+${numero}`;

    setTimeout(async () => {
      let code = await client.requestPairingCode(phoneNumber);
      code = code?.match(/.{1,4}/g)?.join("-") || code;

      console.log("\nDigite o código no WhatsApp:");
      console.log(`👉 Código de pareamento: ${colors.bold.green(code)}`);
    }, 2000);
  }

  client.ev.on("creds.update", saveCreds);
  client.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
      if (shouldReconnect) {
        console.log("Reconectando...");
        startZulluX();
      }
    }

    if (update.isNewLogin) {
      console.log(colors.green("🤖 Bot conectado com sucesso!"));
    }
  });

  // Ativa funcionalidades
  handleGroupSchedule(client);
  startComandos(client);
  iniciarDivulgador(client);

  // Eventos diretos de mensagens
  client.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!texto) return;

    const comando = texto.toLowerCase();

    // IA Psicóloga
    if (comando.startsWith("/psicologa")) {
      const pergunta = texto.replace("/psicologa", "").trim();
      if (!pergunta) return client.sendMessage(msg.key.remoteJid, { text: "Por favor, escreva sua dúvida após o comando." }, { quoted: msg });
      const resposta = await responderIA(pergunta);
      return client.sendMessage(msg.key.remoteJid, { text: resposta }, { quoted: msg });
    }

    // Jogos
    if (comando.startsWith("/jogodavelha")) {
      const tabuleiro = iniciarJogoDaVelha();
      return client.sendMessage(msg.key.remoteJid, { text: tabuleiro });
    }

    if (comando.startsWith("/desafio")) {
      const nivel = comando.split(" ")[1] || "sensual";
      const desafios = desafioAleatorio(nivel);
      return client.sendMessage(msg.key.remoteJid, {
        text: `🔥 *Desafios (${nivel})*\n\n${desafios.map((d, i) => `${i + 1}. ${d}`).join("\n")}`
      });
    }

    // Menu de agendamento
    if (comando === "/horarios") {
      const resposta = exibirHorariosDisponiveis();
      return client.sendMessage(msg.key.remoteJid, { text: resposta });
    }

    if (comando === "/meusagendamentos") {
      const modelo = msg.key.participant || msg.key.remoteJid;
      const resposta = exibirAgendamentosModelo(modelo);
      return client.sendMessage(msg.key.remoteJid, { text: resposta });
    }

    // Conteúdo Premium com senha
    if (comando.startsWith("/conteudo")) {
      const senha = texto.split(" ")[1];
      const resultado = acessarConteudoPremium(senha);
      return client.sendMessage(msg.key.remoteJid, { text: resultado });
    }

    if (comando === "/gerarsenha") {
      const nova = gerarSenhaTemporaria("https://drive.google.com/folder-link-aqui", 60 * 60);
      return client.sendMessage(msg.key.remoteJid, { text: `🔐 Sua senha temporária: ${nova}` });
    }

    // Infrações por mídia não autorizada
    if (msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.documentMessage) {
      const numero = msg.key.participant || msg.key.remoteJid;
      registrarInfracao(client, msg.key.remoteJid, numero, msg.key.remoteJid);
    }
  });
}

startZulluX();