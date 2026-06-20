import { isOwner } from "../config.js";

const test = async (m) => {

  const senderId =
    m.sender ||
    m.key?.participant ||
    m.key?.remoteJid;

  const id = senderId.split("@")[0];

  if (!isOwner(id).check) {
    return m.reply("⛔ Solo owners.");
  }

  return m.reply("✔ Acceso permitido");
};

test.command = ["owner"];
export default test;