import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

export async function sendCarousel(sock, jid, text, footer, cardsArray, quoted = null, newsletterJid = null, newsletterName = null) {
    try {
        const cards = [];

        for (const card of cardsArray) {
            const media = await prepareWAMessageMedia(
                { image: { url: card.image } }, 
                { upload: sock.waUploadToServer }
            );

            // IMPORTANTE: Asegúrate de que `btn.type` sea EXACTAMENTE uno de estos: 
            // 'quick_reply', 'cta_url', 'cta_call', o 'cta_copy'. 
            // Si le pasas algo como 'button' o 'reply', WhatsApp oculta los botones.
            const buttons = card.buttons.map(btn => ({
                name: btn.type,
                buttonParamsJson: JSON.stringify(btn.params) 
            }));

            cards.push({
                header: { 
                    title: card.title, 
                    hasMediaAttachment: true, 
                    imageMessage: media.imageMessage 
                },
                body: { text: card.body },
                footer: { text: card.footer },
                nativeFlowMessage: {
                    buttons: buttons
                }
            });
        }

        // Construimos el contexto del canal si pasaste los parámetros
        const customContextInfo = (newsletterJid && newsletterName) ? {
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: newsletterJid,
                newsletterName: newsletterName,
                serverMessageId: -1
            }
        } : {};

        const msg = generateWAMessageFromContent(jid, {
            viewOnceMessage: {
                message: {
                    // ESTO ES CLAVE: Fuerza la renderización de la interfaz de botones
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: { text: text },
                        footer: { text: footer },
                        carouselMessage: { cards, messageVersion: 1 },
                        contextInfo: customContextInfo // Aquí inyectamos el canal
                    }
                }
            }
        }, { userJid: sock.user.id, quoted: quoted });

        await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.error("🕹 Error en sendCarousel:", err.message);
    }
}


/**
 * Envía un mensaje estándar (texto, imagen, etc.) con el crédito del Newsletter.
 * @param {Object} sock - Instancia del socket de Baileys
 * @param {String} jid - JID del destinatario
 * @param {Object} content - Contenido del mensaje (ej: { text: 'Hola' } o { image: { url: '...' }, caption: '...' })
 * @param {String} newsletterJid - JID del canal (ej: '1234567890@newsletter')
 * @param {String} newsletterName - Nombre del canal (ej: 'CrizZapp Updates')
 * @param {Object} [quoted=null] - Mensaje a citar (opcional)
 */
export async function sendNewsletterMessage(sock, jid, content, newsletterJid, newsletterName, quoted = null) {
    try {
        return await sock.sendMessage(jid, {
            ...content,
            contextInfo: {
                forwardingScore: 9999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: newsletterJid,
                    newsletterName: newsletterName,
                    serverMessageId: -1 // Requerido para evitar bugs visuales en iOS
                }
            }
        }, { quoted: quoted });
    } catch (err) {
        console.error("🕹 Error en sendNewsletterMessage:", err.message);
    }
}
