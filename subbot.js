import * as baileys from "@whiskeysockets/baileys";
import pino from "pino";
import { Boom } from "@hapi/boom";
import fs from "fs";
import path from "path";
import chalk from "chalk";

const {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason
} = baileys;
const makeWASocket = baileys.default;

export async function startSubBot(mainSock, m, number) {
  const folderPath = path.resolve("./subbots_sessions");
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  const sessionPath = path.join(folderPath, `subbot_${number}`);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "error" }), 
    browser: ["Ubuntu", "Chrome", "20.0.0"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
    },
    markOnlineOnConnect: true,
    syncFullHistory: false
  });


  sock.ev.on("messages.upsert", async (chatUpdate) => {
    const rawM = chatUpdate.messages[0];
    if (!rawM || !rawM.message) return;
    try {
      const { handler } = await import(`./handler.js?update=${Date.now()}`);
      await handler(sock, rawM);
    } catch (error) {
      console.error(chalk.red(`[ERROR HANDLER SUBBOT ${number}]`), error);
    }
  });

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow(`[SUBBOT ${number}] Reconectando...`));
        startSubBot(mainSock, m, number);
      } else {
        console.log(chalk.red(`[SUBBOT ${number}] Sesión cerrada o eliminada desde WhatsApp.`));
        try { fs.rmSync(sessionPath, { recursive: true, force: true }); } catch {}
      }
    }

    if (connection === "open") {
      console.log(chalk.green(`[SUBBOT CONECTADO VÍA +${number}]`));
      if (m) {
        await mainSock.sendMessage(m.chat, { text: `> ✧ ¡Sub-bot (+${number}) conectado con exito!` }, { quoted: m });
      }
    }
  });


  sock.ev.on("creds.update", saveCreds);


  if (!sock.authState.creds.registered) {
    if (!m) return; 
    
 
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(number);
        const txt = `*NUEVO SUB BOT*\n\n` +
                    `» *Número:* +${number}\n` +
                    `» *Código:* \`${code}\`\n\n` +
                    `> ❂ Zenitsu Bot - Sub bots sistem.`;
                    
        const sent = await mainSock.sendMessage(
  m.chat,
  { text: txt },
  { quoted: m }
);

setTimeout(() => {
  mainSock.sendMessage(m.chat, {
    delete: sent.key
  });
}, 55000);
      } catch (err) {
        console.error(chalk.red(`[ERROR SUBBOT ${number}]`), err);
        await mainSock.sendMessage(m.chat, { text: "❌ Error al generar el código de vinculación." }, { quoted: m });
      }
    }, 4000); 
  }
}

export async function resumeSubBots(mainSock) {
  const folderPath = path.resolve("./subbots_sessions");
  if (!fs.existsSync(folderPath)) return;

  const dirs = fs.readdirSync(folderPath);
  for (const dir of dirs) {
    if (dir.startsWith("subbot_")) {
      const number = dir.replace("subbot_", "");
      console.log(chalk.cyan(`[AUTO-RESUME] Reviviendo sub-bot: +${number}`));
      startSubBot(mainSock, null, number);
    }
  }
}
