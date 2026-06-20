import * as baileys from "@whiskeysockets/baileys";
import pino from "pino";
import { Boom } from "@hapi/boom";
import figlet from "figlet";
import chalk from "chalk";
import { exec } from "child_process";
import readline from "readline";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { resumeSubBots } from "./subbot.js"; // 👈 AÑADIDO: Importamos el recuperador

const {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason
} = baileys;

const makeWASocket = baileys.default;

const ok = chalk.green;
const info = chalk.cyan;
const warn = chalk.yellow;

global.plugins = {};
const pluginsDir = path.resolve("./plugins");

const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(text, ans => {
    rl.close();
    resolve(ans);
  }));
};



async function loadPlugin(file) {
    try {
        const pluginPath = pathToFileURL(path.join(pluginsDir, file)).href;
        const module = await import(`${pluginPath}?update=${Date.now()}`);
        global.plugins[file] = module.default || module;
    } catch (e) {
        console.error(chalk.red(`[ERROR] ${file}`), e);
    }
}

async function loadPlugins() {
    if (!fs.existsSync(pluginsDir)) {
        fs.mkdirSync(pluginsDir);
        return;
    }
    const files = fs.readdirSync(pluginsDir).filter(file => file.endsWith(".js"));
    for (const file of files) {
        await loadPlugin(file);
    }
}

function watchPlugins() {
    fs.watch(pluginsDir, async (eventType, filename) => {
        if (filename && filename.endsWith(".js")) {
            const filePath = path.join(pluginsDir, filename);
            if (fs.existsSync(filePath)) {
                await loadPlugin(filename);
                console.log(info(`Plugin recargado: ${filename}`));
            } else {
                delete global.plugins[filename];
                console.log(warn(`Plugin eliminado: ${filename}`));
            }
        }
    });
}



async function startBot() {
  console.clear();

  figlet("Proyect B", { font: "Slant" }, (err, data) => {
    if (!err) console.log(chalk.magenta(data));
  });

  await loadPlugins();
  watchPlugins();

  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();



  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    browser: ["Ubuntu", "Chrome", "20.0.0"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
    },
    markOnlineOnConnect: true,
    syncFullHistory: false,
  });

  if (!sock.authState.creds.registered) {
    console.log(chalk.magenta("\n┌──────────────────────────────┐"));
    console.log(chalk.magenta("│      VINCULACIÓN WHATSAPP     │"));
    console.log(chalk.magenta("└──────────────────────────────┘\n"));

    let number = await question(info("➤ Número de WhatsApp: "));
    number = number.replace(/[^0-9]/g, "");

    console.log(warn("\n⏳ Generando código...\n"));

    const code = await sock.requestPairingCode(number);

    console.log(chalk.green("┌──────────────────────────────┐"));
    console.log(chalk.green("│        CÓDIGO GENERADO        │"));
    console.log(chalk.green("├──────────────────────────────┤"));
    console.log(chalk.white("│  " + code + "  │"));
    console.log(chalk.green("└──────────────────────────────┘\n"));
  }

  sock.ev.on("messages.upsert", async (chatUpdate) => {
    const m = chatUpdate.messages[0];
    if (!m.message) return;

    // 1. Extraer las variables que necesita tu diseño
    const isGroup = m.key.remoteJid ? m.key.remoteJid.endsWith("@g.us") : false;
    const pushName = m.pushName || "Desconocido";
    
    // El texto en Baileys puede venir en diferentes rutas dependiendo si es texto plano, citado o imagen con texto
    const text = m.message.conversation || 
                 m.message.extendedTextMessage?.text || 
                 m.message.imageMessage?.caption || 
                 m.message.videoMessage?.caption || 
                 "[Sticker / Audio / Otro]";

    // 2. Tu diseño de consola
    const now = new Date();
    const hora = now.toLocaleTimeString("es-ES", { hour12: false });
    const fecha = now.toLocaleDateString("es-ES");

    console.log(
      `\n╔═━━━━ ${chalk.blue(isGroup ? "GRUPO" : "CHAT")} ━━━━╗\n` +
      `${chalk.green("NOMBRE :")} ${chalk.cyan(pushName)}\n` +
      `${chalk.green("MENSAJE:")} ${chalk.cyan(text)}\n` +
      `${chalk.green("HORA   :")} ${chalk.cyan(hora)}\n` +
      `${chalk.green("FECHA  :")} ${chalk.cyan(fecha)}\n` +
      "╚━━━━━━━━━━━━━━━━━━━━━━━━╝"
    );

    // 3. Pasar el mensaje al handler externo
    try {
        const { handler } = await import(`./handler.js?update=${Date.now()}`);
        await handler(sock, m, chatUpdate);
    } catch (error) {
        console.error(chalk.red("[ERROR EN HANDLER]"), error);
    }
  });


  sock.ev.on("group-participants.update", async (update) => {
    const { id, participants, action } = update;

    // Verificar si la acción es que alguien se unió ("add")
    if (action === "add") {
      for (const participant of participants) {
        try {
          console.log(chalk.red("bienvenida sirve pero el wifi no"))
          // 1. Enviar primero el audio de bienvenida
          await sock.sendMessage(id, {
            audio: { url: "./Welcome.mp3" }, 
            mimetype: "audio/mpeg",
            ptt: false
          });
       
          const userJid = participant.id || participant;
          const userNum = userJid.split("@")[0];
          const welcomeText = `¡Hola @${userNum}! Bienvenido/a al grupo. 🎉\n\n> Lee la descripción, Por favor nena`;
       
          await sock.sendMessage(id, {
            image: { url: "./por-favor-nena.jpg" }, 
            caption: welcomeText,
            mentions: [participant] 
          });

        } catch (error) {
          console.error(chalk.red("[ERROR Bienvenida]"), error);
        }
      }
    }
  });


  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) startBot();
      else process.exit(0);
    }

    if (connection === "open") {
      console.log(ok("Bot conectado correctamente"));
      exec("rm -rf tmp && mkdir tmp");
      resumeSubBots(sock); // 👈 AÑADIDO: Ejecuta la reactivación automática de subbots aquí
    }
  });

  sock.ev.on("creds.update", saveCreds);
}

startBot();
