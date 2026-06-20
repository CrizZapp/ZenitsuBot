export function serialize(sock, m) {
    if (!m || !m.message) return m;

// ** AllenBmod :D / Obtener s.whatsapp.net XD **

    m.id = m.key.id;
    m.isSelf = m.key.fromMe;
    m.chat = m.key.remoteJid;
    m.isGroup = m.chat.endsWith('@g.us');


    let sender = m.isSelf 
        ? sock.user.id 
        : (m.key.participantAlt || m.key.remoteJidAlt || m.key.participant || m.chat);
    

    if (sender.includes(':')) {
        sender = sender.split(':')[0] + sender.substring(sender.indexOf('@'));
    }
    m.sender = sender;


    m.type = Object.keys(m.message)[0];
    if (m.type === 'messageContextInfo' || m.type === 'senderKeyDistributionMessage') {
        m.type = Object.keys(m.message)[1];
    }

    m.text = m.message?.conversation || 
             m.message[m.type]?.text || 
             m.message[m.type]?.caption || 
             "";

    
    m.reply = async (texto) => {
        return await sock.sendMessage(m.chat, { text: texto }, { quoted: m });
    };

    return m;
}
