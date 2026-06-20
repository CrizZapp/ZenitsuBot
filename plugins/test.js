import { isOwner } from "../config.js";

const test = async (m, { from, usedPrefix, command }) => {

    const ownerCheck = isOwner(m.sender);

    if (!ownerCheck.check) {
        return m.reply("> ✧ Este comando solo lo puede usar el owner.");
    }

    const isGroup = from.endsWith('@g.us');

    const texto = `¡El mod está funcionando a la perfección!\n\n` +
                  `*Remitente* ${m.sender}\n` +
                  `*Origen:* ${isGroup ? 'Grupo' : 'Chat Privado'}\n` +
                  `*Comando usado:* ${usedPrefix}${command}`;

    await m.reply(texto);
};

test.command = ['test', 'ping', 'info'];

export default test;