import { delay } from '@whiskeysockets/baileys';

export async function simulateTyping(sock, jid, action = 'composing', duration = 3000) {
    try {
        console.log('[simulateTyping]', {
            jid,
            action,
            duration
        });

        await sock.presenceSubscribe(jid);

        await sock.sendPresenceUpdate(action, jid);

        await delay(duration);

        await sock.sendPresenceUpdate('available', jid);

        console.log('[simulateTyping] finalizado');
    } catch (err) {
        console.error('[simulateTyping]', err);
    }
}
