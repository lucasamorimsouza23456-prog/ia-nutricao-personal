const fs = require("fs");

const file = "src/server.js";
let src = fs.readFileSync(file, "utf8");

if (src.includes('"/health"')) {
  console.log("server.js: /health já existe.");
  process.exit(0);
}

const eol = src.includes("\r\n") ? "\r\n" : "\n";
const lines = src.split(/\r?\n/);
const idx = lines.findIndex((l) => l.includes("// QR CODE DO WHATSAPP"));

if (idx < 1 || !lines[idx - 1].trim().startsWith("//")) {
  console.error("Não achei o ponto de encaixe. Nada foi alterado.");
  process.exit(1);
}

fs.copyFileSync(file, "src/server.pre-health.backup.js");

lines.splice(
  idx - 1,
  0,
  'app.get("/health", (req, res) => res.status(200).send("ok"));',
  ""
);

fs.writeFileSync(file, lines.join(eol), "utf8");
console.log("server.js: rota /health criada.");
