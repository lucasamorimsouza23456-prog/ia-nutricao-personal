// ============================================================
// IA NUTRIÇÃO + PERSONAL
// CONVERSATION SERVICE
// ============================================================

const { pool } = require("./database");


// ============================================================
// CRIAR TABELA DE CONVERSAS
// ============================================================

async function createConversationTable() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS conversation_messages (

            id SERIAL PRIMARY KEY,

            phone VARCHAR(30) NOT NULL,

            role VARCHAR(20) NOT NULL,

            content TEXT NOT NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS
        idx_conversation_phone_created
        ON conversation_messages(phone, created_at);
    `);

}


// ============================================================
// SALVAR MENSAGEM
// ============================================================

async function saveMessage(
    phone,
    role,
    content
) {

    if (!phone) {

        throw new Error(
            "Telefone é obrigatório."
        );

    }

    if (!role) {

        throw new Error(
            "Role da mensagem é obrigatório."
        );

    }

    if (!content) {

        throw new Error(
            "Conteúdo da mensagem é obrigatório."
        );

    }


    const result = await pool.query(
        `
        INSERT INTO conversation_messages (

            phone,
            role,
            content

        )

        VALUES (

            $1,
            $2,
            $3

        )

        RETURNING *
        `,
        [
            phone,
            role,
            content
        ]
    );


    return result.rows[0];

}


// ============================================================
// BUSCAR HISTÓRICO
// ============================================================

async function getConversationHistory(
    phone,
    limit = 20
) {

    if (!phone) {

        throw new Error(
            "Telefone é obrigatório."
        );

    }


    const safeLimit =
        Math.min(
            Math.max(
                Number(limit) || 20,
                1
            ),
            100
        );


    const result = await pool.query(
        `
        SELECT

            id,
            phone,
            role,
            content,
            created_at

        FROM conversation_messages

        WHERE phone = $1

        ORDER BY created_at DESC

        LIMIT $2
        `,
        [
            phone,
            safeLimit
        ]
    );


    return result.rows.reverse();

}


// ============================================================
// LIMPAR HISTÓRICO
// ============================================================

async function clearConversationHistory(
    phone
) {

    if (!phone) {

        throw new Error(
            "Telefone é obrigatório."
        );

    }


    const result = await pool.query(
        `
        DELETE FROM conversation_messages

        WHERE phone = $1
        `,
        [phone]
    );


    return {

        success: true,

        deleted:
            result.rowCount

    };

}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {

    createConversationTable,

    saveMessage,

    getConversationHistory,

    clearConversationHistory

};