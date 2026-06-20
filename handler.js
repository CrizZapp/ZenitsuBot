import chalk from "chalk";
import { serialize } from "./lib/Bmod.js"; 

export const handler = async (sock, rawM) => {
    if (!rawM || !rawM.message) return;


    const m = serialize(sock, rawM);

    const conn = sock;

    const from = m.chat;
    const sender = m.sender;
    const body = m.text;

    const usedPrefix = "#";

    if (!body.startsWith(usedPrefix)) return;

    const [cmdName, ...args] = body
        .slice(usedPrefix.length)
        .trim()
        .split(" ");

    const command = cmdName.toLowerCase();

    if (!global.plugins || typeof global.plugins !== 'object') return;

    const plugin = Object.values(global.plugins).find(p =>
        p.command &&
        (
            Array.isArray(p.command)
                ? p.command.includes(command)
                : p.command === command
        )
    );

    if (!plugin) return;

    try {
        await plugin(m, {
            conn,
            from,
            sender,
            usedPrefix,
            args,
            command
        });
    } catch (e) {
        console.error(chalk.red(`[ERROR ${command}]`));
        console.error(e);
        await m.reply("Error ejecutando comando");
    }
};
