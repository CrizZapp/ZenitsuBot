// Archivo: /plugins/play.js

import fetch from "node-fetch";
import yts from "yt-search";

const play = async (m, { sender, from, usedPrefix, command, args, conn }) => {
    try {
        const query = args.join(" ").trim();

        if (!query) {
            return m.reply(`⚠️ Uso correcto: ${usedPrefix}${command} <nombre de la canción o link de YouTube>`);
        }

        // Aviso de búsqueda
        await m.reply("🔍 Buscando en YouTube...");

        // 1. Usar yt-search para encontrar el video
        const search = await yts(query);
        const video = search.videos[0]; // Agarra el primer resultado

        if (!video) {
            return m.reply("❌ No encontré ningún resultado.");
        }

        const videoUrl = video.url;

        // 2. Hacer la petición POST a la API
        const api = "https://natsu-api.darkcore.xyz/api/convert";
        
        const res = await fetch(api, {
            method: "POST", 
            headers: {
                "Content-Type": "application/json"
            },
            // Enviamos el link del video en formato JSON
            body: JSON.stringify({ url: videoUrl }) 
        });

        const data = await res.json();

        // Verificamos si la API respondió con "ok" como mostraste
        if (data.status !== "ok" || !data.download) {
            return m.reply("❌ Ocurrió un error al intentar convertir el audio en la API.");
        }

        // Aviso de descarga
        await m.reply(`📥 Descargando audio:\n🎵 *${data.title || video.title}*`);

        // 3. Enviar el audio usando Baileys
        await conn.sendMessage(from, {
            audio: { url: data.download },
            mimetype: "audio/mpeg", // Formato mp3
            ptt: false // Cambia a true si quieres que se envíe como nota de voz
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await m.reply("❌ Error interno al procesar el comando.");
    }
};

// Comandos para activar el plugin
play.command = ["play", "yt", "cancion"];

export default play;
