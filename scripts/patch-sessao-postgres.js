const fs = require("fs");

const file = "src/whatsapp/whatsapp.js";
let src = fs.readFileSync(file, "utf8");

if (src.includes("usePostgresAuthState")) {
  console.log("whatsapp.js: já aplicado.");
  process.exit(0);
}

const eol = src.includes("\r\n") ? "\r\n" : "\n";
const re = /const\s*\{\s*state,\s*saveCreds\s*\}\s*=\s*await\s+useMultiFileAuthState\(\s*AUTH_FOLDER\s*\)\s*;/;

if (!re.test(src) || !src.includes('const QRCode = require("qrcode");')) {
  console.error("Não achei os pontos de encaixe. Nada foi alterado.");
  process.exit(1);
}

fs.copyFileSync(file, "src/whatsapp/whatsapp.pre-sessao-pg.backup.js");

src = src.replace(
  re,
  'const authHelper = await usePostgresAuthState(process.env.WHATSAPP_SESSION_ID || "default");' + eol +
  "    const { state, saveCreds } = authHelper;"
);

src = src.replace(
  'const QRCode = require("qrcode");',
  'const QRCode = require("qrcode");' + eol +
  'const { usePostgresAuthState } = require("./pgAuthState");'
);

const lines = src.split(/\r?\n/);
const idx = lines.findIndex((l) => l.includes('"Sessão encerrada."'));

if (idx !== -1 && lines[idx + 1] && lines[idx + 1].trim() === ");") {
  lines.splice(idx + 2, 0,
    "",
    "                    try {",
    "                        await authHelper.clearSession();",
    '                        console.log("Sessão limpa. Gerando novo QR Code em 3 segundos...");',
    "                        setTimeout(startWhatsApp, 3000);",
    "                    } catch (error) {",
    '                        console.error("Erro ao limpar sessão:", error.message);',
    "                    }"
  );
  src = lines.join(eol);
} else {
  console.log("Aviso: bloco 'Sessão encerrada' não encontrado. A limpeza automática não foi adicionada.");
}

fs.writeFileSync(file, src, "utf8");
console.log("whatsapp.js: patch aplicado. Backup salvo.");
