// ============================================================
// IA NUTRIÇÃO + PERSONAL
// CONTROLE DE REFEIÇÕES E CALORIAS
// ============================================================

const { pool } = require("../database/database");


// ============================================================
// CRIAR TABELA
// ============================================================

async function createMealTrackerTable() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS meal_entries (

            id SERIAL PRIMARY KEY,

            phone VARCHAR(30) NOT NULL,

            meal_type VARCHAR(50),

            meal_name VARCHAR(150),

            food_name VARCHAR(150) NOT NULL,

            grams NUMERIC(8,2) NOT NULL,

            calories NUMERIC(8,2) DEFAULT 0,

            protein NUMERIC(8,2) DEFAULT 0,

            carbs NUMERIC(8,2) DEFAULT 0,

            fat NUMERIC(8,2) DEFAULT 0,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )
    `);


    await pool.query(`
        CREATE INDEX IF NOT EXISTS
        idx_meal_entries_phone_date

        ON meal_entries(phone, created_at)
    `);

}


// ============================================================
// REGISTRAR ALIMENTO
// ============================================================

async function registerFoodEntry({

    phone,
    mealType = null,
    mealName = null,
    foodName,
    grams,
    calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0

}) {

    if (!phone) {

        throw new Error(
            "Telefone do usuário é obrigatório."
        );

    }


    if (!foodName) {

        throw new Error(
            "Nome do alimento é obrigatório."
        );

    }


    if (
        !grams ||
        Number(grams) <= 0
    ) {

        throw new Error(
            "Quantidade do alimento é inválida."
        );

    }


    const result =
        await pool.query(
            `
            INSERT INTO meal_entries (

                phone,
                meal_type,
                meal_name,
                food_name,
                grams,
                calories,
                protein,
                carbs,
                fat

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
                $9

            )

            RETURNING *
            `,
            [

                phone,
                mealType,
                mealName,
                foodName,
                grams,
                calories,
                protein,
                carbs,
                fat

            ]
        );


    return result.rows[0];

}


// ============================================================
// REGISTRAR VÁRIOS ALIMENTOS
// ============================================================

async function registerMeal({

    phone,
    mealType = null,
    mealName = null,
    foods = []

}) {

    if (!phone) {

        throw new Error(
            "Telefone do usuário é obrigatório."
        );

    }


    if (
        !Array.isArray(foods) ||
        foods.length === 0
    ) {

        throw new Error(
            "Nenhum alimento informado."
        );

    }


    const client =
        await pool.connect();


    try {

        await client.query("BEGIN");


        const entries = [];


        for (
            const food of foods
        ) {

            const result =
                await client.query(
                    `
                    INSERT INTO meal_entries (

                        phone,
                        meal_type,
                        meal_name,
                        food_name,
                        grams,
                        calories,
                        protein,
                        carbs,
                        fat

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
                        $9

                    )

                    RETURNING *
                    `,
                    [

                        phone,
                        mealType,
                        mealName,
                        food.foodName,
                        food.grams,
                        food.calories || 0,
                        food.protein || 0,
                        food.carbs || 0,
                        food.fat || 0

                    ]
                );


            entries.push(
                result.rows[0]
            );

        }


        await client.query("COMMIT");


        return entries;

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }

}


// ============================================================
// CONSUMO DO DIA
// ============================================================

async function getDailyNutrition(
    phone,
    date = new Date()
) {

    const result =
        await pool.query(
            `
            SELECT

                COALESCE(
                    SUM(calories),
                    0
                ) AS calories,

                COALESCE(
                    SUM(protein),
                    0
                ) AS protein,

                COALESCE(
                    SUM(carbs),
                    0
                ) AS carbs,

                COALESCE(
                    SUM(fat),
                    0
                ) AS fat,

                COUNT(*) AS food_count

            FROM meal_entries

            WHERE phone = $1

            AND created_at::date = $2::date
            `,
            [
                phone,
                date
            ]
        );


    const row =
        result.rows[0];


    return {

        calories:
            Number(
                row.calories
            ),

        protein:
            Number(
                row.protein
            ),

        carbs:
            Number(
                row.carbs
            ),

        fat:
            Number(
                row.fat
            ),

        foodCount:
            Number(
                row.food_count
            )

    };

}


// ============================================================
// REFEIÇÕES DO DIA
// ============================================================

async function getDailyMeals(
    phone,
    date = new Date()
) {

    const result =
        await pool.query(
            `
            SELECT *

            FROM meal_entries

            WHERE phone = $1

            AND created_at::date = $2::date

            ORDER BY created_at ASC
            `,
            [
                phone,
                date
            ]
        );


    return result.rows;

}


// ============================================================
// ÚLTIMA REFEIÇÃO
// ============================================================

async function getLastMeal(
    phone
) {

    const result =
        await pool.query(
            `
            SELECT *

            FROM meal_entries

            WHERE phone = $1

            ORDER BY created_at DESC

            LIMIT 1
            `,
            [
                phone
            ]
        );


    return (
        result.rows[0] ||
        null
    );

}


// ============================================================
// APAGAR ALIMENTO
// ============================================================

async function deleteFoodEntry(
    phone,
    id
) {

    const result =
        await pool.query(
            `
            DELETE FROM meal_entries

            WHERE id = $1

            AND phone = $2

            RETURNING *
            `,
            [
                id,
                phone
            ]
        );


    return (
        result.rows[0] ||
        null
    );

}


// ============================================================
// APAGAR TODAS AS REFEIÇÕES DO DIA
// ============================================================

async function clearDailyMeals(
    phone,
    date = new Date()
) {

    const result =
        await pool.query(
            `
            DELETE FROM meal_entries

            WHERE phone = $1

            AND created_at::date = $2::date
            `,
            [
                phone,
                date
            ]
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

    createMealTrackerTable,

    registerFoodEntry,

    registerMeal,

    getDailyNutrition,

    getDailyMeals,

    getLastMeal,

    deleteFoodEntry,

    clearDailyMeals

};