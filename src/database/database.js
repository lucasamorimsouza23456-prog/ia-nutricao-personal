// ============================================================
// IA NUTRIÇÃO + PERSONAL
// DATABASE
// ============================================================

const dotenv = require("dotenv");
const { Pool } = require("pg");


// ============================================================
// CARREGAR .ENV
// ============================================================

dotenv.config();


// ============================================================
// VALIDAR DATABASE_URL
// ============================================================

if (!process.env.DATABASE_URL) {

    throw new Error(
        "DATABASE_URL não configurada no arquivo .env."
    );

}


// ============================================================
// CONEXÃO POSTGRESQL
// ============================================================

const pool = new Pool({

    connectionString:
        process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false
    }

});


// ============================================================
// TESTAR CONEXÃO
// ============================================================

async function testDatabaseConnection() {

    const result =
        await pool.query(
            "SELECT NOW() AS now"
        );


    console.log(
        "=========================================="
    );

    console.log(
        "       POSTGRESQL CONECTADO"
    );

    console.log(
        "=========================================="
    );

    console.log(
        "Banco: Neon PostgreSQL"
    );

    console.log(
        "Horário do banco:",
        result.rows[0].now
    );

    console.log(
        "=========================================="
    );


    return result.rows[0];

}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {

    pool,

    testDatabaseConnection

};