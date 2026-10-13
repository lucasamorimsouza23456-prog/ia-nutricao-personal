require('dotenv').config();
const { initTables } = require('../src/licenses/licenseService');
initTables()
  .then(() => { console.log('Tabelas de licença criadas.'); process.exit(0); })
  .catch((e) => { console.error('Erro:', e.message); process.exit(1); });
