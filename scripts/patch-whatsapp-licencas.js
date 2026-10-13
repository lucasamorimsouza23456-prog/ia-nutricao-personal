const fs = require("fs");

const file = "src/whatsapp/whatsapp.js";
const backup = "src/whatsapp/whatsapp.pre-licencas.backup.js";

let src = fs.readFileSync(file, "utf8");

if (src.includes("licenseService")) {
  console.log("Já aplicado. Nada a fazer.");
  process.exit(0);
}

const eol = src.includes("\r\n") ? "\r\n" : "\n";
const lines = src.split(/\r?\n/);

const qrIdx = lines.findIndex((l) => l.includes('const QRCode = require("qrcode");'));
const iaIdx = lines.findIndex((l) => l.includes("// PROCESSAR IA"));

if (qrIdx === -1 || iaIdx === -1 || !lines[iaIdx - 1].includes("// ----")) {
  console.error("Não encontrei os pontos de encaixe. Nada foi alterado.");
  process.exit(1);
}

fs.copyFileSync(file, backup);

const block = String.raw`
                    // ----------------------------------------
                    // LICENÇA (CHAVE DE ACESSO)
                    // ----------------------------------------

                    const admins = (process.env.ADMIN_PHONES || "")
                        .split(",")
                        .map(function (p) { return p.replace(/\D/g, ""); })
                        .filter(Boolean);

                    const isAdmin = admins.includes(sender.phone);

                    const activateMatch = text.trim().match(/^\/ativar\s+(\S+)/i);

                    if (activateMatch) {

                        const act = await activateLicense(
                            activateMatch[1],
                            sender.phone
                        );

                        let reply;

                        if (act.ok) {
                            reply =
                                "Licença ativada com sucesso!" +
                                (act.expires_at
                                    ? " Válida até " +
                                      new Date(act.expires_at).toLocaleDateString("pt-BR") +
                                      "."
                                    : "") +
                                " Pode me chamar para começar.";
                        } else {
                            reply = "Não foi possível ativar: " + act.error;
                        }

                        await sock.sendMessage(sender.jid, { text: reply });

                        continue;

                    }

                    if (!isAdmin && !(await isLicensed(sender.phone))) {

                        await sock.sendMessage(
                            sender.jid,
                            {
                                text:
                                    "Seu acesso ainda não está ativo. " +
                                    "Para ativar, envie: /ativar SUA-CHAVE"
                            }
                        );

                        continue;

                    }

`.split("\n");

// insere primeiro o bloco (índice maior) e depois o require (índice menor)
lines.splice(iaIdx - 1, 0, ...block);
lines.splice(
  qrIdx + 1,
  0,
  'const { activate: activateLicense, isLicensed } = require("../licenses/licenseService");'
);

fs.writeFileSync(file, lines.join(eol), "utf8");
console.log("Patch aplicado. Backup em:", backup);
