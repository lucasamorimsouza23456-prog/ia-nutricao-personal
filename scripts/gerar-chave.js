require('dotenv').config();
const { createKey } = require('../src/licenses/licenseService');
const days = Number(process.argv[2] ?? 30);
const maxPhones = Number(process.argv[3] ?? 1);
createKey({ days: days || null, maxPhones })
  .then((k) => { console.log('\nCHAVE:', k, `\nValidade: ${days ? days + ' dias' : 'sem validade'} | Números: ${maxPhones}\n`); process.exit(0); })
  .catch((e) => { console.error('Erro:', e.message); process.exit(1); });
