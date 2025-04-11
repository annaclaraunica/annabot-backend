module.exports.startComandos = (client) => {
    const painel = require("./painel");
    const chamadas = require("./chamadas");
    client.ev.on("messages.upsert", async ({ messages }) => {
        if (comando === "/pagamento") {
            const linkPix = "https://livepix.app/link-da-modelo"; // link personalizado
            return client.sendMessage(msg.key.remoteJid, {
              text: `💳 Para adquirir créditos, acesse o link abaixo:\n${linkPix}\n\nApós o pagamento, envie /confirmarpagamento <valor>`
            });
          }
          
          if (comando.startsWith("/confirmarpagamento")) {
            const partes = comando.split(" ");
            const valor = parseFloat(partes[1]);
            const numero = msg.key.participant || msg.key.remoteJid;
          
            if (!valor || isNaN(valor)) return client.sendMessage(msg.key.remoteJid, { text: "❌ Informe o valor pago. Ex: /confirmarpagamento 30" });
            chamadas.atualizarCredito(numero, valor);
            return client.sendMessage(msg.key.remoteJid, { text: `✅ Pagamento confirmado. Créditos adicionados: R$${valor.toFixed(2)}` });
          }
          
          if (comando.startsWith("/saldo")) {
            const numero = msg.key.participant || msg.key.remoteJid;
            const saldo = chamadas.obterSaldo(numero);
            return client.sendMessage(msg.key.remoteJid, { text: `💰 Seu saldo atual é: R$${saldo.toFixed(2)}` });
          }
          
          if (comando.startsWith("/agendar")) {
            const partes = comando.split(" ");
            const modelo = partes[1];
            const data = partes[2];
            const hora = partes[3];
            const minutos = parseInt(partes[4]);
            const numero = msg.key.participant || msg.key.remoteJid;
          
            if (!modelo || !data || !hora || isNaN(minutos)) {
              return client.sendMessage(msg.key.remoteJid, { text: "❌ Use: /agendar <modelo> <data> <hora> <minutos>\nEx: /agendar m1 10/04 22:00 15" });
            }
          
            chamadas.agendarChamada(numero, modelo, data, hora, minutos);
            return client.sendMessage(msg.key.remoteJid, { text: `📅 Chamada com ${modelo} agendada para ${data} às ${hora} por ${minutos} minutos.` });
          }
          
        if (comando.startsWith("/vender")) {
            const partes = texto.split(" ");
            const id = partes[1];
            const tipo = partes[2];
            const valor = parseFloat(partes[3]);
          
            if (!id || !tipo || isNaN(valor)) {
              return client.sendMessage(msg.key.remoteJid, {
                text: "❌ Formato inválido. Use: /vender m1 chamada 50"
              });
            }
          
            painel.registrarVenda(id, tipo, valor);
            return client.sendMessage(msg.key.remoteJid, {
              text: `✅ Venda registrada para modelo ${id}: ${tipo} - R$ ${valor.toFixed(2)}`
            });
          }
          
          if (comando.startsWith("/painel")) {
            const id = comando.split(" ")[1];
            if (!id) return client.sendMessage(msg.key.remoteJid, { text: "Use: /painel m1" });
          
            const relatorio = painel.gerarRelatorio(id);
            return client.sendMessage(msg.key.remoteJid, { text: relatorio });
          }
         
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;
  
      const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;
      if (!texto) return;
  
      const comando = texto.toLowerCase();
  
      if (comando.startsWith("/menu")) {
        await client.sendMessage(msg.key.remoteJid, {
          text: `🤖 *Menu Anna Bot* 🤖\n\n💬 /psicologa\n📢 /divulgar\n🧠 /conselho\n🎮 /jogos\n\nDigite um comando para começar.`,
        });
        if (comando === "/configdivulgar") {
            const modelos = require("./modelos").listarModelos();
            const blocos = modelos.map(m => {
              const d = m.divulgacao;
              return `👙 *${m.nome}*\n📅 Horários: ${d?.horarios?.join(", ") || "Nenhum"}\n📣 Ativo: ${d?.ativo ? "✅ Sim" : "❌ Não"}`;
            });
            return client.sendMessage(msg.key.remoteJid, { text: blocos.join("\n\n") });
          }
          
      }
  
      if (comando.startsWith("/conselho")) {
        const frases = [
          "A interação é o caminho para o prazer.",
          "Explore sem medo, descubra seus desejos.",
          "Conexões reais nascem da ousadia de tentar.",
        ];
        const aleatoria = frases[Math.floor(Math.random() * frases.length)];
        await client.sendMessage(msg.key.remoteJid, { text: `💡 *Conselho do dia*: ${aleatoria}` });
      }
    });
  };
  const { desafioAleatorio, iniciarJogoDaVelha } = require("./jogos");

  if (comando.startsWith("/jogos")) {
    await client.sendMessage(msg.key.remoteJid, {
      text: `🎲 *Jogos Disponíveis:*\n\n1. /jogodavelha\n2. /desafio sensual\n3. /desafio erotico\n4. /desafio porno`
    });
  }

  if (comando.startsWith("/jogodavelha")) {
    const tabuleiro = iniciarJogoDaVelha();
    await client.sendMessage(msg.key.remoteJid, { text: tabuleiro });
  }

  if (comando.startsWith("/desafio")) {
    const nivel = comando.split(" ")[1] || "sensual";
    const desafios = desafioAleatorio(nivel);
    await client.sendMessage(msg.key.remoteJid, {
      text: `🔥 *Desafios (${nivel})*\n\n${desafios.map((d, i) => `${i + 1}. ${d}`).join("\n")}`
    });
  }
