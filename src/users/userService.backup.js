// ============================================================
// IA NUTRIÇÃO + PERSONAL
// USER SERVICE
// ============================================================

const { pool } = require("../database/database");


// ============================================================
// CRIAR TABELA DE USUÁRIOS
// ============================================================

async function createUsersTable() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (

            id SERIAL PRIMARY KEY,

            phone VARCHAR(30) UNIQUE NOT NULL,

            name VARCHAR(150),

            age INTEGER,

            weight NUMERIC(6,2),

            height NUMERIC(5,2),

            goal TEXT,

            gender VARCHAR(30),

            activity_level VARCHAR(50),

            dietary_restrictions TEXT,

            food_preferences TEXT,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )
    `);

}


// ============================================================
// BUSCAR USUÁRIO PELO TELEFONE
// ============================================================

async function getUserByPhone(phone) {

    if (!phone) {
        throw new Error(
            "Telefone do usuário é obrigatório."
        );
    }

    const result = await pool.query(
        `
        SELECT *
        FROM users
        WHERE phone = $1
        LIMIT 1
        `,
        [phone]
    );

    return result.rows[0] || null;

}


// ============================================================
// CRIAR USUÁRIO
// ============================================================

async function createUser(data) {

    if (!data.phone) {

        throw new Error(
            "Telefone do usuário é obrigatório."
        );

    }

    const result = await pool.query(
        `
        INSERT INTO users (

            phone,
            name,
            age,
            weight,
            height,
            goal,
            gender,
            activity_level,
            dietary_restrictions,
            food_preferences

        )

        VALUES (

            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10

        )

        ON CONFLICT (phone)
        DO UPDATE SET

            name = COALESCE(EXCLUDED.name, users.name),

            age = COALESCE(EXCLUDED.age, users.age),

            weight = COALESCE(
                EXCLUDED.weight,
                users.weight
            ),

            height = COALESCE(
                EXCLUDED.height,
                users.height
            ),

            goal = COALESCE(
                EXCLUDED.goal,
                users.goal
            ),

            gender = COALESCE(
                EXCLUDED.gender,
                users.gender
            ),

            activity_level = COALESCE(
                EXCLUDED.activity_level,
                users.activity_level
            ),

            dietary_restrictions = COALESCE(
                EXCLUDED.dietary_restrictions,
                users.dietary_restrictions
            ),

            food_preferences = COALESCE(
                EXCLUDED.food_preferences,
                users.food_preferences
            ),

            updated_at = CURRENT_TIMESTAMP

        RETURNING *
        `,
        [
            data.phone,
            data.name || null,
            data.age || null,
            data.weight || null,
            data.height || null,
            data.goal || null,
            data.gender || null,
            data.activity_level || null,
            data.dietary_restrictions || null,
            data.food_preferences || null
        ]
    );

    return result.rows[0];

}


// ============================================================
// ATUALIZAR USUÁRIO
// ============================================================

async function updateUser(
    phone,
    data
) {

    if (!phone) {

        throw new Error(
            "Telefone do usuário é obrigatório."
        );

    }

    const currentUser =
        await getUserByPhone(phone);


    if (!currentUser) {

        return await createUser({

            phone,

            ...data

        });

    }


    const result = await pool.query(
        `
        UPDATE users

        SET

            name = COALESCE($2, name),

            age = COALESCE($3, age),

            weight = COALESCE($4, weight),

            height = COALESCE($5, height),

            goal = COALESCE($6, goal),

            gender = COALESCE($7, gender),

            activity_level =
                COALESCE($8, activity_level),

            dietary_restrictions =
                COALESCE(
                    $9,
                    dietary_restrictions
                ),

            food_preferences =
                COALESCE(
                    $10,
                    food_preferences
                ),

            updated_at = CURRENT_TIMESTAMP

        WHERE phone = $1

        RETURNING *
        `,
        [
            phone,
            data.name ?? null,
            data.age ?? null,
            data.weight ?? null,
            data.height ?? null,
            data.goal ?? null,
            data.gender ?? null,
            data.activity_level ?? null,
            data.dietary_restrictions ?? null,
            data.food_preferences ?? null
        ]
    );

    return result.rows[0];

}


// ============================================================
// LISTAR USUÁRIOS
// ============================================================

async function getAllUsers() {

    const result = await pool.query(
        `
        SELECT *
        FROM users
        ORDER BY created_at DESC
        `
    );

    return result.rows;

}


// ============================================================
// DELETAR USUÁRIO
// ============================================================

async function deleteUser(phone) {

    if (!phone) {

        throw new Error(
            "Telefone do usuário é obrigatório."
        );

    }

    const result = await pool.query(
        `
        DELETE FROM users
        WHERE phone = $1
        RETURNING *
        `,
        [phone]
    );

    return result.rows[0] || null;

}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {

    createUsersTable,

    getUserByPhone,

    createUser,

    updateUser,

    getAllUsers,

    deleteUser

};