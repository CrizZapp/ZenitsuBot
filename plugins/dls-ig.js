// Archivo: /plugins/ig.js

import fetch from "node-fetch";

const ig = async (m, { sender, from, usedPrefix, command, args, conn }) => {
    try {
        const url = args.join(" ").trim();

        if (!url) {
            return m.reply(`⚠️ Uso correcto: ${usedPrefix}${command} <link de Instagram>`);
        }

        const api = `https://natsu-api.darkcore.xyz/api/instagram?url=${encodeURIComponent(url)}`;

        const res = await fetch(api);
        const data = await res.json();

        if (!data.videoUrl) {
            return m.reply("❌ No se encontró video en este enlace");
        }

        // aviso opcional
        await m.reply("📥 Descargando video...");

        // enviar video directo
        await conn.sendMessage(from, {
            video: { url: data.videoUrl },
            caption:
`🎬 *Instagram Download*

${data.title ? `📝 ${data.title}` : ""}`
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await m.reply("❌ Error al procesar el comando IG");
    }
};

// comandos del plugin
ig.command = ["ig", "instagram"];

export default ig;