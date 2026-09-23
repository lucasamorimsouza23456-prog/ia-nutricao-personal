// ============================================================
// IA NUTRIÇÃO + PERSONAL
// MOTOR INTELIGENTE DE PLANO ALIMENTAR
// ============================================================

const {
    FOODS,
    calculateFoodNutrition
} = require("./foods");


// ============================================================
// DISTRIBUIÇÃO DAS REFEIÇÕES
// ============================================================

const MEAL_DISTRIBUTION = {
    cafe_da_manha: 0.20,
    lanche_da_manha: 0.10,
    almoco: 0.30,
    lanche_da_tarde: 0.15,
    jantar: 0.20,
    ceia: 0.05
};


// ============================================================
// NOMES DAS REFEIÇÕES
// ============================================================

const MEAL_NAMES = {
    cafe_da_manha: "Café da manhã",
    lanche_da_manha: "Lanche da manhã",
    almoco: "Almoço",
    lanche_da_tarde: "Lanche da tarde",
    jantar: "Jantar",
    ceia: "Ceia"
};


// ============================================================
// TEMPLATES
// ============================================================

const MEAL_TEMPLATES = {

    cafe_da_manha: {

        protein: [
            "ovo_inteiro",
            "queijo_minas",
            "iogurte_grego"
        ],

        carb: [
            "pao_frances",
            "pao_integral",
            "tapioca",
            "cuscuz_milho_cozido",
            "aveia"
        ],

        fruit: [
            "banana",
            "maca",
            "mamao",
            "laranja",
            "morango"
        ],

        fat: [
            "castanha_caju",
            "amendoas",
            "nozes"
        ]
    },


    lanche_da_manha: {

        protein: [
            "iogurte_natural",
            "iogurte_grego",
            "leite_desnatado"
        ],

        carb: [
            "aveia",
            "banana",
            "maca",
            "mamao"
        ],

        fruit: [],

        fat: [
            "castanha_caju",
            "amendoas"
        ]
    },


    almoco: {

        protein: [
            "frango_grelhado",
            "patinho",
            "carne_moida_magra",
            "peixe_grelhado",
            "tilapia"
        ],

        carb: [
            "arroz_branco_cozido",
            "arroz_integral_cozido",
            "macarrao_cozido",
            "batata_inglesa_cozida",
            "batata_doce_cozida",
            "aipim_cozido"
        ],

        bean: [
            "feijao_carioca_cozido",
            "feijao_preto_cozido",
            "lentilha_cozida"
        ],

        vegetable: [
            "brocolis",
            "cenoura",
            "abobrinha",
            "chuchu",
            "couve_flor"
        ],

        vegetable2: [
            "tomate",
            "alface",
            "pepino",
            "repolho"
        ],

        fat: [
            "azeite"
        ]
    },


    lanche_da_tarde: {

        protein: [
            "iogurte_grego",
            "iogurte_natural",
            "queijo_minas",
            "ovo_inteiro"
        ],

        carb: [
            "pao_frances",
            "pao_integral",
            "tapioca",
            "aveia"
        ],

        fruit: [
            "banana",
            "maca",
            "mamao",
            "morango"
        ],

        fat: [
            "castanha_caju",
            "amendoas"
        ]
    },


    jantar: {

        protein: [
            "frango_grelhado",
            "patinho",
            "peixe_grelhado",
            "tilapia",
            "carne_moida_magra"
        ],

        carb: [
            "arroz_branco_cozido",
            "arroz_integral_cozido",
            "macarrao_cozido",
            "batata_doce_cozida",
            "batata_inglesa_cozida",
            "aipim_cozido"
        ],

        bean: [
            "feijao_carioca_cozido",
            "feijao_preto_cozido"
        ],

        vegetable: [
            "brocolis",
            "cenoura",
            "abobrinha",
            "chuchu",
            "couve_flor"
        ],

        vegetable2: [
            "tomate",
            "alface",
            "pepino",
            "repolho"
        ],

        fat: [
            "azeite"
        ]
    },


    ceia: {

        protein: [
            "iogurte_natural",
            "iogurte_grego",
            "leite_desnatado",
            "ovo_inteiro"
        ],

        carb: [
            "banana",
            "maca",
            "aveia"
        ],

        fruit: [],

        fat: [
            "castanha_caju",
            "amendoas"
        ]
    }
};


// ============================================================
// LIMITES DE PORÇÃO
// ============================================================

const FOOD_PORTION_LIMITS = {

    // Proteínas
    frango_grelhado: {
        min: 80,
        max: 250
    },

    frango_cozido: {
        min: 80,
        max: 250
    },

    patinho: {
        min: 80,
        max: 250
    },

    carne_moida_magra: {
        min: 80,
        max: 250
    },

    peixe_grelhado: {
        min: 80,
        max: 250
    },

    tilapia: {
        min: 80,
        max: 250
    },

    ovo_inteiro: {
        min: 50,
        max: 250
    },

    clara_ovo: {
        min: 50,
        max: 250
    },

    // Carboidratos
    arroz_branco_cozido: {
        min: 60,
        max: 350
    },

    arroz_integral_cozido: {
        min: 60,
        max: 350
    },

    macarrao_cozido: {
        min: 60,
        max: 300
    },

    batata_inglesa_cozida: {
        min: 80,
        max: 350
    },

    batata_doce_cozida: {
        min: 80,
        max: 350
    },

    aipim_cozido: {
        min: 60,
        max: 300
    },

    cuscuz_milho_cozido: {
        min: 50,
        max: 250
    },

    tapioca: {
        min: 30,
        max: 150
    },

    pao_frances: {
        min: 30,
        max: 120
    },

    pao_integral: {
        min: 30,
        max: 120
    },

    aveia: {
        min: 15,
        max: 100
    },

    granola: {
        min: 15,
        max: 80
    },

    // Frutas
    banana: {
        min: 40,
        max: 200
    },

    maca: {
        min: 50,
        max: 200
    },

    mamao: {
        min: 50,
        max: 250
    },

    laranja: {
        min: 50,
        max: 250
    },

    morango: {
        min: 50,
        max: 250
    },

    // Gorduras
    castanha_caju: {
        min: 5,
        max: 30
    },

    amendoas: {
        min: 5,
        max: 30
    },

    nozes: {
        min: 5,
        max: 30
    },

    azeite: {
        min: 3,
        max: 20
    },

    // Laticínios
    iogurte_natural: {
        min: 100,
        max: 300
    },

    iogurte_grego: {
        min: 100,
        max: 300
    },

    leite_desnatado: {
        min: 100,
        max: 300
    },

    queijo_minas: {
        min: 30,
        max: 100
    }
};


// ============================================================
// CATEGORIAS DE AJUSTE
// ============================================================

const PROTEIN_FOODS = new Set([

    "frango_grelhado",
    "frango_cozido",
    "patinho",
    "carne_moida",
    "carne_moida_magra",
    "alcatra",
    "coxao_mole",
    "peixe_grelhado",
    "tilapia",
    "atum",
    "sardinha",
    "salmao",
    "ovo_inteiro",
    "clara_ovo",
    "iogurte_natural",
    "iogurte_grego",
    "leite_desnatado",
    "queijo_minas"
]);


const CARB_FOODS = new Set([

    "arroz_branco_cozido",
    "arroz_integral_cozido",
    "macarrao_cozido",
    "batata_inglesa_cozida",
    "batata_doce_cozida",
    "aipim_cozido",
    "inhame_cozido",
    "cuscuz_milho_cozido",
    "tapioca",
    "pao_frances",
    "pao_integral",
    "pao_de_forma",
    "aveia",
    "granola",

    "banana",
    "maca",
    "laranja",
    "mamao",
    "melancia",
    "melao",
    "abacaxi",
    "manga",
    "uva",
    "morango",
    "pera",
    "kiwi"
]);


const FAT_FOODS = new Set([

    "azeite",
    "castanha",
    "castanha_caju",
    "amendoas",
    "nozes",
    "abacate"
]);


// ============================================================
// UTILITÁRIOS
// ============================================================

function roundNumber(value, decimals = 1) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    const factor = Math.pow(10, decimals);

    return Math.round(number * factor) / factor;
}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


function getFoodLimits(foodKey) {

    return FOOD_PORTION_LIMITS[foodKey] || {
        min: 5,
        max: 400
    };
}


function clampFoodGrams(foodKey, grams) {

    const limits =
        getFoodLimits(foodKey);

    return Math.round(
        clamp(
            Number(grams),
            limits.min,
            limits.max
        )
    );
}


// ============================================================
// META DA REFEIÇÃO
// ============================================================

function calculateMealTarget(
    calories,
    macros,
    percentage
) {

    if (
        !Number.isFinite(Number(calories)) ||
        !macros ||
        !Number.isFinite(Number(percentage))
    ) {
        return null;
    }

    return {

        calories:
            Math.round(
                Number(calories) *
                Number(percentage)
            ),

        protein:
            roundNumber(
                Number(macros.protein) *
                Number(percentage)
            ),

        carbs:
            roundNumber(
                Number(macros.carbs) *
                Number(percentage)
            ),

        fat:
            roundNumber(
                Number(macros.fat) *
                Number(percentage)
            )
    };
}


// ============================================================
// DISTRIBUIR REFEIÇÕES
// ============================================================

function distributeMeals(
    calories,
    macros
) {

    if (
        !Number.isFinite(Number(calories)) ||
        !macros
    ) {
        return null;
    }

    const meals = {};

    for (
        const [mealKey, percentage]
        of Object.entries(MEAL_DISTRIBUTION)
    ) {

        meals[mealKey] = {

            key: mealKey,

            name:
                MEAL_NAMES[mealKey],

            percentage,

            target:
                calculateMealTarget(
                    calories,
                    macros,
                    percentage
                )
        };
    }

    return meals;
}


// ============================================================
// CRIAR ITEM
// ============================================================

function createFoodItem(
    foodKey,
    grams
) {

    const food =
        FOODS[foodKey];

    if (
        !food ||
        !Number.isFinite(Number(grams)) ||
        Number(grams) <= 0
    ) {
        return null;
    }

    const safeGrams =
        clampFoodGrams(
            foodKey,
            grams
        );

    const nutrition =
        calculateFoodNutrition(
            food,
            safeGrams
        );

    if (!nutrition) {
        return null;
    }

    return {

        key: foodKey,

        name:
            food.name,

        grams:
            safeGrams,

        calories:
            roundNumber(
                nutrition.calories
            ),

        protein:
            roundNumber(
                nutrition.protein
            ),

        carbs:
            roundNumber(
                nutrition.carbs
            ),

        fat:
            roundNumber(
                nutrition.fat
            )
    };
}


// ============================================================
// CALCULAR NUTRIÇÃO
// ============================================================

function calculateMealNutrition(
    foods = []
) {

    const result = {

        calories: 0,

        protein: 0,

        carbs: 0,

        fat: 0
    };

    for (
        const item of foods
    ) {

        result.calories +=
            Number(
                item.calories || 0
            );

        result.protein +=
            Number(
                item.protein || 0
            );

        result.carbs +=
            Number(
                item.carbs || 0
            );

        result.fat +=
            Number(
                item.fat || 0
            );
    }

    return {

        calories:
            Math.round(
                result.calories
            ),

        protein:
            roundNumber(
                result.protein
            ),

        carbs:
            roundNumber(
                result.carbs
            ),

        fat:
            roundNumber(
                result.fat
            )
    };
}


// ============================================================
// ESCOLHER ALIMENTO
// ============================================================

function chooseFood(
    list,
    exclude = []
) {

    if (
        !Array.isArray(list) ||
        list.length === 0
    ) {
        return null;
    }

    const blocked =
        new Set(
            Array.isArray(exclude)
                ? exclude
                : []
        );

    const available =
        list.filter(
            item =>
                !blocked.has(item)
        );

    if (
        available.length > 0
    ) {
        return available[0];
    }

    return list[0];
}


// ============================================================
// GRAMAS POR CALORIAS
// ============================================================

function gramsForCalories(
    foodKey,
    calories
) {

    const food =
        FOODS[foodKey];

    if (
        !food ||
        !Number.isFinite(Number(calories)) ||
        Number(calories) <= 0 ||
        Number(food.calories) <= 0
    ) {
        return 0;
    }

    return clampFoodGrams(
        foodKey,
        Math.round(
            (
                Number(calories) /
                Number(food.calories)
            ) * 100
        )
    );
}


// ============================================================
// GRAMAS POR PROTEÍNA
// ============================================================

function gramsForProtein(
    foodKey,
    protein
) {

    const food =
        FOODS[foodKey];

    if (
        !food ||
        !Number.isFinite(Number(protein)) ||
        Number(protein) <= 0 ||
        Number(food.protein) <= 0
    ) {
        return 0;
    }

    return clampFoodGrams(
        foodKey,
        Math.round(
            (
                Number(protein) /
                Number(food.protein)
            ) * 100
        )
    );
}


// ============================================================
// GRAMAS POR CARBOIDRATO
// ============================================================

function gramsForCarbs(
    foodKey,
    carbs
) {

    const food =
        FOODS[foodKey];

    if (
        !food ||
        !Number.isFinite(Number(carbs)) ||
        Number(carbs) <= 0 ||
        Number(food.carbs) <= 0
    ) {
        return 0;
    }

    return clampFoodGrams(
        foodKey,
        Math.round(
            (
                Number(carbs) /
                Number(food.carbs)
            ) * 100
        )
    );
}


// ============================================================
// CAFÉ DA MANHÃ
// ============================================================

function generateBreakfast(
    target,
    usedFoods = []
) {

    const used =
        [...usedFoods];

    const proteinFood =
        chooseFood(
            MEAL_TEMPLATES
                .cafe_da_manha
                .protein,
            used
        );

    if (proteinFood) {
        used.push(proteinFood);
    }

    const carbFood =
        chooseFood(
            MEAL_TEMPLATES
                .cafe_da_manha
                .carb,
            used
        );

    if (carbFood) {
        used.push(carbFood);
    }

    const fruitFood =
        chooseFood(
            MEAL_TEMPLATES
                .cafe_da_manha
                .fruit,
            used
        );

    if (fruitFood) {
        used.push(fruitFood);
    }

    const fatFood =
        chooseFood(
            MEAL_TEMPLATES
                .cafe_da_manha
                .fat,
            used
        );

    const foods = [];


    // Proteína
    if (proteinFood) {

        const grams =
            gramsForProtein(
                proteinFood,
                Number(target.protein) *
                0.55
            );

        const item =
            createFoodItem(
                proteinFood,
                grams
            );

        if (item) {
            foods.push(item);
        }
    }


    // Carboidrato
    if (carbFood) {

        const grams =
            gramsForCarbs(
                carbFood,
                Number(target.carbs) *
                0.55
            );

        const item =
            createFoodItem(
                carbFood,
                grams
            );

        if (item) {
            foods.push(item);
        }
    }


    // Fruta
    if (fruitFood) {

        const item =
            createFoodItem(
                fruitFood,
                100
            );

        if (item) {
            foods.push(item);
        }
    }


    // Gordura
    if (fatFood) {

        const grams =
            gramsForCalories(
                fatFood,
                Number(target.fat) *
                9 *
                0.20
            );

        const item =
            createFoodItem(
                fatFood,
                grams
            );

        if (item) {
            foods.push(item);
        }
    }

    return foods;
}
// ============================================================
// LANCHES
// ============================================================

function generateSnack(
    target,
    mealKey,
    usedFoods = []
) {

    const template =
        MEAL_TEMPLATES[mealKey] ||
        MEAL_TEMPLATES.lanche_da_tarde;

    const used =
        [...usedFoods];

    const foods = [];


    // ========================================================
    // PROTEÍNA
    // ========================================================

    const proteinFood =
        chooseFood(
            template.protein,
            used
        );

    if (proteinFood) {

        used.push(
            proteinFood
        );

        const grams =
            gramsForProtein(
                proteinFood,
                Number(target.protein) *
                0.75
            );

        const item =
            createFoodItem(
                proteinFood,
                grams
            );

        if (item) {
            foods.push(item);
        }
    }


    // ========================================================
    // CARBOIDRATO
    // ========================================================

    const carbFood =
        chooseFood(
            template.carb,
            used
        );

    if (carbFood) {

        used.push(
            carbFood
        );

        const grams =
            gramsForCarbs(
                carbFood,
                Number(target.carbs) *
                0.55
            );

        const item =
            createFoodItem(
                carbFood,
                grams
            );

        if (item) {
            foods.push(item);
        }
    }


    // ========================================================
    // FRUTA
    // ========================================================

    if (
        Array.isArray(template.fruit) &&
        template.fruit.length > 0
    ) {

        const fruitFood =
            chooseFood(
                template.fruit,
                used
            );

        if (fruitFood) {

            const item =
                createFoodItem(
                    fruitFood,
                    80
                );

            if (item) {
                foods.push(item);
            }
        }
    }


    // ========================================================
    // GORDURA
    // ========================================================

    const fatFood =
        chooseFood(
            template.fat,
            used
        );

    if (fatFood) {

        const grams =
            gramsForCalories(
                fatFood,
                Number(target.fat) *
                9 *
                0.15
            );

        const item =
            createFoodItem(
                fatFood,
                grams
            );

        if (item) {
            foods.push(item);
        }
    }


    return foods;
}


// ============================================================
// REFEIÇÕES PRINCIPAIS
// ============================================================

function generateMainMeal(
    target,
    mealKey,
    usedFoods = []
) {

    const template =
        MEAL_TEMPLATES[mealKey] ||
        MEAL_TEMPLATES.almoco;

    const used =
        [...usedFoods];

    const foods = [];


    // ========================================================
    // PROTEÍNA PRINCIPAL
    // ========================================================

    const proteinFood =
        chooseFood(
            template.protein,
            used
        );

    if (proteinFood) {

        used.push(
            proteinFood
        );

        const grams =
            gramsForProtein(
                proteinFood,
                Number(target.protein) *
                0.80
            );

        const item =
            createFoodItem(
                proteinFood,
                grams
            );

        if (item) {
            foods.push(item);
        }
    }


    // ========================================================
    // CARBOIDRATO
    // ========================================================

    const carbFood =
        chooseFood(
            template.carb,
            used
        );

    if (carbFood) {

        used.push(
            carbFood
        );

        const grams =
            gramsForCarbs(
                carbFood,
                Number(target.carbs) *
                0.45
            );

        const item =
            createFoodItem(
                carbFood,
                grams
            );

        if (item) {
            foods.push(item);
        }
    }


    // ========================================================
    // FEIJÃO / LEGUMINOSA
    // ========================================================

    if (
        Array.isArray(template.bean) &&
        template.bean.length > 0
    ) {

        const beanFood =
            chooseFood(
                template.bean,
                used
            );

        if (beanFood) {

            const item =
                createFoodItem(
                    beanFood,
                    100
                );

            if (item) {
                foods.push(item);
            }
        }
    }


    // ========================================================
    // VEGETAL
    // ========================================================

    if (
        Array.isArray(
            template.vegetable
        ) &&
        template.vegetable.length > 0
    ) {

        const vegetableFood =
            chooseFood(
                template.vegetable,
                used
            );

        if (vegetableFood) {

            const item =
                createFoodItem(
                    vegetableFood,
                    100
                );

            if (item) {
                foods.push(item);
            }
        }
    }


    // ========================================================
    // SEGUNDO VEGETAL
    // ========================================================

    if (
        Array.isArray(
            template.vegetable2
        ) &&
        template.vegetable2.length > 0
    ) {

        const vegetableFood2 =
            chooseFood(
                template.vegetable2,
                used
            );

        if (vegetableFood2) {

            const item =
                createFoodItem(
                    vegetableFood2,
                    50
                );

            if (item) {
                foods.push(item);
            }
        }
    }


    // ========================================================
    // GORDURA
    // ========================================================

    const fatFood =
        chooseFood(
            template.fat,
            used
        );

    if (fatFood) {

        const grams =
            gramsForCalories(
                fatFood,
                clamp(
                    Number(target.fat) *
                    0.15 *
                    9,
                    5,
                    15
                )
            );

        const item =
            createFoodItem(
                fatFood,
                grams
            );

        if (item) {
            foods.push(item);
        }
    }


    return foods;
}


// ============================================================
// NUTRIÇÃO TOTAL DO PLANO
// ============================================================

function calculatePlanNutrition(
    meals
) {

    const total = {

        calories: 0,

        protein: 0,

        carbs: 0,

        fat: 0
    };


    if (!meals) {
        return total;
    }


    for (
        const meal of Object.values(meals)
    ) {

        if (!meal) {
            continue;
        }


        const nutrition =
            Array.isArray(meal.foods)
                ? calculateMealNutrition(
                    meal.foods
                )
                : meal.nutrition;


        if (!nutrition) {
            continue;
        }


        total.calories +=
            Number(
                nutrition.calories || 0
            );

        total.protein +=
            Number(
                nutrition.protein || 0
            );

        total.carbs +=
            Number(
                nutrition.carbs || 0
            );

        total.fat +=
            Number(
                nutrition.fat || 0
            );
    }


    return {

        calories:
            Math.round(
                total.calories
            ),

        protein:
            roundNumber(
                total.protein
            ),

        carbs:
            roundNumber(
                total.carbs
            ),

        fat:
            roundNumber(
                total.fat
            )
    };
}


// ============================================================
// DIFERENÇAS DA META
// ============================================================

function calculatePlanDifferences(
    actual,
    target
) {

    return {

        calories:
            roundNumber(
                Number(target.calories || 0) -
                Number(actual.calories || 0)
            ),

        protein:
            roundNumber(
                Number(target.protein || 0) -
                Number(actual.protein || 0)
            ),

        carbs:
            roundNumber(
                Number(target.carbs || 0) -
                Number(actual.carbs || 0)
            ),

        fat:
            roundNumber(
                Number(target.fat || 0) -
                Number(actual.fat || 0)
            )
    };
}


// ============================================================
// TOLERÂNCIA
// ============================================================

function isWithinTolerance(
    actual,
    target
) {

    if (
        !actual ||
        !target
    ) {
        return false;
    }


    const caloriesOK =
        Math.abs(
            Number(target.calories || 0) -
            Number(actual.calories || 0)
        ) <=
        Math.max(
            35,
            Number(target.calories || 0) *
            0.02
        );


    const proteinOK =
        Math.abs(
            Number(target.protein || 0) -
            Number(actual.protein || 0)
        ) <=
        Math.max(
            5,
            Number(target.protein || 0) *
            0.05
        );


    const carbsOK =
        Math.abs(
            Number(target.carbs || 0) -
            Number(actual.carbs || 0)
        ) <=
        Math.max(
            5,
            Number(target.carbs || 0) *
            0.05
        );


    const fatOK =
        Math.abs(
            Number(target.fat || 0) -
            Number(actual.fat || 0)
        ) <=
        Math.max(
            3,
            Number(target.fat || 0) *
            0.05
        );


    return (
        caloriesOK &&
        proteinOK &&
        carbsOK &&
        fatOK
    );
}


// ============================================================
// ENCONTRAR ALIMENTO PARA AJUSTE
// ============================================================

function findFoodToAdjust(
    meals,
    foodSet
) {

    for (
        const meal of Object.values(meals || {})
    ) {

        if (
            !meal ||
            !Array.isArray(meal.foods)
        ) {
            continue;
        }


        for (
            let index = 0;
            index < meal.foods.length;
            index++
        ) {

            const item =
                meal.foods[index];


            if (
                item &&
                item.key &&
                foodSet.has(item.key)
            ) {

                return {

                    meal,

                    index,

                    item
                };
            }
        }
    }


    return null;
}


// ============================================================
// ADICIONAR ALIMENTO NOVO
// ============================================================

function findFoodToAdd(
    meals,
    foodSet
) {

    for (
        const [mealKey, meal]
        of Object.entries(meals || {})
    ) {

        if (
            !meal ||
            !Array.isArray(meal.foods)
        ) {
            continue;
        }


        const existing =
            new Set(
                meal.foods
                    .map(
                        item =>
                            item &&
                            item.key
                    )
                    .filter(Boolean)
            );


        const template =
            MEAL_TEMPLATES[
                mealKey
            ];


        if (!template) {
            continue;
        }


        const candidates = [

            ...(template.protein || []),

            ...(template.carb || []),

            ...(template.bean || []),

            ...(template.vegetable || []),

            ...(template.vegetable2 || []),

            ...(template.fruit || []),

            ...(template.fat || [])
        ];


        for (
            const foodKey
            of candidates
        ) {

            if (
                !foodSet.has(foodKey) ||
                existing.has(foodKey)
            ) {
                continue;
            }


            if (
                FOODS[foodKey]
            ) {

                return {

                    meal,

                    foodKey,

                    food:
                        FOODS[foodKey]
                };
            }
        }
    }


    return null;
}


// ============================================================
// AJUSTAR ITEM EXISTENTE
// ============================================================

function replaceFoodGrams(
    found,
    newGrams
) {

    if (
        !found ||
        !found.meal ||
        !found.item
    ) {
        return false;
    }


    const item =
        createFoodItem(
            found.item.key,
            newGrams
        );


    if (!item) {
        return false;
    }


    found.meal.foods[
        found.index
    ] = item;


    return true;
}


// ============================================================
// ADICIONAR ALIMENTO AO PLANO
// ============================================================

function addFoodToPlan(
    found,
    grams
) {

    if (
        !found ||
        !found.meal ||
        !found.food
    ) {
        return false;
    }


    const item =
        createFoodItem(
            found.foodKey,
            grams
        );


    if (!item) {
        return false;
    }


    found.meal.foods.push(
        item
    );


    return true;
}


// ============================================================
// AJUSTAR PROTEÍNA
// ============================================================

function adjustProtein(
    meals,
    targetProtein
) {

    const target =
        Number(targetProtein);


    if (
        !Number.isFinite(target) ||
        target <= 0
    ) {
        return false;
    }


    let actual =
        calculatePlanNutrition(
            meals
        );


    let difference =
        target -
        actual.protein;


    if (
        difference <= 0
    ) {
        return false;
    }


    // Primeiro aumenta alimentos
    // proteicos já existentes.

    for (
        const meal of Object.values(meals || {})
    ) {

        if (
            !meal ||
            !Array.isArray(meal.foods)
        ) {
            continue;
        }


        for (
            let index = 0;
            index < meal.foods.length;
            index++
        ) {

            const item =
                meal.foods[index];


            if (
                !item ||
                !PROTEIN_FOODS.has(
                    item.key
                )
            ) {
                continue;
            }


            const food =
                FOODS[item.key];


            if (!food) {
                continue;
            }


            const limits =
                getFoodLimits(
                    item.key
                );


            const currentGrams =
                Number(item.grams);


            if (
                currentGrams >=
                limits.max
            ) {
                continue;
            }


            const proteinPerGram =
                Number(food.protein) /
                100;


            if (
                proteinPerGram <= 0
            ) {
                continue;
            }


            let gramsToAdd =
                difference /
                proteinPerGram;


            gramsToAdd =
                Math.min(
                    gramsToAdd,
                    limits.max -
                    currentGrams
                );


            gramsToAdd =
                Math.max(
                    1,
                    Math.round(
                        gramsToAdd
                    )
                );


            const changed =
                replaceFoodGrams(
                    {
                        meal,
                        index,
                        item
                    },
                    currentGrams +
                    gramsToAdd
                );


            if (!changed) {
                continue;
            }


            actual =
                calculatePlanNutrition(
                    meals
                );


            difference =
                target -
                actual.protein;


            if (
                difference <= 0
            ) {
                return true;
            }
        }
    }


    // Se ainda faltar proteína,
    // adiciona uma fonte nova.

    while (
        difference > 0
    ) {

        const found =
            findFoodToAdd(
                meals,
                PROTEIN_FOODS
            );


        if (!found) {
            break;
        }


        const proteinPerGram =
            Number(
                found.food.protein
            ) /
            100;


        if (
            proteinPerGram <= 0
        ) {
            break;
        }


        let grams =
            difference /
            proteinPerGram;


        const limits =
            getFoodLimits(
                found.foodKey
            );


        grams =
            clamp(
                grams,
                limits.min,
                limits.max
            );


        grams =
            Math.round(
                grams
            );


        if (
            !addFoodToPlan(
                found,
                grams
            )
        ) {
            break;
        }


        actual =
            calculatePlanNutrition(
                meals
            );


        difference =
            target -
            actual.protein;
    }


    return (
        difference <=
        Math.max(
            5,
            target * 0.05
        )
    );
}
// ============================================================
// AJUSTAR CARBOIDRATOS
// ============================================================

function adjustCarbs(
    meals,
    targetCarbs
) {

    const target =
        Number(targetCarbs);


    if (
        !Number.isFinite(target) ||
        target <= 0
    ) {
        return false;
    }


    let actual =
        calculatePlanNutrition(
            meals
        );


    let difference =
        target -
        actual.carbs;


    if (
        difference <= 0
    ) {
        return false;
    }


    // Aumentar carboidratos
    // dos alimentos que já existem.

    for (
        const meal of Object.values(meals || {})
    ) {

        if (
            !meal ||
            !Array.isArray(meal.foods)
        ) {
            continue;
        }


        for (
            let index = 0;
            index < meal.foods.length;
            index++
        ) {

            const item =
                meal.foods[index];


            if (
                !item ||
                !CARB_FOODS.has(
                    item.key
                )
            ) {
                continue;
            }


            const food =
                FOODS[item.key];


            if (!food) {
                continue;
            }


            const limits =
                getFoodLimits(
                    item.key
                );


            const currentGrams =
                Number(item.grams);


            if (
                currentGrams >=
                limits.max
            ) {
                continue;
            }


            const carbsPerGram =
                Number(food.carbs) /
                100;


            if (
                carbsPerGram <= 0
            ) {
                continue;
            }


            let gramsToAdd =
                difference /
                carbsPerGram;


            gramsToAdd =
                Math.min(
                    gramsToAdd,
                    limits.max -
                    currentGrams
                );


            gramsToAdd =
                Math.max(
                    1,
                    Math.round(
                        gramsToAdd
                    )
                );


            const changed =
                replaceFoodGrams(
                    {
                        meal,
                        index,
                        item
                    },
                    currentGrams +
                    gramsToAdd
                );


            if (!changed) {
                continue;
            }


            actual =
                calculatePlanNutrition(
                    meals
                );


            difference =
                target -
                actual.carbs;


            if (
                difference <= 0
            ) {
                return true;
            }
        }
    }


    // Se ainda faltar carboidrato,
    // adicionar alimento novo.

    while (
        difference > 0
    ) {

        const found =
            findFoodToAdd(
                meals,
                CARB_FOODS
            );


        if (!found) {
            break;
        }


        const carbsPerGram =
            Number(
                found.food.carbs
            ) /
            100;


        if (
            carbsPerGram <= 0
        ) {
            break;
        }


        let grams =
            difference /
            carbsPerGram;


        const limits =
            getFoodLimits(
                found.foodKey
            );


        grams =
            clamp(
                grams,
                limits.min,
                limits.max
            );


        grams =
            Math.round(
                grams
            );


        if (
            !addFoodToPlan(
                found,
                grams
            )
        ) {
            break;
        }


        actual =
            calculatePlanNutrition(
                meals
            );


        difference =
            target -
            actual.carbs;
    }


    return (
        difference <=
        Math.max(
            5,
            target * 0.05
        )
    );
}


// ============================================================
// AJUSTAR GORDURAS
// ============================================================

function adjustFat(
    meals,
    targetFat
) {

    const target =
        Number(targetFat);


    if (
        !Number.isFinite(target) ||
        target <= 0
    ) {
        return false;
    }


    let actual =
        calculatePlanNutrition(
            meals
        );


    let difference =
        target -
        actual.fat;


    if (
        difference <= 0
    ) {
        return false;
    }


    // Primeiro aumenta gorduras
    // já existentes.

    for (
        const meal of Object.values(meals || {})
    ) {

        if (
            !meal ||
            !Array.isArray(meal.foods)
        ) {
            continue;
        }


        for (
            let index = 0;
            index < meal.foods.length;
            index++
        ) {

            const item =
                meal.foods[index];


            if (
                !item ||
                !FAT_FOODS.has(
                    item.key
                )
            ) {
                continue;
            }


            const food =
                FOODS[item.key];


            if (!food) {
                continue;
            }


            const limits =
                getFoodLimits(
                    item.key
                );


            const currentGrams =
                Number(item.grams);


            if (
                currentGrams >=
                limits.max
            ) {
                continue;
            }


            const fatPerGram =
                Number(food.fat) /
                100;


            if (
                fatPerGram <= 0
            ) {
                continue;
            }


            let gramsToAdd =
                difference /
                fatPerGram;


            gramsToAdd =
                Math.min(
                    gramsToAdd,
                    limits.max -
                    currentGrams
                );


            gramsToAdd =
                Math.max(
                    1,
                    Math.round(
                        gramsToAdd
                    )
                );


            const changed =
                replaceFoodGrams(
                    {
                        meal,
                        index,
                        item
                    },
                    currentGrams +
                    gramsToAdd
                );


            if (!changed) {
                continue;
            }


            actual =
                calculatePlanNutrition(
                    meals
                );


            difference =
                target -
                actual.fat;


            if (
                difference <= 0
            ) {
                return true;
            }
        }
    }


    // Se ainda faltar gordura,
    // adiciona uma fonte nova.

    while (
        difference > 0
    ) {

        const found =
            findFoodToAdd(
                meals,
                FAT_FOODS
            );


        if (!found) {
            break;
        }


        const fatPerGram =
            Number(
                found.food.fat
            ) /
            100;


        if (
            fatPerGram <= 0
        ) {
            break;
        }


        let grams =
            difference /
            fatPerGram;


        const limits =
            getFoodLimits(
                found.foodKey
            );


        grams =
            clamp(
                grams,
                limits.min,
                limits.max
            );


        grams =
            Math.round(
                grams
            );


        if (
            !addFoodToPlan(
                found,
                grams
            )
        ) {
            break;
        }


        actual =
            calculatePlanNutrition(
                meals
            );


        difference =
            target -
            actual.fat;
    }


    return (
        difference <=
        Math.max(
            3,
            target * 0.05
        )
    );
}


// ============================================================
// AJUSTE AUTOMÁTICO DO PLANO
// ============================================================

function autoAdjustMealPlan(
    meals,
    targetMacros,
    targetCalories
) {

    if (
        !meals ||
        !targetMacros
    ) {
        return calculatePlanNutrition(
            meals
        );
    }


    const target = {

        calories:
            Number(
                targetCalories || 0
            ),

        protein:
            Number(
                targetMacros.protein || 0
            ),

        carbs:
            Number(
                targetMacros.carbs || 0
            ),

        fat:
            Number(
                targetMacros.fat || 0
            )
    };


    const MAX_ITERATIONS = 30;


    for (
        let iteration = 0;
        iteration < MAX_ITERATIONS;
        iteration++
    ) {

        const actual =
            calculatePlanNutrition(
                meals
            );


        if (
            isWithinTolerance(
                actual,
                target
            )
        ) {
            break;
        }


        let changed = false;


        // Proteína
        if (
            target.protein -
            actual.protein >
            Math.max(
                3,
                target.protein *
                0.025
            )
        ) {

            const result =
                adjustProtein(
                    meals,
                    target.protein
                );


            if (result) {
                changed = true;
            }
        }


        // Carboidrato
        const afterProtein =
            calculatePlanNutrition(
                meals
            );


        if (
            target.carbs -
            afterProtein.carbs >
            Math.max(
                5,
                target.carbs *
                0.025
            )
        ) {

            const result =
                adjustCarbs(
                    meals,
                    target.carbs
                );


            if (result) {
                changed = true;
            }
        }


        // Gordura
        const afterCarbs =
            calculatePlanNutrition(
                meals
            );


        if (
            target.fat -
            afterCarbs.fat >
            Math.max(
                3,
                target.fat *
                0.025
            )
        ) {

            const result =
                adjustFat(
                    meals,
                    target.fat
                );


            if (result) {
                changed = true;
            }
        }


        if (!changed) {
            break;
        }
    }


    return calculatePlanNutrition(
        meals
    );
}


// ============================================================
// GERAR UMA REFEIÇÃO
// ============================================================

function generateMeal(
    mealKey,
    target,
    usedFoods = []
) {

    if (
        mealKey ===
        "cafe_da_manha"
    ) {

        return {
            mealKey,

            name:
                MEAL_NAMES[
                    mealKey
                ],

            foods:
                generateBreakfast(
                    target,
                    usedFoods
                )
        };
    }


    if (
        mealKey ===
        "almoco"
    ) {

        return {
            mealKey,

            name:
                MEAL_NAMES[
                    mealKey
                ],

            foods:
                generateMainMeal(
                    target,
                    mealKey,
                    usedFoods
                )
        };
    }


    if (
        mealKey ===
        "jantar"
    ) {

        return {
            mealKey,

            name:
                MEAL_NAMES[
                    mealKey
                ],

            foods:
                generateMainMeal(
                    target,
                    mealKey,
                    usedFoods
                )
        };
    }


    return {

        mealKey,

        name:
            MEAL_NAMES[
                mealKey
            ],

        foods:
            generateSnack(
                target,
                mealKey,
                usedFoods
            )
    };
}


// ============================================================
// GERAR PLANO COMPLETO
// ============================================================

function generateMealPlan(
    nutritionProfile
) {

    if (!nutritionProfile) {

        throw new Error(
            "Perfil nutricional não informado."
        );
    }


    const calories =
        Number(
            nutritionProfile.targetCalories
        );


    const macros =
        nutritionProfile.macros;


    if (
        !Number.isFinite(calories) ||
        calories <= 0
    ) {

        throw new Error(
            "targetCalories inválido."
        );
    }


    if (
        !macros ||
        !Number.isFinite(
            Number(macros.protein)
        ) ||
        !Number.isFinite(
            Number(macros.carbs)
        ) ||
        !Number.isFinite(
            Number(macros.fat)
        )
    ) {

        throw new Error(
            "Macronutrientes inválidos."
        );
    }


    // ========================================================
    // DISTRIBUIÇÃO
    // ========================================================

    const distributed =
        distributeMeals(
            calories,
            macros
        );


    const meals = {};


    const usedFoods = [];


    // ========================================================
    // GERAR CADA REFEIÇÃO
    // ========================================================

    for (
        const mealKey
        of Object.keys(
            MEAL_DISTRIBUTION
        )
    ) {

        const meal =
            generateMeal(
                mealKey,
                distributed[
                    mealKey
                ].target,
                usedFoods
            );


        // Garantir nutrição
        // da refeição.

        meal.nutrition =
            calculateMealNutrition(
                meal.foods
            );


        meals[mealKey] =
            meal;


        // Registrar alimentos
        // utilizados para melhorar
        // a variedade.

        for (
            const item
            of meal.foods
        ) {

            if (
                item &&
                item.key &&
                !usedFoods.includes(
                    item.key
                )
            ) {

                usedFoods.push(
                    item.key
                );
            }
        }
    }


    // ========================================================
    // TOTAL ANTES DO AJUSTE
    // ========================================================

    const dailyBeforeAdjustment =
        calculatePlanNutrition(
            meals
        );


    // ========================================================
    // AJUSTE AUTOMÁTICO
    // ========================================================

    const dailyAfterAdjustment =
        autoAdjustMealPlan(
            meals,
            macros,
            calories
        );


    // ========================================================
    // DIFERENÇAS
    // ========================================================

    const differences =
        calculatePlanDifferences(
            dailyAfterAdjustment,
            {
                calories,

                protein:
                    Number(
                        macros.protein
                    ),

                carbs:
                    Number(
                        macros.carbs
                    ),

                fat:
                    Number(
                        macros.fat
                    )
            }
        );


    const withinTolerance =
        isWithinTolerance(
            dailyAfterAdjustment,
            {
                calories,

                protein:
                    Number(
                        macros.protein
                    ),

                carbs:
                    Number(
                        macros.carbs
                    ),

                fat:
                    Number(
                        macros.fat
                    )
            }
        );


    return {

        targetCalories:
            calories,

        macros: {

            protein:
                Number(
                    macros.protein
                ),

            carbs:
                Number(
                    macros.carbs
                ),

            fat:
                Number(
                    macros.fat
                )
        },

        meals,

        dailyBeforeAdjustment,

        daily:
            dailyAfterAdjustment,

        differences,

        withinTolerance
    };
}


// ============================================================
// FORMATAR PARA A IA
// ============================================================

function formatMealPlanForAI(
    mealPlan
) {

    if (!mealPlan) {
        return "";
    }


    let text = "";


    text +=
        `Meta diária: ${mealPlan.targetCalories} kcal\n`;

    text +=
        `Proteínas: ${mealPlan.macros.protein} g\n`;

    text +=
        `Carboidratos: ${mealPlan.macros.carbs} g\n`;

    text +=
        `Gorduras: ${mealPlan.macros.fat} g\n\n`;


    for (
        const [mealKey, meal]
        of Object.entries(
            mealPlan.meals || {}
        )
    ) {

        if (!meal) {
            continue;
        }


        text +=
            `${meal.name || MEAL_NAMES[mealKey] || mealKey}:\n`;


        for (
            const food
            of meal.foods || []
        ) {

            text +=
                `- ${food.name} - ${food.grams}g\n`;
        }


        const nutrition =
            calculateMealNutrition(
                meal.foods
            );


        text +=
            `Total: ${Math.round(nutrition.calories)} kcal\n`;

        text +=
            `Proteínas: ${roundNumber(nutrition.protein)}g\n`;

        text +=
            `Carboidratos: ${roundNumber(nutrition.carbs)}g\n`;

        text +=
            `Gorduras: ${roundNumber(nutrition.fat)}g\n\n`;
    }


    const daily =
        mealPlan.daily ||
        calculatePlanNutrition(
            mealPlan.meals
        );


    text +=
        "TOTAL ESTIMADO DO DIA:\n";


    text +=
        `Calorias: ${Math.round(daily.calories)} kcal\n`;


    text +=
        `Proteínas: ${roundNumber(daily.protein)}g\n`;


    text +=
        `Carboidratos: ${roundNumber(daily.carbs)}g\n`;


    text +=
        `Gorduras: ${roundNumber(daily.fat)}g\n`;


    return text;
}


// ============================================================
// RESUMO DO PLANO
// ============================================================

function getMealPlanSummary(
    mealPlan
) {

    if (!mealPlan) {
        return null;
    }


    const daily =
        mealPlan.daily ||
        calculatePlanNutrition(
            mealPlan.meals
        );


    return {

        targetCalories:
            Number(
                mealPlan.targetCalories
            ) || 0,

        targetProtein:
            Number(
                mealPlan.macros?.protein
            ) || 0,

        targetCarbs:
            Number(
                mealPlan.macros?.carbs
            ) || 0,

        targetFat:
            Number(
                mealPlan.macros?.fat
            ) || 0,

        calories:
            Number(
                daily.calories
            ) || 0,

        protein:
            Number(
                daily.protein
            ) || 0,

        carbs:
            Number(
                daily.carbs
            ) || 0,

        fat:
            Number(
                daily.fat
            ) || 0,

        differences:
            mealPlan.differences ||
            null,

        withinTolerance:
            Boolean(
                mealPlan.withinTolerance
            )
    };
}


// ============================================================
// EXPORTAÇÕES
// ============================================================

module.exports = {

    MEAL_DISTRIBUTION,

    MEAL_NAMES,

    MEAL_TEMPLATES,

    FOOD_PORTION_LIMITS,

    calculateMealTarget,

    distributeMeals,

    calculateMealNutrition,

    calculatePlanNutrition,

    calculatePlanDifferences,

    isWithinTolerance,

    autoAdjustMealPlan,

    generateBreakfast,

    generateSnack,

    generateMainMeal,

    generateMeal,

    generateMealPlan,

    formatMealPlanForAI,

    getMealPlanSummary
};