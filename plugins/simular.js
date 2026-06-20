import { simulateTyping } from '../@Bmod/typing.js';

const escribiendo = async (m, { conn, from, args }) => {
    let action = 'composing';
    let duration = 3000;

    if (args[0]?.toLowerCase() === 'audio') {
        action = 'recording';

        if (!isNaN(args[1])) {
            duration = Number(args[1]) * 1000;
        }
    } else if (!isNaN(args[0])) {
        duration = Number(args[0]) * 1000;
    }

    console.log({
        from,
        action,
        duration,
        args
    });

    await simulateTyping(conn, from, action, duration);

    await m.reply(
        `Simulación de ${action} finalizada (${duration / 1000}s)`
    );
};

escribiendo.command = ['escribiendo'];

export default escribiendo;