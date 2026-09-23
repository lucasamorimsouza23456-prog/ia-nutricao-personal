const config = require("../config/env");

const {
    getUserByPhone,
    createUser,
    updateUser
} = require("../users/userService");

const {
    saveMessage,
    getConversationHistory
} = require("../database/conversation");

const {
    calculateNutritionProfile
} = require("../nutrition/calculator");

const {
    findFood,
    calculateFoodNutrition,
    normalizeText
} = require("../nutrition/foods");

const {
    generateMeal,
    generateMealPlan,
    formatMealPlanForAI,
    calculatePlanNutrition,
    calculatePlanDifferences,
    autoAdjustMealPlan
} = require("../nutrition/meals");

const {
    pool
} = require("../database/database");


// ============================================================
// CONFIGURAÃ‡ÃƒO DA IA
// ============================================================

const SYSTEM_PROMPT = `
VocÃª Ã© uma assistente virtual de nutriÃ§Ã£o e personal trainer.

Seu objetivo Ã© ajudar o usuÃ¡rio com:

- alimentaÃ§Ã£o
- controle de calorias
- macronutrientes
- perda de gordura
- ganho de massa muscular
- manutenÃ§Ã£o de peso
- refeiÃ§Ãµes
- acompanhamento diÃ¡rio
- treinos
- evoluÃ§Ã£o fÃ­sica
- organizaÃ§Ã£o alimentar

REGRAS IMPORTANTES:

1. Nunca invente alimentos, calorias ou valores nutricionais quando os dados do sistema estiverem disponÃ­veis.

2. Quando houver dados nutricionais calculados pelo sistema, utilize esses dados.

3. Seja objetiva, clara e amigÃ¡vel.

4. NÃ£o faÃ§a diagnÃ³stico mÃ©dico.

5. Caso o usuÃ¡rio relate alguma condiÃ§Ã£o mÃ©dica, oriente a procurar profissional de saÃºde.

6. Quando o usuÃ¡rio registrar uma refeiÃ§Ã£o, o sistema farÃ¡ o cÃ¡lculo automaticamente.

7. NÃ£o diga que registrou uma refeiÃ§Ã£o se ela nÃ£o tiver sido realmente registrada.

8. NÃ£o invente informaÃ§Ãµes sobre o consumo diÃ¡rio.

9. Quando o usuÃ¡rio perguntar quanto consumiu no dia, utilize os dados fornecidos pelo sistema.

10. Responda em portuguÃªs do Brasil.

11. Use emojis de forma moderada.

12. Para objetivos de perda de gordura, incentive consistÃªncia e dÃ©ficit calÃ³rico adequado.

13. Para ganho de massa, priorize proteÃ­na adequada, treinamento e ingestÃ£o energÃ©tica compatÃ­vel.

14. Nunca substitua orientaÃ§Ã£o mÃ©dica, nutricional ou profissional.
`;


// ============================================================
// OPENAI
// ============================================================

async function callOpenAI(messages) {

    if (!config.openai || !config.openai.apiKey) {
        throw new Error("OPENAI_API_KEY nÃ£o configurada.");
    }

    const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.openai.apiKey}`
            },

            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages,
                temperature: 0.4,
                max_tokens: 1200
            })
        }
    );

    if (!response.ok) {

        const errorText = await response.text();

        console.error("Erro OpenAI:", errorText);

        throw new Error(
            `Erro na API da OpenAI: ${response.status}`
        );
    }

    const data = await response.json();

    return (
        data?.choices?.[0]?.message?.content ||
        "NÃ£o consegui gerar uma resposta."
    );
}


// ============================================================
// EXTRAÃ‡ÃƒO DE DADOS DO USUÃRIO
// ============================================================

function extractUserData(message) {

    const text = normalizeText(message);

    const data = {};

    // --------------------------------------------------------
    // IDADE
    // --------------------------------------------------------

    const ageMatch = text.match(
        /(?:tenho|idade de|idade)\s+(\d{1,3})\s*(?:anos?)?/i
    );

    if (ageMatch) {
        data.age = Number(ageMatch[1]);
    }


    // --------------------------------------------------------
    // PESO
    // --------------------------------------------------------

    const weightMatch = text.match(
        /(?:peso|pesando|estou com)\s*(?:de)?\s*(\d+(?:[.,]\d+)?)\s*(?:kg|quilo|quilos)?/i
    );

    if (weightMatch) {

        data.weight = Number(
            weightMatch[1].replace(",", ".")
        );
    }


    // --------------------------------------------------------
    // ALTURA
    // --------------------------------------------------------

    const heightMatch = text.match(
        /(?:tenho|minha|altura(?: de)?)\s*(?:de)?\s*(1[.,]\d{1,2}|2[.,]\d{1,2})\s*(?:m|metros?)?/i
    );

    if (heightMatch) {

        let height = Number(
            heightMatch[1].replace(",", ".")
        );

        if (height > 3) {
            height = height / 100;
        }

        data.height = height;
    }


    // --------------------------------------------------------
    // SEXO
    // --------------------------------------------------------

    if (
        /\b(homem|masculino|sou homem)\b/i.test(text)
    ) {
        data.gender = "Homem";
    }

    if (
        /\b(mulher|feminino|sou mulher)\b/i.test(text)
    ) {
        data.gender = "Mulher";
    }


    // --------------------------------------------------------
    // OBJETIVO
    // --------------------------------------------------------

    if (
        /(perder gordura|perder peso|emagrecer|secar|diminuir gordura)/i.test(text)
    ) {
        data.goal = "perder gordura";
    }

    if (
        /(ganhar massa|ganhar mÃºsculo|ganhar musculo|hipertrofia)/i.test(text)
    ) {
        data.goal = "ganhar massa";
    }

    if (
        /(manter peso|manutenÃ§Ã£o|manutencao)/i.test(text)
    ) {
        data.goal = "manter peso";
    }


    // --------------------------------------------------------
    // TREINOS POR SEMANA
    // --------------------------------------------------------

    const trainingMatch = text.match(
        /(\d+)\s*(?:vezes?|dias?)\s*(?:por semana|na semana)/i
    );

    if (trainingMatch) {
        data.activityLevel = Number(trainingMatch[1]);
    }

    return data;
}


// ============================================================
// LIMPEZA DOS DADOS
// ============================================================

function cleanUserData(data) {

    const cleaned = {};

    if (
        data.age !== undefined &&
        Number.isFinite(data.age) &&
        data.age > 0 &&
        data.age < 120
    ) {
        cleaned.age = data.age;
    }

    if (
        data.weight !== undefined &&
        Number.isFinite(data.weight) &&
        data.weight > 20 &&
        data.weight < 400
    ) {
        cleaned.weight = data.weight;
    }

    if (
        data.height !== undefined &&
        Number.isFinite(data.height) &&
        data.height > 0.8 &&
        data.height < 2.5
    ) {
        cleaned.height = data.height;
    }

    if (data.gender) {
        cleaned.gender = data.gender;
    }

    if (data.goal) {
        cleaned.goal = data.goal;
    }

    if (
        data.activityLevel !== undefined &&
        Number.isFinite(data.activityLevel) &&
        data.activityLevel >= 0
    ) {
        cleaned.activityLevel = data.activityLevel;
    }

    return cleaned;
}


// ============================================================
// INTENÃ‡ÃƒO
// ============================================================

function detectIntent(message) {

    const text = normalizeText(message);

    // --------------------------------------------------------
    // APAGAR CONSUMO
    // --------------------------------------------------------

    if (
        /(apagar|limpar|zerar|excluir|deletar).*(consumo|alimentacao|refeiÃ§Ãµes|refeicoes|hoje|dia)/i.test(text) ||
        /(limpar|zerar).*(dia|hoje)/i.test(text)
    ) {
        return "clear_daily";
    }


    // --------------------------------------------------------
    // APAGAR ÃšLTIMA REFEIÃ‡ÃƒO
    // --------------------------------------------------------

    if (
        /(apagar|excluir|deletar|remover).*(ultima|Ãºltima).*(refeiÃ§Ã£o|refeicao|comida)/i.test(text) ||
        /(desfazer|cancelar).*(ultima|Ãºltima).*(refeiÃ§Ã£o|refeicao)/i.test(text)
    ) {
        return "delete_last";
    }


    // --------------------------------------------------------
    // RESUMO DO DIA
    // --------------------------------------------------------

    if (
        /(consumo total|quanto consumi|quanto comi|o que comi|que comi|resumo|total.*hoje|total.*dia|consumo.*hoje|calorias.*hoje|macros.*hoje|quanto ainda posso comer|quanto posso comer|quanto falta.*comer|quanto resta.*comer|quanto ainda tenho)/i.test(text)
    ) {
        return "daily_summary";
    }


    // --------------------------------------------------------
    // PLANO ALIMENTAR
    // --------------------------------------------------------

    if (
        /(plano alimentar|dieta|cardapio|cardÃ¡pio|monte.*dieta|crie.*dieta|meu plano|plano de dieta)/i.test(text)
    ) {
        return "meal_plan";
    }


    // --------------------------------------------------------
    // REGISTRO DE ALIMENTAÃ‡ÃƒO
    // --------------------------------------------------------

    if (
        /(comi|almocei|jantei|lanchei|tomei|bebi|consumi|vou comer|vou tomar|adicione|registrar|registre)/i.test(text) &&
        /(\d+(?:[.,]\d+)?\s*(?:kg|g|gramas?|ml|l|litros?|unidades?|unid|ovo|ovos|banana|bananas|maca|maÃ§a|pao|pÃ£o))/i.test(text)
    ) {
        return "food_log";
    }


    // --------------------------------------------------------
    // NUTRIÃ‡ÃƒO
    // --------------------------------------------------------

    if (
        /(calorias|caloria|macros|macronutrientes|imc|metabolismo|gasto calorico|gasto calÃ³rico|tdee|bmr|nutriÃ§Ã£o|nutricao)/i.test(text)
    ) {
        return "nutrition";
    }


    // --------------------------------------------------------
    // OBJETIVO
    // --------------------------------------------------------

    if (
        /(quero perder|quero ganhar|quero emagrecer|quero secar|quero ganhar massa|meu objetivo|objetivo Ã©|objetivo e)/i.test(text)
    ) {
        return "goal";
    }

    return "chat";
}


// ============================================================
// TIPO DE REFEIÃ‡ÃƒO
// ============================================================

function detectMealType(message) {

    const text = normalizeText(message);

    if (
        /\b(cafe da manha|cafe|desjejum)\b/i.test(text)
    ) {
        return {
            type: "cafe_da_manha",
            name: "CafÃ© da manhÃ£"
        };
    }

    if (
        /\b(lanche da manha)\b/i.test(text)
    ) {
        return {
            type: "lanche_manha",
            name: "Lanche da manhÃ£"
        };
    }

    if (
        /\b(almoÃ§o|almoco)\b/i.test(text)
    ) {
        return {
            type: "almoco",
            name: "AlmoÃ§o"
        };
    }

    if (
        /\b(lanche da tarde)\b/i.test(text)
    ) {
        return {
            type: "lanche_tarde",
            name: "Lanche da tarde"
        };
    }

    if (
        /\b(jantar|janta)\b/i.test(text)
    ) {
        return {
            type: "jantar",
            name: "Jantar"
        };
    }

    if (
        /\b(ceia)\b/i.test(text)
    ) {
        return {
            type: "ceia",
            name: "Ceia"
        };
    }

    return {
        type: "outra",
        name: "RefeiÃ§Ã£o"
    };
}


// ============================================================
// PORÃ‡Ã•ES PADRÃƒO
// ============================================================

const DEFAULT_PORTIONS = {
    ovo: 50,
    banana: 100,
    maca: 130,
    laranja: 130,
    mamao: 150,
    pao: 50,
    iogurte: 170,
    castanha: 15,
    amendoas: 15,
    nozes: 15
};


// ============================================================
// LIMPEZA DO NOME DO ALIMENTO
// ============================================================

function cleanFoodName(text) {

    let value = normalizeText(text);

    // --------------------------------------------------------
    // Remove artigos e conectores
    // --------------------------------------------------------

    value = value
        .replace(/\b(de|do|da|dos|das)\b/gi, " ")
        .replace(/\b(e)\b/gi, " ")
        .replace(/\b(com)\b/gi, " ")
        .replace(/\bpara\b/gi, " ")
        .replace(/\bem\b/gi, " ");


    // --------------------------------------------------------
    // Remove contexto de refeiÃ§Ã£o
    // --------------------------------------------------------

    value = value
        .replace(
            /\b(no|na|nos|nas)\s+(cafe|cafÃ©|almoco|almoÃ§o|jantar|janta|lanche|ceia|refeicao|refeiÃ§Ã£o)\b/gi,
            " "
        )

        .replace(
            /\b(cafe|cafÃ©|almoco|almoÃ§o|jantar|janta|lanche|ceia|refeicao|refeiÃ§Ã£o)\b/gi,
            " "
        );


    // --------------------------------------------------------
    // Remove verbos/contextos
    // --------------------------------------------------------

    value = value
        .replace(
            /\b(comi|comer|almocei|almoÃ§ar|jantei|jantar|lanchei|lanchar|tomei|tomar|bebi|beber|consumi|consumir|registre|registrar|adicione|adicionar)\b/gi,
            " "
        );


    // --------------------------------------------------------
    // Remove unidades
    // --------------------------------------------------------

    value = value
        .replace(
            /\b\d+(?:[.,]\d+)?\s*(?:kg|g|gramas?|quilos?|ml|litros?|l)\b/gi,
            " "
        );


    // --------------------------------------------------------
    // Remove sobras de pontuaÃ§Ã£o
    // --------------------------------------------------------

    value = value
        .replace(/[,:;.!?]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return value;
}


// ============================================================
// IDENTIFICAÃ‡ÃƒO DE ALIMENTOS
// ============================================================

function extractFoodItems(message) {

    const original = message;

    const items = [];

    // ========================================================
    // 1. PRIMEIRO: CAPTURA TODAS AS QUANTIDADES
    // ========================================================

    const quantityRegex =
        /(\d+(?:[.,]\d+)?)\s*(kg|g|gramas?|quilos?|ml|litros?|l)\b/gi;

    const matches = [
        ...original.matchAll(quantityRegex)
    ];

    if (!matches.length) {
        return items;
    }


    // ========================================================
    // 2. SEPARA CADA BLOCO ENTRE UMA QUANTIDADE E A PRÃ“XIMA
    // ========================================================

    for (let i = 0; i < matches.length; i++) {

        const current = matches[i];

        const quantity = Number(
            current[1].replace(",", ".")
        );

        const unit = current[2].toLowerCase();

        const startAfterQuantity =
            current.index + current[0].length;

        const endBeforeNext =
            i + 1 < matches.length
                ? matches[i + 1].index
                : original.length;

        let afterQuantity =
            original.substring(
                startAfterQuantity,
                endBeforeNext
            );


        // ====================================================
        // IMPORTANTE:
        // Separa o nome do alimento de "no almoÃ§o",
        // "no jantar", "de manhÃ£", etc.
        // ====================================================

        afterQuantity = afterQuantity
            .split(/\b(?:no|na|nos|nas)\s+(?:cafe|cafÃ©|almoco|almoÃ§o|jantar|janta|lanche|ceia|refeicao|refeiÃ§Ã£o)\b/i)[0]
            .split(/\b(?:hoje|agora|depois|mais tarde)\b/i)[0];


        // ----------------------------------------------------
        // Remove conectores no comeÃ§o
        // ----------------------------------------------------

        afterQuantity = afterQuantity
            .replace(
                /^\s*(?:de|do|da|dos|das|e|com)\s+/i,
                ""
            )
            .trim();


        // ----------------------------------------------------
        // Caso tenha pontuaÃ§Ã£o
        // ----------------------------------------------------

        afterQuantity = afterQuantity
            .replace(/^[,:;.!?]+\s*/, "")
            .trim();


        // ----------------------------------------------------
        // Remove contexto final de refeiÃ§Ã£o
        // ----------------------------------------------------

        afterQuantity = afterQuantity
            .replace(
                /\s+\b(?:no|na|nos|nas)\s+(?:cafe|cafÃ©|almoco|almoÃ§o|jantar|janta|lanche|ceia|refeicao|refeiÃ§Ã£o)\b.*$/i,
                ""
            )
            .trim();

        if (!afterQuantity) {
            continue;
        }


        // ====================================================
        // TENTA ENCONTRAR O ALIMENTO
        // ====================================================

        let food = findFood(afterQuantity);


        // ----------------------------------------------------
        // Tentativa com nome limpo
        // ----------------------------------------------------

        if (!food) {

            const cleaned = cleanFoodName(afterQuantity);

            if (cleaned) {
                food = findFood(cleaned);
            }
        }


        // ----------------------------------------------------
        // Tenta palavra por palavra / combinaÃ§Ãµes
        // ----------------------------------------------------

        if (!food) {

            const cleaned = cleanFoodName(afterQuantity);

            const words = cleaned
                .split(/\s+/)
                .filter(Boolean);

            // Tenta da maior combinaÃ§Ã£o para a menor
            for (
                let size = words.length;
                size >= 1 && !food;
                size--
            ) {

                for (
                    let start = 0;
                    start <= words.length - size;
                    start++
                ) {

                    const candidate =
                        words
                            .slice(start, start + size)
                            .join(" ");

                    food = findFood(candidate);

                    if (food) {
                        break;
                    }
                }
            }
        }


        // ----------------------------------------------------
        // NÃ£o encontrou
        // ----------------------------------------------------

        if (!food) {

            console.log(
                `âš ï¸ Alimento nÃ£o encontrado: "${afterQuantity}"`
            );

            continue;
        }


        // ====================================================
        // CONVERTE PARA GRAMAS
        // ====================================================

        let grams = quantity;

        if (
            unit === "kg" ||
            unit === "quilo" ||
            unit === "quilos"
        ) {
            grams = quantity * 1000;
        }

        if (
            unit === "ml" ||
            unit === "l" ||
            unit === "litro" ||
            unit === "litros"
        ) {

            if (
                unit === "l" ||
                unit === "litro" ||
                unit === "litros"
            ) {
                grams = quantity * 1000;
            }

            // Para alimentos lÃ­quidos, usamos aproximaÃ§Ã£o
            // 1ml â‰ˆ 1g no protÃ³tipo.
        }


        // ====================================================
        // CALCULA NUTRIÃ‡ÃƒO
        // ====================================================

        const nutrition =
            calculateFoodNutrition(
                food,
                grams
            );


        items.push({

            food,

            foodName:
                food.name ||
                food.foodName ||
                afterQuantity,

            grams,

            calories:
                Number(nutrition.calories || 0),

            protein:
                Number(nutrition.protein || 0),

            carbs:
                Number(nutrition.carbs || 0),

            fat:
                Number(nutrition.fat || 0)
        });
    }


    // ========================================================
    // 3. REMOVE DUPLICADOS
    // ========================================================

    const unique = [];

    for (const item of items) {

        const alreadyExists =
            unique.some(existing =>
                existing.foodName === item.foodName &&
                existing.grams === item.grams
            );

        if (!alreadyExists) {
            unique.push(item);
        }
    }

    return unique;
}


// ============================================================
// SOMA NUTRIÃ‡ÃƒO
// ============================================================

function sumNutrition(items) {

    return items.reduce(
        (total, item) => {

            total.calories += Number(item.calories || 0);
            total.protein += Number(item.protein || 0);
            total.carbs += Number(item.carbs || 0);
            total.fat += Number(item.fat || 0);

            return total;
        },
        {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        }
    );
}


// ============================================================
// REGISTRA REFEIÃ‡ÃƒO NO BANCO
// ============================================================

async function registerFoodMessage(
    phone,
    message
) {

    const meal = detectMealType(message);

    const items =
        extractFoodItems(message);

    console.log("Alimentos identificados:");

    console.log(
        items.map(item => ({
            foodName: item.foodName,
            grams: item.grams,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat
        }))
    );

    if (!items.length) {

        return {
            success: false,
            message:
                "NÃ£o consegui identificar os alimentos e quantidades. ðŸ˜•\n\n" +
                "Exemplo:\n" +
                "*Comi 150g de arroz, 100g de feijÃ£o e 200g de frango no almoÃ§o.*"
        };
    }

    console.log("Registrando refeiÃ§Ã£o...");
    console.log("Tipo:", meal.type);
    console.log("Nome:", meal.name);
    console.log("Quantidade de alimentos:", items.length);

    const client =
        await pool.connect();

    try {

        await client.query("BEGIN");

        for (const item of items) {

            await client.query(
                `
                INSERT INTO meal_entries
                (
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
                VALUES
                (
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
                `,
                [
                    phone,
                    meal.type,
                    meal.name,
                    item.foodName,
                    item.grams,
                    item.calories,
                    item.protein,
                    item.carbs,
                    item.fat
                ]
            );
        }

        await client.query("COMMIT");

        console.log(
            "RefeiÃ§Ã£o registrada com sucesso."
        );

        return {
            success: true,
            meal,
            items,
            nutrition: sumNutrition(items)
        };

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Erro ao registrar refeiÃ§Ã£o:",
            error
        );

        throw error;

    } finally {

        client.release();
    }
}


// ============================================================
// RESUMO DIÃRIO
// ============================================================

async function getDailySummary(phone) {

    const result = await pool.query(
        `
        SELECT
            COALESCE(SUM(calories), 0) AS calories,
            COALESCE(SUM(protein), 0) AS protein,
            COALESCE(SUM(carbs), 0) AS carbs,
            COALESCE(SUM(fat), 0) AS fat,
            COUNT(*) AS food_count
        FROM meal_entries
        WHERE phone = $1
          AND created_at::date = CURRENT_DATE
        `,
        [phone]
    );

    const row = result.rows[0];

    return {
        calories: Number(row.calories || 0),
        protein: Number(row.protein || 0),
        carbs: Number(row.carbs || 0),
        fat: Number(row.fat || 0),
        foodCount: Number(row.food_count || 0)
    };
}


// ============================================================
// REFEIÃ‡Ã•ES DO DIA
// ============================================================

async function getMealsToday(phone) {

    const result = await pool.query(
        `
        SELECT
            meal_type,
            meal_name,
            COUNT(*) AS food_count,
            COALESCE(SUM(calories), 0) AS calories,
            COALESCE(SUM(protein), 0) AS protein,
            COALESCE(SUM(carbs), 0) AS carbs,
            COALESCE(SUM(fat), 0) AS fat
        FROM meal_entries
        WHERE phone = $1
          AND created_at::date = CURRENT_DATE
        GROUP BY meal_type, meal_name
        ORDER BY MIN(created_at)
        `,
        [phone]
    );

    return result.rows.map(row => ({
        mealType: row.meal_type,
        mealName: row.meal_name,
        foodCount: Number(row.food_count || 0),
        calories: Number(row.calories || 0),
        protein: Number(row.protein || 0),
        carbs: Number(row.carbs || 0),
        fat: Number(row.fat || 0)
    }));
}


// ============================================================
// ÃšLTIMA REFEIÃ‡ÃƒO
// ============================================================

async function getLastMeal(phone) {

    const result = await pool.query(
        `
        SELECT *
        FROM meal_entries
        WHERE phone = $1
          AND created_at::date = CURRENT_DATE
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        `,
        [phone]
    );

    return result.rows[0] || null;
}


// ============================================================
// APAGAR ÃšLTIMA REFEIÃ‡ÃƒO
// ============================================================

async function deleteLastMeal(phone) {

    const last = await getLastMeal(phone);

    if (!last) {

        return {
            success: false,
            message:
                "NÃ£o encontrei nenhuma refeiÃ§Ã£o registrada hoje."
        };
    }

    /*
     * A refeiÃ§Ã£o Ã© identificada pelo intervalo de tempo
     * prÃ³ximo ao Ãºltimo registro.
     */

    const result = await pool.query(
        `
        DELETE FROM meal_entries
        WHERE phone = $1
          AND created_at::date = CURRENT_DATE
          AND meal_type = $2
          AND meal_name = $3
          AND created_at >= $4 - INTERVAL '2 seconds'
          AND created_at <= $4 + INTERVAL '2 seconds'
        `,
        [
            phone,
            last.meal_type,
            last.meal_name,
            last.created_at
        ]
    );

    return {
        success: true,
        deleted: result.rowCount,
        mealName: last.meal_name
    };
}


// ============================================================
// LIMPAR CONSUMO DO DIA
// ============================================================

async function clearDailyMeals(phone) {

    const result = await pool.query(
        `
        DELETE FROM meal_entries
        WHERE phone = $1
          AND created_at::date = CURRENT_DATE
        `,
        [phone]
    );

    return result.rowCount;
}
// ============================================================
// FORMATA RESUMO
// ============================================================

function formatDailySummary(
    summary,
    profile,
    meals
) {

    const targetCalories =
        Number(profile?.targetCalories || 0);

    const targetProtein =
        Number(profile?.macros?.protein || 0);

    const targetCarbs =
        Number(profile?.macros?.carbs || 0);

    const targetFat =
        Number(profile?.macros?.fat || 0);

    const remainingCalories =
        Math.max(
            0,
            targetCalories - summary.calories
        );

    const remainingProtein =
        Math.max(
            0,
            targetProtein - summary.protein
        );

    const remainingCarbs =
        Math.max(
            0,
            targetCarbs - summary.carbs
        );

    const remainingFat =
        Math.max(
            0,
            targetFat - summary.fat
        );

    let text = "";

    text += "ðŸ“Š *CONSUMO DE HOJE*\n\n";

    text +=
        `ðŸ”¥ *Calorias:* ${summary.calories.toFixed(0)} / ${targetCalories.toFixed(0)} kcal\n`;

    text +=
        `ðŸ¥© *ProteÃ­na:* ${summary.protein.toFixed(1)} / ${targetProtein.toFixed(0)}g\n`;

    text +=
        `ðŸš *Carboidratos:* ${summary.carbs.toFixed(1)} / ${targetCarbs.toFixed(0)}g\n`;

    text +=
        `ðŸ¥‘ *Gorduras:* ${summary.fat.toFixed(1)} / ${targetFat.toFixed(0)}g\n\n`;

    text += "*RESTANTE DO DIA*\n\n";

    text +=
        `ðŸ”¥ ${remainingCalories.toFixed(0)} kcal\n`;

    text +=
        `ðŸ¥© ${remainingProtein.toFixed(1)}g proteÃ­na\n`;

    text +=
        `ðŸš ${remainingCarbs.toFixed(1)}g carboidratos\n`;

    text +=
        `ðŸ¥‘ ${remainingFat.toFixed(1)}g gorduras\n`;

    if (meals.length) {

        text += "\n\nðŸ½ï¸ *REFEIÃ‡Ã•ES REGISTRADAS*\n\n";

        for (const meal of meals) {

            text +=
                `â€¢ *${meal.mealName}* - ${meal.calories.toFixed(0)} kcal\n`;
        }
    }

    return text;
}


// ============================================================
// CONTEXTO DIÃRIO PARA IA
// ============================================================

async function buildDailyContext(
    phone,
    profile
) {

    const summary =
        await getDailySummary(phone);

    const meals =
        await getMealsToday(phone);

    return {
        summary,
        meals,
        target: {
            calories:
                Number(profile?.targetCalories || 0),

            protein:
                Number(profile?.macros?.protein || 0),

            carbs:
                Number(profile?.macros?.carbs || 0),

            fat:
                Number(profile?.macros?.fat || 0)
        }
    };
}


// ============================================================
// CONTEXTO DO PLANO ALIMENTAR
// ============================================================

async function buildMealPlanContext(profile) {

    if (
        !profile ||
        !profile.targetCalories ||
        !profile.macros
    ) {
        return null;
    }

    try {

        const mealPlan =
            generateMealPlan(profile);

        return {
            mealPlan,
            formatted:
                formatMealPlanForAI(mealPlan)
        };

    } catch (error) {

        console.error(
            "Erro ao gerar plano alimentar:",
            error
        );

        return null;
    }
}


// ============================================================
// GERAR PERFIL NUTRICIONAL
// ============================================================

function getNutritionProfile(user) {

    if (!user) {
        return null;
    }

    const weight = Number(user.weight);
    const height = Number(user.height);
    const age = Number(user.age);

    const activityLevel = Number(
        user.activityLevel !== undefined
            ? user.activityLevel
            : user.activity_level
    );

    if (
        !Number.isFinite(weight) ||
        weight <= 0 ||
        !Number.isFinite(height) ||
        height <= 0 ||
        !Number.isFinite(age) ||
        age <= 0 ||
        !user.gender ||
        !Number.isFinite(activityLevel)
    ) {
        return null;
    }

    try {

        return calculateNutritionProfile({
            weight,
            height,
            age,
            gender: user.gender,
            goal: user.goal || "manter peso",
            activityLevel
        });

    } catch (error) {

        console.error(
            "Erro ao calcular perfil nutricional:",
            error
        );

        return null;
    }
}


// ============================================================
// FORMATA RESPOSTA DE REFEIÃ‡ÃƒO
// ============================================================

function formatMealResponse(
    result,
    dailySummary,
    profile
) {

    const nutrition =
        result.nutrition;

    let text = "";

    text +=
        `âœ… *${result.meal.name} registrada!*\n\n`;

    for (const item of result.items) {

        text +=
            `â€¢ ${item.grams}g de ${item.foodName}\n`;
    }

    text += "\n";

    text +=
        `ðŸ”¥ ${nutrition.calories.toFixed(0)} kcal\n`;

    text +=
        `ðŸ¥© ${nutrition.protein.toFixed(1)}g proteÃ­na\n`;

    text +=
        `ðŸš ${nutrition.carbs.toFixed(1)}g carboidratos\n`;

    text +=
        `ðŸ¥‘ ${nutrition.fat.toFixed(1)}g gorduras\n`;

    if (profile) {

        text +=
            "\nðŸ“Š *TOTAL DE HOJE APÃ“S ESSA REFEIÃ‡ÃƒO:*\n";

        text +=
            `ðŸ”¥ ${dailySummary.calories.toFixed(0)} / ${Number(profile.targetCalories).toFixed(0)} kcal\n`;

        text +=
            `ðŸ¥© ${dailySummary.protein.toFixed(1)} / ${Number(profile.macros.protein).toFixed(0)}g proteÃ­na\n`;

        text +=
            `ðŸš ${dailySummary.carbs.toFixed(1)} / ${Number(profile.macros.carbs).toFixed(0)}g carboidratos\n`;

        text +=
            `ðŸ¥‘ ${dailySummary.fat.toFixed(1)} / ${Number(profile.macros.fat).toFixed(0)}g gorduras\n`;
    }

    return text;
}


// ============================================================
// GERAR RESPOSTA
// ============================================================

async function generateResponse(
    phone,
    userMessage,
    user,
    profile,
    history = []
) {

    const dailyContext =
        await buildDailyContext(
            phone,
            profile
        );

    const mealPlanContext =
        await buildMealPlanContext(
            profile
        );

    const messages = [

        {
            role: "system",
            content: SYSTEM_PROMPT
        },

        {
            role: "system",
            content:
                `PERFIL NUTRICIONAL ATUAL:\n${JSON.stringify(
                    profile || {},
                    null,
                    2
                )}`
        },

        {
            role: "system",
            content:
                `CONSUMO DE HOJE:\n${JSON.stringify(
                    dailyContext,
                    null,
                    2
                )}`
        }
    ];

    if (mealPlanContext) {

        messages.push({
            role: "system",
            content:
                `PLANO ALIMENTAR:\n${mealPlanContext.formatted}`
        });
    }

    for (const item of history || []) {

        if (
            item.role === "user" ||
            item.role === "assistant"
        ) {

            messages.push({
                role: item.role,
                content: item.content
            });
        }
    }

    messages.push({
        role: "user",
        content: userMessage
    });

    return callOpenAI(messages);
}


// ============================================================
// PROCESSAMENTO PRINCIPAL
// ============================================================

async function processUserMessage(
    phone,
    message
) {

    console.log("==========================================");
    console.log("PROCESSANDO MENSAGEM");
    console.log("==========================================");

    console.log("Telefone:", phone);
    console.log("Mensagem:", message);

    const intent =
        detectIntent(message);

    console.log(
        "IntenÃ§Ã£o detectada:",
        intent
    );


    // ========================================================
    // USUÃRIO
    // ========================================================

    let user =
        await getUserByPhone(phone);

    if (!user) {

        user =
            await createUser({
                phone
            });
    }


    // ========================================================
    // EXTRAI DADOS PESSOAIS
    // ========================================================

    const extracted =
        cleanUserData(
            extractUserData(message)
        );

    if (Object.keys(extracted).length) {

        await updateUser(
            phone,
            extracted
        );

        console.log(
            "ðŸ‘¤ Dados atualizados:",
            extracted
        );

        user = {
            ...user,
            ...extracted
        };
    }


    // ========================================================
    // PERFIL
    // ========================================================

    const profile =
        getNutritionProfile(user);

    console.log(
        "Perfil nutricional:"
    );

    console.log(profile);


    // ========================================================
    // REGISTRAR ALIMENTO
    // ========================================================

    if (intent === "food_log") {

        const result =
            await registerFoodMessage(
                phone,
                message
            );

        if (!result.success) {

            await saveMessage(
                phone,
                "user",
                message
            );

            await saveMessage(
                phone,
                "assistant",
                result.message
            );

            return {
                message: result.message
            };
        }

        const dailySummary =
            await getDailySummary(phone);

        const response =
            formatMealResponse(
                result,
                dailySummary,
                profile
            );

        await saveMessage(
            phone,
            "user",
            message
        );

        await saveMessage(
            phone,
            "assistant",
            response
        );

        return {
            message: response
        };
    }


    // ========================================================
    // RESUMO DIÃRIO
    // ========================================================

    if (intent === "daily_summary") {

        const summary =
            await getDailySummary(phone);

        const meals =
            await getMealsToday(phone);

        const response =
            formatDailySummary(
                summary,
                profile,
                meals
            );

        await saveMessage(
            phone,
            "user",
            message
        );

        await saveMessage(
            phone,
            "assistant",
            response
        );

        return {
            message: response
        };
    }


    // ========================================================
    // APAGAR ÃšLTIMA REFEIÃ‡ÃƒO
    // ========================================================

    if (intent === "delete_last") {

        const result =
            await deleteLastMeal(phone);

        let response;

        if (!result.success) {

            response =
                `âŒ ${result.message}`;

        } else {

            response =
                `ðŸ—‘ï¸ *Ãšltima refeiÃ§Ã£o apagada!*\n\n` +
                `ðŸ½ï¸ ${result.mealName}\n` +
                `Itens removidos: ${result.deleted}`;
        }

        await saveMessage(
            phone,
            "user",
            message
        );

        await saveMessage(
            phone,
            "assistant",
            response
        );

        return {
            message: response
        };
    }


    // ========================================================
    // LIMPAR DIA
    // ========================================================

    if (intent === "clear_daily") {

        const deleted =
            await clearDailyMeals(phone);

        const response =
            deleted > 0
                ? `ðŸ—‘ï¸ *Consumo de hoje apagado!*\n\nForam removidos ${deleted} registros.`
                : `â„¹ï¸ NÃ£o havia refeiÃ§Ãµes registradas hoje.`;

        await saveMessage(
            phone,
            "user",
            message
        );

        await saveMessage(
            phone,
            "assistant",
            response
        );

        return {
            message: response
        };
    }


    // ========================================================
    // PLANO ALIMENTAR
    // ========================================================
if (intent === "meal_plan") {

    if (!profile) {

        const response =
            "Para montar seu plano alimentar preciso de alguns dados:\n\n" +
            "â€¢ Idade\n" +
            "â€¢ Peso\n" +
            "â€¢ Altura\n" +
            "â€¢ Sexo\n" +
            "â€¢ Quantidade de treinos por semana\n" +
            "â€¢ Objetivo";

        return {
            message: response
        };
    }

    try {

        // --------------------------------------------------------
        // VERIFICAR O CONSUMO DE HOJE
        // --------------------------------------------------------

        const dailySummary =
            await getDailySummary(phone);

        const mealsToday =
            await getMealsToday(phone);

        const targetCalories =
            Number(profile.targetCalories || 0);

        const consumedCalories =
            Number(dailySummary.calories || 0);

        const remainingCalories =
            Math.max(
                0,
                Math.round(
                    targetCalories - consumedCalories
                )
            );

        const targetProtein =
            Number(profile.macros?.protein || 0);

        const targetCarbs =
            Number(profile.macros?.carbs || 0);

        const targetFat =
            Number(profile.macros?.fat || 0);

        const consumedProtein =
            Number(dailySummary.protein || 0);

        const consumedCarbs =
            Number(dailySummary.carbs || 0);

        const consumedFat =
            Number(dailySummary.fat || 0);

        const remainingProtein =
            Math.max(
                0,
                Math.round(
                    targetProtein - consumedProtein
                )
            );

        const remainingCarbs =
            Math.max(
                0,
                Math.round(
                    targetCarbs - consumedCarbs
                )
            );

        const remainingFat =
            Math.max(
                0,
                Math.round(
                    targetFat - consumedFat
                )
            );


        // --------------------------------------------------------
        // JÃ ATINGIU A META
        // --------------------------------------------------------

        if (remainingCalories <= 0) {

            const response =
                `ðŸŽ¯ *META DIÃRIA ATINGIDA!*\n\n` +
                `ðŸ”¥ Meta: ${targetCalories} kcal\n` +
                `ðŸ”¥ Consumido: ${Math.round(consumedCalories)} kcal\n\n` +
                `VocÃª jÃ¡ atingiu ou ultrapassou sua meta de hoje. ` +
                `NÃ£o vou montar outro plano para evitar aumentar ` +
                `desnecessariamente o consumo do dia.`;

            await saveMessage(
                phone,
                "user",
                message
            );

            await saveMessage(
                phone,
                "assistant",
                response
            );

            return {
                message: response
            };
        }


        // --------------------------------------------------------
        // NÃƒO COMEU NADA HOJE
        // GERA O PLANO COMPLETO NORMALMENTE
        // --------------------------------------------------------

        if (consumedCalories === 0) {

            const mealPlan =
                generateMealPlan(profile);

            const response =
                formatMealPlanForAI(
                    mealPlan
                );

            await saveMessage(
                phone,
                "user",
                message
            );

            await saveMessage(
                phone,
                "assistant",
                response
            );

            return {
                message: response
            };
        }


        // --------------------------------------------------------
        // JÃ COMEU HOJE
        // GERAR SOMENTE O RESTANTE DO DIA
        // --------------------------------------------------------

        const registeredMealKeys =
            new Set(
                mealsToday
                    .map(meal => {

                        if (
                            meal.mealType ===
                            "lanche_manha"
                        ) {
                            return "lanche_da_manha";
                        }

                        if (
                            meal.mealType ===
                            "lanche_tarde"
                        ) {
                            return "lanche_da_tarde";
                        }

                        return meal.mealType;
                    })
                    .filter(Boolean)
            );


        // --------------------------------------------------------
        // ORDEM DAS REFEIÃ‡Ã•ES
        // --------------------------------------------------------

const currentHour =
    Number(
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                timeZone: "America/Bahia",
                hour: "2-digit",
                hour12: false
            }
        ).format(new Date())
    );

let mealOrder = [];

if (currentHour < 10) {

    mealOrder = [
        "cafe_da_manha",
        "lanche_da_manha",
        "almoco",
        "lanche_da_tarde",
        "jantar",
        "ceia"
    ];

} else if (currentHour < 12) {

    mealOrder = [
        "lanche_da_manha",
        "almoco",
        "lanche_da_tarde",
        "jantar",
        "ceia"
    ];

} else if (currentHour < 15) {

    mealOrder = [
        "almoco",
        "lanche_da_tarde",
        "jantar",
        "ceia"
    ];

} else if (currentHour < 18) {

    mealOrder = [
        "lanche_da_tarde",
        "jantar",
        "ceia"
    ];

} else if (currentHour < 21) {

    mealOrder = [
        "jantar",
        "ceia"
    ];

} else {

    mealOrder = [
        "ceia"
    ];
}


        // --------------------------------------------------------
        // REFEIÃ‡Ã•ES AINDA NÃƒO REGISTRADAS
        // --------------------------------------------------------

        const remainingMealTypes =
            mealOrder.filter(
                mealKey =>
                    !registeredMealKeys.has(
                        mealKey
                    )
            );


        // --------------------------------------------------------
        // SE NÃƒO CONSEGUIR IDENTIFICAR REFEIÃ‡Ã•ES,
        // GERA UMA ÃšNICA REFEIÃ‡ÃƒO PARA O SALDO
        // --------------------------------------------------------

        if (
            remainingMealTypes.length === 0
        ) {

            const mealKey =
                "lanche_da_tarde";

            remainingMealTypes.push(
                mealKey
            );
        }


        // --------------------------------------------------------
        // DISTRIBUIR O SALDO ENTRE AS REFEIÃ‡Ã•ES RESTANTES
        // --------------------------------------------------------

        const caloriesPerMeal =
            remainingCalories /
            remainingMealTypes.length;

        const proteinPerMeal =
            remainingProtein /
            remainingMealTypes.length;

        const carbsPerMeal =
            remainingCarbs /
            remainingMealTypes.length;

        const fatPerMeal =
            remainingFat /
            remainingMealTypes.length;


        // --------------------------------------------------------
        // GERAR CADA REFEIÃ‡ÃƒO
        // --------------------------------------------------------

        const generatedMeals = {};

        for (
            const mealKey of remainingMealTypes
        ) {

            const mealTarget = {

                calories:
                    Math.round(
                        caloriesPerMeal
                    ),

                protein:
                    Math.round(
                        proteinPerMeal
                    ),

                carbs:
                    Math.round(
                        carbsPerMeal
                    ),

                fat:
                    Math.round(
                        fatPerMeal
                    )
            };


            const meal =
                generateMeal(
                    mealKey,
                    mealTarget
                );


            generatedMeals[mealKey] =
                meal;
        }


        // --------------------------------------------------------
        // CALCULAR NUTRIÃ‡ÃƒO DO PLANO GERADO
        // --------------------------------------------------------

        autoAdjustMealPlan(
    generatedMeals,
    {
        protein: remainingProtein,
        carbs: remainingCarbs,
        fat: remainingFat
    },
    remainingCalories
);

const generatedNutrition =
    calculatePlanNutrition(
        generatedMeals
    );


        // --------------------------------------------------------
        // CALCULAR DIFERENÃ‡AS
        // --------------------------------------------------------

        const differences =
            calculatePlanDifferences(
                generatedNutrition,
                {
                    calories:
                        remainingCalories,

                    protein:
                        remainingProtein,

                    carbs:
                        remainingCarbs,

                    fat:
                        remainingFat
                }
            );


        // --------------------------------------------------------
        // CRIAR OBJETO DE PLANO COMPATÃVEL
        // COM formatMealPlanForAI()
        // --------------------------------------------------------

        const remainingPlan = {

            targetCalories:
                remainingCalories,

            macros: {

                protein:
                    remainingProtein,

                carbs:
                    remainingCarbs,

                fat:
                    remainingFat
            },

            meals:
                generatedMeals,

            daily:
                generatedNutrition,

            differences:
                differences,

            withinTolerance:
                false
        };


        // --------------------------------------------------------
        // FORMATAR
        // --------------------------------------------------------

        const formattedPlan =
            formatMealPlanForAI(
                remainingPlan
            );


        // --------------------------------------------------------
        // RESPOSTA FINAL
        // --------------------------------------------------------

        const response =
            `ðŸ“Š *SALDO DO SEU DIA*\n\n` +

            `ðŸ”¥ *Meta:* ${targetCalories} kcal\n` +

            `ðŸ”¥ *Consumido:* ${Math.round(
                consumedCalories
            )} kcal\n` +

            `ðŸ”¥ *Restante:* ${remainingCalories} kcal\n\n` +

            `ðŸ¥© *ProteÃ­na restante:* ${remainingProtein}g\n` +

            `ðŸš *Carboidratos restantes:* ${remainingCarbs}g\n` +

            `ðŸ¥‘ *Gorduras restantes:* ${remainingFat}g\n\n` +

            `Como vocÃª jÃ¡ fez refeiÃ§Ãµes hoje, ` +

            `montei apenas o restante do seu plano alimentar:\n\n` +

            formattedPlan;


        // --------------------------------------------------------
        // SALVAR CONVERSA
        // --------------------------------------------------------

        await saveMessage(
            phone,
            "user",
            message
        );

        await saveMessage(
            phone,
            "assistant",
            response
        );


        return {
            message: response
        };

    } catch (error) {

        console.error(
            "Erro ao gerar plano alimentar:",
            error
        );

        console.error(
            "STACK:",
            error.stack
        );

        return {
            message:
                "NÃ£o consegui montar seu plano alimentar agora. Tente novamente."
        };
    }
}


// ========================================================
// NUTRIÃ‡ÃƒO / OBJETIVO
// ========================================================

if (
    intent === "nutrition" ||
    intent === "goal"
) {

    if (!profile) {

        const missing = [];

        if (!user?.age) {
            missing.push("idade");
        }

        if (!user?.weight) {
            missing.push("peso");
        }

        if (!user?.height) {
            missing.push("altura");
        }

        if (!user?.gender) {
            missing.push("sexo");
        }

        if (
            user?.activityLevel === undefined ||
            user?.activityLevel === null
        ) {

            missing.push(
                "quantidade de treinos por semana"
            );
        }

        const response =
            "Para calcular seu perfil nutricional preciso de:\n\n" +
            missing
                .map(item => `â€¢ ${item}`)
                .join("\n");

        return {
            message: response
        };
    }
}


// ========================================================
// CHAT NORMAL
// ========================================================

const history =
    await getConversationHistory(
        phone,
        20
    );

const response =
    await generateResponse(
        phone,
        message,
        user,
        profile,
        history
    );

await saveMessage(
    phone,
    "user",
    message
);

await saveMessage(
    phone,
    "assistant",
    response
);

return {
    message: response
};
}


// ============================================================
// FUNÃ‡ÃƒO ASK
// ============================================================

async function ask(
    phone,
    message
) {

    return processUserMessage(
        phone,
        message
    );
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    ask,
    processUserMessage,
    generateResponse,
    extractUserData,
    cleanUserData,
    detectIntent,
    detectMealType,
    extractFoodItems,
    getNutritionProfile,
    getDailySummary,
    getMealsToday,
    getLastMeal,
    deleteLastMeal,
    clearDailyMeals,
    formatDailySummary
};

