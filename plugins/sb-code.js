import { startSubBot } from "../subbot.js";

const serbot = async (m, { conn, args }) => {
    
    let number = args[0] ? args[0].replace(/[^0-9]/g, "") : m.sender.split("@")[0];
    
    const msg = await m.reply(`> *✧ VINCULACIÓN DE SUB BOT ✧*

> 〔 ⚡ 𝐏𝐑𝐄𝐏𝐀𝐑𝐀𝐂𝐈𝐎́𝐍 〕❂
> 📱 El bot esta listo y activo.
> 🔐 Generando codigo de vinculación.
> ━━━━━━━━━━━━❂

> 〔 📲 𝐈𝐍𝐒𝐓𝐑𝐔𝐂𝐂𝐈𝐎𝐍𝐄𝐒 〕❂
> ➪ 𝐀𝐛𝐫𝐞 “dispositivos vinculados",
> ➪ Presiona los tres puntitos,
> ➪ ingresa el codigo,
> ➪ Disfruta del bot.
> ━━━━━━━━━━━❂`);

    // eliminar luego de 60s
    setTimeout(() => {
        conn.sendMessage(m.chat, {
            delete: msg.key
        });
    }, 60000);
    
    await startSubBot(conn, m, number);
};

serbot.command = ['serbot', 'jadibot', 'code'];

export default serbot;
