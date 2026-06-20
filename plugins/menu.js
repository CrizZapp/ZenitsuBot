import fs from "fs";
import { sendNewsletterMessage } from "../@Bmod/simple.js";

let handler = async (m, { conn, sender, usedPrefix }) => {

    const userNumber = sender.split("@")[0];

const newsletterJid = "120363428334544341@newsletter";

const newsletterName = "⇴ 𝚉𝚎𝚗ĭ̈t̆̈𝚣ᴜ 𖧧  𝑏̮̑𝘰⃨⃰t ⎈";

    const menuText = `࿆ㅤ໋︵ּㅤׄ⏜ּㅤ֯𝚉𝙴𝙽𝙸𝚃𝚂𝚄 𝙱𝙾𝚃 ⃨ׅ߲࠭  ֮ㅤ֯⏜ּㅤׄ︵ㅤ໋࿆

» ✰ Hola @${userNumber}, Este es mi menu de comandos.

> ₍ᐢ..ᐢ₎ ¿Viste a Nezuko-chan por algun lugar? ❀

˗ˏˋ⃞ׄ❀︿︿︿︿︿༒︿︿︿︿︿❀⃞ׄ⃞ˎˊ˗
⊹ ₊ ​˙ ˙ ✦ 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻 ✦ ˙ ˙ ₊ ⊹

❖ ${usedPrefix}menu
❖ ${usedPrefix}help
❖ ${usedPrefix}menuprincipal

˗ˏˋ⃞ׄ❀︿︿︿︿︿༒︿︿︿︿︿❀⃞ׄ⃞ˎˊ˗
⊹ ₊ ​˙ ˙✦ 𝚂𝙾𝙲𝙺𝙴𝚃𝚂 ✦˙ ˙ ₊ ⊹

❖ ${usedPrefix}code

˗ˏˋ⃞ׄ❀︿︿︿︿︿༒︿︿︿︿︿❀⃞ׄ⃞ˎˊ˗
⊹ ₊ ​˙ ˙ ✦ 𝙳𝙾𝚆𝙻𝙾𝙰𝙳𝚂 ✦ ˙ ˙ ₊ ⊹
❖ ${usedPrefix}ig / Instagram <link>
❖ '${usedPrefix}play' / '#mp4' / '#ytmp4'
❖ '${usedPrefix}playaudio' / '#ytmp3' / '#mp3'

˗ˏˋ⃞ׄ❀︿︿︿︿︿༒︿︿︿︿︿❀⃞ׄ⃞ˎˊ˗
⊹ ₊ ​˙ ˙ ✦ 𝙾𝚆𝙽𝙴𝚁 ✦ ˙ ˙ ₊ ⊹
❖ ${usedPrefix}test

*˗ˏˋ▬▭▬▭▬▭▬▭▬▭▬ˎˊ˗*
> 𓏲⌬ Zenitsu Bot ֮`;

    const imageBuffer = fs.readFileSync("./banner.jpg");

    await sendNewsletterMessage(
        conn,
        m.chat, 
        {
            image: imageBuffer,
            caption: menuText,
            mentions: [sender]
        },
        newsletterJid,
        newsletterName,
        m
    );
};

handler.command = ['menu', 'help', 'menuprincipal'];

export default handler;