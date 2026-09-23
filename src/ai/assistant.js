const config = require("../config/env");

const {
    getUserByPhone,
    createUser,
    updateUser,
    updateOnboardingStep,
    completeOnboarding
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
// CONFIGURAÇÃO DA IA
// ============================================================

const SYSTEM_PROMPT = `
Você é uma assistente virtual de nutrição e personal trainer.

Seu objetivo é ajudar o usuário com:

- alimentação
- controle de calorias
- macronutrientes
- perda de gordura
- ganho de massa muscular
- manutenção de peso
- refeições
- acompanhamento diário
- treinos
- evolução física
- organização alimentar

REGRAS IMPORTANTES:

1. Nunca invente alimentos, calorias ou valores nutricionais quando os dados do sistema estiverem disponíveis.

2. Quando houver dados nutricionais calculados pelo sistema, utilize esses dados.

3. Seja objetiva, clara e amigável.

4. Não faça diagnóstico médico.

5. Caso o usuário relate alguma condição médica, oriente a procurar profissional de saúde.

6. Quando o usuário registrar uma refeição, o sistema fará o cálculo automaticamente.

7. Não diga que registrou uma refeição se ela não tiver sido realmente registrada.

8. Não invente informações sobre o consumo diário.

9. Quando o usuário perguntar quanto consumiu no dia, utilize os dados fornecidos pelo sistema.

10. Responda em português do Brasil.

11. Use emojis de forma moderada.

12. Para objetivos de perda de gordura, incentive consistência e déficit calórico adequado.

13. Para ganho de massa, priorize proteína adequada, treinamento e ingestão energética compatível.

14. Nunca substitua orientação médica, nutricional ou profissional.
`;


// ============================================================
// OPENAI
// ============================================================

async function callOpenAI(messages) {

    if (!config.openai || !config.openai.apiKey) {
        throw new Error("OPENAI_API_KEY não configurada.");
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
        "Não consegui gerar uma resposta."
    );
}


// ============================================================
// EXTRAÇÃO DE DADOS DO USUÁRIO
// ============================================================

    // --------------------------------------------------------
    function extractUserData(message) {

    const text = normalizeText(message);
    const data = {};

    // ========================================================
    // NOME
    // ========================================================

    const trimmedMessage = message
        .trim()
        .replace(/\s+/g, " ");

    const nameMatch = trimmedMessage.match(
        /^(?:meu nome é|meu nome e|meu nome:|nome é|nome:|eu sou|sou)\s+(.+)$/i
    );

    if (nameMatch) {

        const name = nameMatch[1].trim();

        if (name.length >= 2 && name.length <= 100) {
            data.name = name;
        }

    } else if (
        /^[A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,4}$/.test(trimmedMessage)
    ) {

        data.name = trimmedMessage;
    }


    // ========================================================
    // IDADE
    // ========================================================

    const ageMatch = text.match(
        /(?:tenho|idade de|idade)\s+(\d{1,3})\s*(?:anos?)?/i
    );

    if (ageMatch) {
        data.age = Number(ageMatch[1]);
    } else if (/^\d{1,3}$/.test(trimmedMessage)) {
        const value = Number(trimmedMessage);

        if (value >= 10 && value <= 100) {
            data.age = value;
        }
    }


    // ========================================================
    // PESO
    // ========================================================

    const weightMatch = text.match(
        /(?:peso|pesando|estou com)\s*(?:de)?\s*(\d+(?:[.,]\d+)?)\s*(?:kg|quilo|quilos)?/i
    );

    if (weightMatch) {
        data.weight = Number(
            weightMatch[1].replace(",", ".")
        );
    } else if (/^\d{2,3}(?:[.,]\d+)?$/.test(trimmedMessage)) {
        const value = Number(
            trimmedMessage.replace(",", ".")
        );

        if (value >= 30 && value <= 300) {
            data.weight = value;
        }
    }


    // ========================================================
    // ALTURA
    // ========================================================

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


    // ========================================================
    // SEXO
    // ========================================================

    if (/\b(homem|masculino|sou homem)\b/i.test(text)) {
        data.gender = "Homem";
    }

    if (/\b(mulher|feminino|sou mulher)\b/i.test(text)) {
        data.gender = "Mulher";
    }


    // ========================================================
    // OBJETIVO
    // ========================================================

    if (
        /(perder gordura|perder peso|emagrecer|secar|diminuir gordura)/i.test(text)
    ) {
        data.goal = "perder gordura";
    }

    if (
        /(ganhar massa|ganhar músculo|ganhar musculo|hipertrofia)/i.test(text)
    ) {
        data.goal = "ganhar massa";
    }

    if (
        /(manter peso|manutenção|manutencao)/i.test(text)
    ) {
        data.goal = "manter peso";
    }


    // ========================================================
    // TREINOS POR SEMANA
    // ========================================================

    const trainingMatch = text.match(
        /(\d+)\s*(?:vezes?|dias?)\s*(?:por semana|na semana)/i
    );

    if (trainingMatch) {
        data.activityLevel = Number(trainingMatch[1]);
    }


    return data;
}

// LIMPEZA DOS DADOS
// ============================================================

function cleanUserData(data) {

    const clean = {};

    if (
        typeof data.name === "string" &&
        data.name.trim().length >= 2
    ) {
        clean.name = data.name.trim();
    }

    if (
        Number.isFinite(Number(data.age)) &&
        Number(data.age) >= 10 &&
        Number(data.age) <= 100
    ) {
        clean.age = Number(data.age);
    }

    if (
        Number.isFinite(Number(data.weight)) &&
        Number(data.weight) >= 30 &&
        Number(data.weight) <= 300
    ) {
        clean.weight = Number(data.weight);
    }

    if (
        Number.isFinite(Number(data.height)) &&
        Number(data.height) >= 1.20 &&
        Number(data.height) <= 2.50
    ) {
        clean.height = Number(data.height);
    }

    if (
        data.gender === "Homem" ||
        data.gender === "Mulher"
    ) {
        clean.gender = data.gender;
    }

    if (typeof data.goal === "string") {
        clean.goal = data.goal.trim();
    }

    if (
        Number.isFinite(Number(data.activityLevel)) &&
        Number(data.activityLevel) >= 0 &&
        Number(data.activityLevel) <= 14
    ) {
        clean.activityLevel = Number(data.activityLevel);
    }

    return clean;
}


// ============================================================
// INTENÇÃO
// ============================================================

function detectIntent(message) {

    const text = normalizeText(message);

    // --------------------------------------------------------
    // APAGAR CONSUMO
    // --------------------------------------------------------

    if (
        /(apagar|limpar|zerar|excluir|deletar).*(consumo|alimentacao|refeições|refeicoes|hoje|dia)/i.test(text) ||
        /(limpar|zerar).*(dia|hoje)/i.test(text)
    ) {
        return "clear_daily";
    }


    // --------------------------------------------------------
    // APAGAR ÚLTIMA REFEIÇÃO
    // --------------------------------------------------------

    if (
        /(apagar|excluir|deletar|remover).*(ultima|última).*(refeição|refeicao|comida)/i.test(text) ||
        /(desfazer|cancelar).*(ultima|última).*(refeição|refeicao)/i.test(text)
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
        /(plano alimentar|dieta|cardapio|cardápio|monte.*dieta|crie.*dieta|meu plano|plano de dieta)/i.test(text)
    ) {
        return "meal_plan";
    }


    // --------------------------------------------------------
    // REGISTRO DE ALIMENTAÇÃO
    // --------------------------------------------------------

    if (
        /(comi|almocei|jantei|lanchei|tomei|bebi|consumi|vou comer|vou tomar|adicione|registrar|registre)/i.test(text) &&
        /(\d+(?:[.,]\d+)?\s*(?:kg|g|gramas?|ml|l|litros?|unidades?|unid|ovo|ovos|banana|bananas|maca|maça|pao|pão))/i.test(text)
    ) {
        return "food_log";
    }


    // --------------------------------------------------------
    // NUTRIÇÃO
    // --------------------------------------------------------

    if (
        /(calorias|caloria|macros|macronutrientes|imc|metabolismo|gasto calorico|gasto calórico|tdee|bmr|nutrição|nutricao)/i.test(text)
    ) {
        return "nutrition";
    }


    // --------------------------------------------------------
    // OBJETIVO
    // --------------------------------------------------------

    if (
        /(quero perder|quero ganhar|quero emagrecer|quero secar|quero ganhar massa|meu objetivo|objetivo é|objetivo e)/i.test(text)
    ) {
        return "goal";
    }

    return "chat";
}


// ============================================================
// TIPO DE REFEIÇÃO
// ============================================================

function detectMealType(message) {

    const text = normalizeText(message);

    if (
        /\b(cafe da manha|cafe|desjejum)\b/i.test(text)
    ) {
        return {
            type: "cafe_da_manha",
            name: "Café da manhã"
        };
    }

    if (
        /\b(lanche da manha)\b/i.test(text)
    ) {
        return {
            type: "lanche_manha",
            name: "Lanche da manhã"
        };
    }

    if (
        /\b(almoço|almoco)\b/i.test(text)
    ) {
        return {
            type: "almoco",
            name: "Almoço"
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
        name: "Refeição"
    };
}


// ============================================================
// PORÇÕES PADRÃO
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
    // Remove contexto de refeição
    // --------------------------------------------------------

    value = value
        .replace(
            /\b(no|na|nos|nas)\s+(cafe|café|almoco|almoço|jantar|janta|lanche|ceia|refeicao|refeição)\b/gi,
            " "
        )

        .replace(
            /\b(cafe|café|almoco|almoço|jantar|janta|lanche|ceia|refeicao|refeição)\b/gi,
            " "
        );


    // --------------------------------------------------------
    // Remove verbos/contextos
    // --------------------------------------------------------

    value = value
        .replace(
            /\b(comi|comer|almocei|almoçar|jantei|jantar|lanchei|lanchar|tomei|tomar|bebi|beber|consumi|consumir|registre|registrar|adicione|adicionar)\b/gi,
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
    // Remove sobras de pontuação
    // --------------------------------------------------------

    value = value
        .replace(/[,:;.!?]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return value;
}


// ============================================================
// IDENTIFICAÇÃO DE ALIMENTOS
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
    // 2. SEPARA CADA BLOCO ENTRE UMA QUANTIDADE E A PRÓXIMA
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
        // Separa o nome do alimento de "no almoço",
        // "no jantar", "de manhã", etc.
        // ====================================================

        afterQuantity = afterQuantity
            .split(/\b(?:no|na|nos|nas)\s+(?:cafe|café|almoco|almoço|jantar|janta|lanche|ceia|refeicao|refeição)\b/i)[0]
            .split(/\b(?:hoje|agora|depois|mais tarde)\b/i)[0];


        // ----------------------------------------------------
        // Remove conectores no começo
        // ----------------------------------------------------

        afterQuantity = afterQuantity
            .replace(
                /^\s*(?:de|do|da|dos|das|e|com)\s+/i,
                ""
            )
            .trim();


        // ----------------------------------------------------
        // Caso tenha pontuação
        // ----------------------------------------------------

        afterQuantity = afterQuantity
            .replace(/^[,:;.!?]+\s*/, "")
            .trim();


        // ----------------------------------------------------
        // Remove contexto final de refeição
        // ----------------------------------------------------

        afterQuantity = afterQuantity
            .replace(
                /\s+\b(?:no|na|nos|nas)\s+(?:cafe|café|almoco|almoço|jantar|janta|lanche|ceia|refeicao|refeição)\b.*$/i,
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
        // Tenta palavra por palavra / combinações
        // ----------------------------------------------------

        if (!food) {

            const cleaned = cleanFoodName(afterQuantity);

            const words = cleaned
                .split(/\s+/)
                .filter(Boolean);

            // Tenta da maior combinação para a menor
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
        // Não encontrou
        // ----------------------------------------------------

        if (!food) {

            console.log(
                `⚠️ Alimento não encontrado: "${afterQuantity}"`
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

            // Para alimentos líquidos, usamos aproximação
            // 1ml ≈ 1g no protótipo.
        }


        // ====================================================
        // CALCULA NUTRIÇÃO
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
// SOMA NUTRIÇÃO
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
// REGISTRA REFEIÇÃO NO BANCO
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
                "Não consegui identificar os alimentos e quantidades. 😕\n\n" +
                "Exemplo:\n" +
                "*Comi 150g de arroz, 100g de feijão e 200g de frango no almoço.*"
        };
    }

    console.log("Registrando refeição...");
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
            "Refeição registrada com sucesso."
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
            "Erro ao registrar refeição:",
            error
        );

        throw error;

    } finally {

        client.release();
    }
}


// ============================================================
// RESUMO DIÁRIO
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
// REFEIÇÕES DO DIA
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
// ÚLTIMA REFEIÇÃO
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
// APAGAR ÚLTIMA REFEIÇÃO
// ============================================================

async function deleteLastMeal(phone) {

    const last = await getLastMeal(phone);

    if (!last) {

        return {
            success: false,
            message:
                "Não encontrei nenhuma refeição registrada hoje."
        };
    }

    /*
     * A refeição é identificada pelo intervalo de tempo
     * próximo ao último registro.
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

    text += "📊 *CONSUMO DE HOJE*\n\n";

    text +=
        `🔥 *Calorias:* ${summary.calories.toFixed(0)} / ${targetCalories.toFixed(0)} kcal\n`;

    text +=
        `🥩 *Proteína:* ${summary.protein.toFixed(1)} / ${targetProtein.toFixed(0)}g\n`;

    text +=
        `🍚 *Carboidratos:* ${summary.carbs.toFixed(1)} / ${targetCarbs.toFixed(0)}g\n`;

    text +=
        `🥑 *Gorduras:* ${summary.fat.toFixed(1)} / ${targetFat.toFixed(0)}g\n\n`;

    text += "*RESTANTE DO DIA*\n\n";

    text +=
        `🔥 ${remainingCalories.toFixed(0)} kcal\n`;

    text +=
        `🥩 ${remainingProtein.toFixed(1)}g proteína\n`;

    text +=
        `🍚 ${remainingCarbs.toFixed(1)}g carboidratos\n`;

    text +=
        `🥑 ${remainingFat.toFixed(1)}g gorduras\n`;

    if (meals.length) {

        text += "\n\n🍽️ *REFEIÇÕES REGISTRADAS*\n\n";

        for (const meal of meals) {

            text +=
                `• *${meal.mealName}* - ${meal.calories.toFixed(0)} kcal\n`;
        }
    }

    return text;
}


// ============================================================
// CONTEXTO DIÁRIO PARA IA
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
// FORMATA RESPOSTA DE REFEIÇÃO
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
        `✅ *${result.meal.name} registrada!*\n\n`;

    for (const item of result.items) {

        text +=
            `• ${item.grams}g de ${item.foodName}\n`;
    }

    text += "\n";

    text +=
        `🔥 ${nutrition.calories.toFixed(0)} kcal\n`;

    text +=
        `🥩 ${nutrition.protein.toFixed(1)}g proteína\n`;

    text +=
        `🍚 ${nutrition.carbs.toFixed(1)}g carboidratos\n`;

    text +=
        `🥑 ${nutrition.fat.toFixed(1)}g gorduras\n`;

    if (profile) {

        text +=
            "\n📊 *TOTAL DE HOJE APÓS ESSA REFEIÇÃO:*\n";

        text +=
            `🔥 ${dailySummary.calories.toFixed(0)} / ${Number(profile.targetCalories).toFixed(0)} kcal\n`;

        text +=
            `🥩 ${dailySummary.protein.toFixed(1)} / ${Number(profile.macros.protein).toFixed(0)}g proteína\n`;

        text +=
            `🍚 ${dailySummary.carbs.toFixed(1)} / ${Number(profile.macros.carbs).toFixed(0)}g carboidratos\n`;

        text +=
            `🥑 ${dailySummary.fat.toFixed(1)} / ${Number(profile.macros.fat).toFixed(0)}g gorduras\n`;
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
    const userDataContext = {
        nome: user?.name || null,
        idade: user?.age || null,
        peso: user?.weight || null,
        altura: user?.height || null,
        sexo: user?.gender || null,
        objetivo: user?.goal || null,
        treinos_por_semana: user?.activityLevel ?? user?.activity_level ?? null
    };
    const messages = [

                {
            role: "system",
            content:
                `DADOS CADASTRADOS DO USUÁRIO:\n${JSON.stringify(
                    userDataContext,
                    null,
                    2
                )}\n\n` +
                `IMPORTANTE: use esses dados para manter a continuidade da conversa. ` +
                `Se o nome já estiver preenchido, NÃO pergunte novamente qual é o nome do usuário.`
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
// ============================================================
// ONBOARDING / CADASTRO DO USUÁRIO
// ============================================================

function getMissingRegistrationFields(user) {

    const missing = [];

    if (!user?.name) {
        missing.push("name");
    }

    if (!(Number(user?.age) > 0)) {
        missing.push("age");
    }

    if (!(Number(user?.weight) > 0)) {
        missing.push("weight");
    }

    if (!(Number(user?.height) > 0)) {
        missing.push("height");
    }

    if (!user?.goal) {
        missing.push("goal");
    }

    if (!user?.gender) {
        missing.push("gender");
    }

    if (
        user?.activity_level === null ||
        user?.activity_level === undefined ||
        user?.activity_level === ""
    ) {
        missing.push("activity_level");
    }

    return missing;
}


function getOnboardingQuestion(step) {

    const questions = {

        1:
            "Qual é o seu nome?",

        2:
            "Qual é a sua idade?",

        3:
            "Qual é o seu sexo? Responda Homem ou Mulher.",

        4:
            "Qual é o seu peso atual em kg?",

        5:
            "Qual é a sua altura? Pode informar em metros, por exemplo: 1,81.",

        6:
            "Qual é o seu objetivo? Por exemplo: perder gordura, ganhar massa muscular ou manter o peso.",

        7:
            "Como é o seu nível de atividade física? Me diga quantos dias por semana você treina."

    };

    return questions[step] || null;
}


function getNextOnboardingStep(user) {

    if (!user?.name) {
        return 1;
    }

    if (!(Number(user?.age) > 0)) {
        return 2;
    }

    if (!user?.gender) {
        return 3;
    }

    if (!(Number(user?.weight) > 0)) {
        return 4;
    }

    if (!(Number(user?.height) > 0)) {
        return 5;
    }

    if (!user?.goal) {
        return 6;
    }

    if (
        user?.activity_level === null ||
        user?.activity_level === undefined ||
        user?.activity_level === ""
    ) {
        return 7;
    }

    return 999;
}
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
        "Intenção detectada:",
        intent
    );


    // ========================================================
    // USUÁRIO
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
    // NOVO USUÁRIO: PRIMEIRO MOSTRA AS BOAS-VINDAS
    // ========================================================

    const isBrandNewUser =
        !user.onboarding_completed &&
        Number(user.onboarding_step || 0) === 0 &&
        !user.name &&
        !user.age &&
        !user.weight &&
        !user.height &&
        !user.goal &&
        !user.gender &&
        !user.activity_level;

    if (isBrandNewUser) {
        await saveMessage(phone, "user", message);

        const response =
            `Olá! 👋\n\n` +
            `Eu sou a IA Nutrição + Personal. 🥗💪\n\n` +
            `Vou te ajudar a acompanhar sua alimentação, ` +
            `calcular suas metas nutricionais, montar planos ` +
            `alimentares e acompanhar seus treinos e evolução.\n\n` +
            `Para começar, preciso conhecer um pouco sobre você. ` +
            `Vou fazer algumas perguntas rápidas e, depois, ` +
            `te explico tudo o que você pode fazer comigo.\n\n` +
            `Vamos começar! 😊\n\n` +
            `Qual é o seu nome?`;

        await updateOnboardingStep(phone, 1);
        await saveMessage(phone, "assistant", response);

        return { message: response };
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
            "👤 Dados atualizados:",
            extracted
        );

        user = {
            ...user,
            ...extracted
        };
    }
    // ========================================================
    // ONBOARDING
    // ========================================================

    const wasNewUser =
        !user.onboarding_completed &&
        Number(user.onboarding_step || 0) === 0 &&
        !user.name &&
        !user.age &&
        !user.weight &&
        !user.height &&
        !user.goal &&
        !user.gender &&
        !user.activity_level;


    const missingFields =
        getMissingRegistrationFields(user);


    // --------------------------------------------------------
    // NOVO USUÁRIO
    // --------------------------------------------------------

    if (wasNewUser && !Object.keys(extracted).length) {

        await saveMessage(
            phone,
            "user",
            message
        );

        const response =
            `Olá! 👋\n\n` +
            `Eu sou a IA Nutrição + Personal. 🥗💪\n\n` +
            `Vou te ajudar a acompanhar sua alimentação, ` +
            `calcular suas metas nutricionais, montar planos ` +
            `alimentares e acompanhar seus treinos e evolução.\n\n` +
            `Para começar, preciso conhecer um pouco sobre você. ` +
            `Vou fazer algumas perguntas rápidas e, depois, ` +
            `te explico tudo o que você pode fazer comigo.\n\n` +
            `Vamos começar! 😊\n\n` +
            `Qual é o seu nome?`;

        await updateOnboardingStep(
            phone,
            1
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
    // ONBOARDING INTELIGENTE
    // ========================================================

    if (
        !user.onboarding_completed &&
        Number(user.onboarding_step || 0) >= 1 &&
        Number(user.onboarding_step || 0) <= 7
    ) {

        const step =
            Number(user.onboarding_step);

        const answer =
            message
                .trim()
                .replace(/\s+/g, " ");

        let onboardingData = null;

        // ----------------------------------------------------
        // ETAPA 1 - NOME
        // ----------------------------------------------------

        if (step === 1) {

            const nameMatch =
                answer.match(
                    /^(?:meu nome é|meu nome e|meu nome:|nome é|nome:|eu sou|sou)\s+(.+)$/i
                );

            const name =
                nameMatch
                    ? nameMatch[1].trim()
                    : answer;

            if (
                name.length >= 2 &&
                name.length <= 100 &&
                !/^\d+(?:[.,]\d+)?$/.test(name)
            ) {
                onboardingData = {
                    name
                };
            }
        }


        // ----------------------------------------------------
        // ETAPA 2 - IDADE
        // ----------------------------------------------------

        else if (step === 2) {

            const match =
                answer.match(/\d{1,3}/);

            if (match) {

                const age =
                    Number(match[0]);

                if (
                    age >= 10 &&
                    age <= 100
                ) {
                    onboardingData = {
                        age
                    };
                }
            }
        }


        // ----------------------------------------------------
        // ETAPA 3 - SEXO
        // ----------------------------------------------------

        else if (step === 3) {

            const normalized =
                normalizeText(answer);

            if (
                /\bhomem\b/.test(normalized) ||
                /\bmasculino\b/.test(normalized)
            ) {
                onboardingData = {
                    gender: "Homem"
                };
            }

            else if (
                /\bmulher\b/.test(normalized) ||
                /\bfeminino\b/.test(normalized)
            ) {
                onboardingData = {
                    gender: "Mulher"
                };
            }
        }


        // ----------------------------------------------------
        // ETAPA 4 - PESO
        // ----------------------------------------------------

        else if (step === 4) {

            const match =
                answer.match(
                    /\d+(?:[.,]\d+)?/
                );

            if (match) {

                const weight =
                    Number(
                        match[0]
                            .replace(",", ".")
                    );

                if (
                    weight >= 30 &&
                    weight <= 300
                ) {
                    onboardingData = {
                        weight
                    };
                }
            }
        }


        // ----------------------------------------------------
        // ETAPA 5 - ALTURA
        // ----------------------------------------------------

        else if (step === 5) {

            const match =
                answer.match(
                    /(?:1[.,]\d{1,2}|2[.,]\d{1,2}|\d{3})/
                );

            if (match) {

                let height =
                    Number(
                        match[0]
                            .replace(",", ".")
                    );

                if (height > 3) {
                    height =
                        height / 100;
                }

                if (
                    height >= 1.20 &&
                    height <= 2.50
                ) {
                    onboardingData = {
                        height
                    };
                }
            }
        }


        // ----------------------------------------------------
        // ETAPA 6 - OBJETIVO
        // ----------------------------------------------------

        else if (step === 6) {

            const normalized =
                normalizeText(answer);

            if (
                /(perder gordura|perder peso|emagrecer|secar|diminuir gordura|perda de gordura)/i
                    .test(normalized)
            ) {
                onboardingData = {
                    goal: "perder gordura"
                };
            }

            else if (
                /(ganhar massa|ganhar musculo|ganhar músculo|hipertrofia|aumentar massa)/i
                    .test(normalized)
            ) {
                onboardingData = {
                    goal: "ganhar massa"
                };
            }

            else if (
                /(manter peso|manutenção|manutencao|manter)/i
                    .test(normalized)
            ) {
                onboardingData = {
                    goal: "manter peso"
                };
            }
        }


        // ----------------------------------------------------
        // ETAPA 7 - TREINOS POR SEMANA
        // ----------------------------------------------------

        else if (step === 7) {

            const match =
                answer.match(/\d{1,2}/);

            if (match) {

                const activityLevel =
                    Number(match[0]);

                if (
                    activityLevel >= 0 &&
                    activityLevel <= 14
                ) {
                    onboardingData = {
                        activity_level:
                            activityLevel
                    };
                }
            }
        }


        // ----------------------------------------------------
        // SALVAR RESPOSTA DO ONBOARDING
        // ----------------------------------------------------

        if (onboardingData) {

            await updateUser(
                phone,
                onboardingData
            );

            console.log(
                "👤 ONBOARDING:",
                onboardingData
            );

            user = {
                ...user,
                ...onboardingData
            };

            const nextStep =
                getNextOnboardingStep(user);

            if (nextStep === 999) {

                await completeOnboarding(phone);

                user.onboarding_completed =
                    true;

                await updateOnboardingStep(
                    phone,
                    999
                );

                const response =
                    `🎉 Cadastro concluído, ${user.name || "tudo certo"}!\n\n` +
                    `Já tenho seus dados e seu perfil está configurado.\n\n` +
                    `A partir de agora, posso te ajudar diariamente com:\n\n` +
                    `📋 *Plano alimentar*\n\n` +
                    `Montar sugestões de refeições de acordo com suas metas, objetivo e preferências alimentares.\n\n` +
                    `🍽️ *Alimentação*\n\n` +
                    `Registrar o que você come, calcular calorias e macros e acompanhar seu consumo do dia.\n\n` +
                    `🎯 *Metas nutricionais*\n\n` +
                    `Calcular suas calorias, proteínas, carboidratos e gorduras de acordo com seu objetivo.\n\n` +
                    `💪 *Treinos*\n\n` +
                    `Montar e acompanhar seus treinos, exercícios, séries, cargas e evolução.\n\n` +
                    `📊 *Acompanhamento*\n\n` +
                    `Consultar seu consumo diário, evolução do peso e progresso ao longo do tempo.\n\n` +
                    `Você pode falar comigo normalmente, por exemplo:\n\n` +
                    `"Monte meu plano alimentar."\n\n` +
                    `"Comi 150g de arroz, 100g de feijão e 200g de frango."\n\n` +
                    `"Quanto ainda posso comer hoje?"\n\n` +
                    `"Quero registrar meu treino."\n\n` +
                    `"Como está minha evolução?"\n\n` +
                    `🚀 *Vamos começar? Me diga o que você quer fazer.*`;

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

            await updateOnboardingStep(
                phone,
                nextStep
            );

            const question =
                getOnboardingQuestion(
                    nextStep
                );

            await saveMessage(
                phone,
                "user",
                message
            );

            await saveMessage(
                phone,
                "assistant",
                question
            );

            return {
                message: question
            };
        }
    }



    // --------------------------------------------------------
    // CADASTRO INCOMPLETO
    // --------------------------------------------------------

    if (
        !user.onboarding_completed &&
        missingFields.length > 0
    ) {

        const nextStep =
            getNextOnboardingStep(user);


        await updateOnboardingStep(
            phone,
            nextStep
        );


        const question =
            getOnboardingQuestion(nextStep);


        if (question) {

            await saveMessage(
                phone,
                "user",
                message
            );

            await saveMessage(
                phone,
                "assistant",
                question
            );

            return {
                message: question
            };

        }

    }


    // --------------------------------------------------------
    // CADASTRO COMPLETO
    // --------------------------------------------------------

    if (
        !user.onboarding_completed &&
        missingFields.length === 0
    ) {

        await completeOnboarding(phone);

        user = {
            ...user,
            onboarding_completed: true,
            onboarding_step: 999
        };


        const response =
            `Cadastro concluído! ✅\n\n` +
            `Agora já conheço seu perfil e posso personalizar ` +
            `suas orientações.\n\n` +
            `Você pode, por exemplo:\n\n` +
            `🍽️ Registrar o que comeu\n` +
            `📊 Ver seu consumo diário\n` +
            `🥗 Pedir um plano alimentar\n` +
            `💪 Pedir ou acompanhar seus treinos\n` +
            `⚖️ Atualizar seu peso\n` +
            `🎯 Alterar seu objetivo\n\n` +
            `É só conversar comigo normalmente pelo WhatsApp.`;

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
    // RESUMO DIÁRIO
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
    // APAGAR ÚLTIMA REFEIÇÃO
    // ========================================================

    if (intent === "delete_last") {

        const result =
            await deleteLastMeal(phone);

        let response;

        if (!result.success) {

            response =
                `❌ ${result.message}`;

        } else {

            response =
                `🗑️ *Última refeição apagada!*\n\n` +
                `🍽️ ${result.mealName}\n` +
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
                ? `🗑️ *Consumo de hoje apagado!*\n\nForam removidos ${deleted} registros.`
                : `ℹ️ Não havia refeições registradas hoje.`;

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
            "• Idade\n" +
            "• Peso\n" +
            "• Altura\n" +
            "• Sexo\n" +
            "• Quantidade de treinos por semana\n" +
            "• Objetivo";

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
        // JÁ ATINGIU A META
        // --------------------------------------------------------

        if (remainingCalories <= 0) {

            const response =
                `🎯 *META DIÁRIA ATINGIDA!*\n\n` +
                `🔥 Meta: ${targetCalories} kcal\n` +
                `🔥 Consumido: ${Math.round(consumedCalories)} kcal\n\n` +
                `Você já atingiu ou ultrapassou sua meta de hoje. ` +
                `Não vou montar outro plano para evitar aumentar ` +
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
        // NÃO COMEU NADA HOJE
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
        // JÁ COMEU HOJE
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
        // ORDEM DAS REFEIÇÕES
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
        // REFEIÇÕES AINDA NÃO REGISTRADAS
        // --------------------------------------------------------

        const remainingMealTypes =
            mealOrder.filter(
                mealKey =>
                    !registeredMealKeys.has(
                        mealKey
                    )
            );


        // --------------------------------------------------------
        // SE NÃO CONSEGUIR IDENTIFICAR REFEIÇÕES,
        // GERA UMA ÚNICA REFEIÇÃO PARA O SALDO
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
        // DISTRIBUIR O SALDO ENTRE AS REFEIÇÕES RESTANTES
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
        // GERAR CADA REFEIÇÃO
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
        // CALCULAR NUTRIÇÃO DO PLANO GERADO
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
        // CALCULAR DIFERENÇAS
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
        // CRIAR OBJETO DE PLANO COMPATÍVEL
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
            `📊 *SALDO DO SEU DIA*\n\n` +

            `🔥 *Meta:* ${targetCalories} kcal\n` +

            `🔥 *Consumido:* ${Math.round(
                consumedCalories
            )} kcal\n` +

            `🔥 *Restante:* ${remainingCalories} kcal\n\n` +

            `🥩 *Proteína restante:* ${remainingProtein}g\n` +

            `🍚 *Carboidratos restantes:* ${remainingCarbs}g\n` +

            `🥑 *Gorduras restantes:* ${remainingFat}g\n\n` +

            `Como você já fez refeições hoje, ` +

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
                "Não consegui montar seu plano alimentar agora. Tente novamente."
        };
    }
}


// ========================================================
// NUTRIÇÃO / OBJETIVO
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
                .map(item => `• ${item}`)
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
// FUNÇÃO ASK
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






