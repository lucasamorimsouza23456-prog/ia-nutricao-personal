// ============================================================
// IA NUTRIÇÃO + PERSONAL
// BASE DE ALIMENTOS
// Valores aproximados por 100g
//
// OBSERVAÇÃO:
// Os valores são referências aproximadas para cálculo do sistema.
// Para uso profissional, a base pode posteriormente ser vinculada
// a uma tabela nutricional oficial.
// ============================================================


// ============================================================
// CATEGORIAS
// ============================================================

const FOOD_CATEGORIES = {

    carboidratos: [
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
        "granola"
    ],

    proteinas: [
        "frango_grelhado",
        "frango_cozido",
        "carne_bovina_magra",
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
        "presunto",
        "queijo_mussarela",
        "queijo_minas"
    ],

    frutas: [
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
        "kiwi",
        "abacate"
    ],

    verduras_legumes: [
        "tomate",
        "cenoura",
        "alface",
        "brocolis",
        "couve",
        "espinafre",
        "pepino",
        "abobrinha",
        "berinjela",
        "beterraba",
        "chuchu",
        "repolho",
        "couve_flor"
    ],

    laticinios: [
        "leite_integral",
        "leite_desnatado",
        "iogurte_natural",
        "iogurte_grego",
        "queijo_mussarela",
        "queijo_minas",
        "requeijao"
    ],

    gorduras: [
        "azeite",
        "castanha",
        "castanha_caju",
        "amendoas",
        "nozes",
        "abacate"
    ],

    leguminosas: [
        "feijao_carioca_cozido",
        "feijao_preto_cozido",
        "lentilha_cozida",
        "grao_bico_cozido"
    ]

};


// ============================================================
// BASE DE ALIMENTOS
// VALORES APROXIMADOS POR 100G
// ============================================================

const FOODS = {


    // ========================================================
    // CARBOIDRATOS
    // ========================================================

    arroz_branco_cozido: {
        name: "Arroz branco cozido",
        category: "carboidratos",
        calories: 130,
        protein: 2.7,
        carbs: 28.2,
        fat: 0.3
    },

    arroz_integral_cozido: {
        name: "Arroz integral cozido",
        category: "carboidratos",
        calories: 124,
        protein: 2.6,
        carbs: 25.8,
        fat: 1.0
    },

    macarrao_cozido: {
        name: "Macarrão cozido",
        category: "carboidratos",
        calories: 157,
        protein: 5.8,
        carbs: 30.9,
        fat: 0.9
    },

    batata_inglesa_cozida: {
        name: "Batata inglesa cozida",
        category: "carboidratos",
        calories: 87,
        protein: 1.9,
        carbs: 20.0,
        fat: 0.1
    },

    batata_doce_cozida: {
        name: "Batata doce cozida",
        category: "carboidratos",
        calories: 77,
        protein: 0.6,
        carbs: 18.4,
        fat: 0.1
    },

    aipim_cozido: {
        name: "Aipim cozido",
        category: "carboidratos",
        calories: 125,
        protein: 0.6,
        carbs: 30.1,
        fat: 0.3
    },

    inhame_cozido: {
        name: "Inhame cozido",
        category: "carboidratos",
        calories: 97,
        protein: 2.0,
        carbs: 23.0,
        fat: 0.1
    },

    cuscuz_milho_cozido: {
        name: "Cuscuz de milho cozido",
        category: "carboidratos",
        calories: 112,
        protein: 2.2,
        carbs: 25.0,
        fat: 0.5
    },

    tapioca: {
        name: "Tapioca",
        category: "carboidratos",
        calories: 230,
        protein: 0.2,
        carbs: 56.0,
        fat: 0.2
    },

    pao_frances: {
        name: "Pão francês",
        category: "carboidratos",
        calories: 300,
        protein: 8.0,
        carbs: 58.0,
        fat: 3.1
    },

    pao_integral: {
        name: "Pão integral",
        category: "carboidratos",
        calories: 247,
        protein: 13.0,
        carbs: 41.0,
        fat: 4.2
    },

    pao_de_forma: {
        name: "Pão de forma",
        category: "carboidratos",
        calories: 250,
        protein: 8.0,
        carbs: 49.0,
        fat: 3.0
    },

    aveia: {
        name: "Aveia",
        category: "carboidratos",
        calories: 389,
        protein: 16.9,
        carbs: 66.3,
        fat: 6.9
    },

    granola: {
        name: "Granola",
        category: "carboidratos",
        calories: 430,
        protein: 10.0,
        carbs: 64.0,
        fat: 16.0
    },


    // ========================================================
    // LEGUMINOSAS
    // ========================================================

    feijao_carioca_cozido: {
        name: "Feijão carioca cozido",
        category: "leguminosas",
        calories: 76,
        protein: 4.8,
        carbs: 13.6,
        fat: 0.5
    },

    feijao_preto_cozido: {
        name: "Feijão preto cozido",
        category: "leguminosas",
        calories: 77,
        protein: 4.5,
        carbs: 14.0,
        fat: 0.5
    },

    lentilha_cozida: {
        name: "Lentilha cozida",
        category: "leguminosas",
        calories: 116,
        protein: 9.0,
        carbs: 20.0,
        fat: 0.4
    },

    grao_bico_cozido: {
        name: "Grão-de-bico cozido",
        category: "leguminosas",
        calories: 164,
        protein: 8.9,
        carbs: 27.4,
        fat: 2.6
    },


    // ========================================================
    // FRANGO
    // ========================================================

    frango_grelhado: {
        name: "Frango grelhado",
        category: "proteinas",
        calories: 165,
        protein: 31.0,
        carbs: 0,
        fat: 3.6
    },

    frango_cozido: {
        name: "Frango cozido",
        category: "proteinas",
        calories: 165,
        protein: 31.0,
        carbs: 0,
        fat: 3.6
    },


    // ========================================================
    // CARNES
    // ========================================================

    carne_bovina_magra: {
        name: "Carne bovina magra",
        category: "proteinas",
        calories: 217,
        protein: 26.0,
        carbs: 0,
        fat: 12.0
    },

    patinho: {
        name: "Patinho",
        category: "proteinas",
        calories: 219,
        protein: 35.0,
        carbs: 0,
        fat: 8.0
    },

    carne_moida: {
        name: "Carne moída",
        category: "proteinas",
        calories: 250,
        protein: 26.0,
        carbs: 0,
        fat: 17.0
    },

    carne_moida_magra: {
        name: "Carne moída magra",
        category: "proteinas",
        calories: 215,
        protein: 27.0,
        carbs: 0,
        fat: 11.0
    },

    alcatra: {
        name: "Alcatra",
        category: "proteinas",
        calories: 241,
        protein: 31.0,
        carbs: 0,
        fat: 12.0
    },

    coxao_mole: {
        name: "Coxão mole",
        category: "proteinas",
        calories: 219,
        protein: 32.0,
        carbs: 0,
        fat: 9.0
    },


    // ========================================================
    // PEIXES
    // ========================================================

    peixe_grelhado: {
        name: "Peixe grelhado",
        category: "proteinas",
        calories: 130,
        protein: 26.0,
        carbs: 0,
        fat: 3.0
    },

    tilapia: {
        name: "Tilápia",
        category: "proteinas",
        calories: 128,
        protein: 26.0,
        carbs: 0,
        fat: 2.7
    },

    atum: {
        name: "Atum",
        category: "proteinas",
        calories: 132,
        protein: 29.0,
        carbs: 0,
        fat: 1.0
    },

    sardinha: {
        name: "Sardinha",
        category: "proteinas",
        calories: 208,
        protein: 25.0,
        carbs: 0,
        fat: 11.0
    },

    salmao: {
        name: "Salmão",
        category: "proteinas",
        calories: 208,
        protein: 20.0,
        carbs: 0,
        fat: 13.0
    },


    // ========================================================
    // OVOS
    // ========================================================

    ovo_inteiro: {
        name: "Ovo inteiro",
        category: "proteinas",
        calories: 143,
        protein: 12.6,
        carbs: 0.7,
        fat: 9.5
    },

    clara_ovo: {
        name: "Clara de ovo",
        category: "proteinas",
        calories: 52,
        protein: 10.9,
        carbs: 0.7,
        fat: 0.2
    },


    // ========================================================
    // QUEIJOS E LATICÍNIOS
    // ========================================================

    queijo_mussarela: {
        name: "Queijo mussarela",
        category: "laticinios",
        calories: 300,
        protein: 22.0,
        carbs: 3.0,
        fat: 22.0
    },

    queijo_minas: {
        name: "Queijo minas",
        category: "laticinios",
        calories: 264,
        protein: 17.4,
        carbs: 3.6,
        fat: 20.0
    },

    presunto: {
        name: "Presunto",
        category: "proteinas",
        calories: 145,
        protein: 18.0,
        carbs: 2.0,
        fat: 6.0
    },

    requeijao: {
        name: "Requeijão",
        category: "laticinios",
        calories: 257,
        protein: 9.6,
        carbs: 3.0,
        fat: 23.0
    },

    leite_integral: {
        name: "Leite integral",
        category: "laticinios",
        calories: 61,
        protein: 3.2,
        carbs: 4.8,
        fat: 3.3
    },

    leite_desnatado: {
        name: "Leite desnatado",
        category: "laticinios",
        calories: 35,
        protein: 3.4,
        carbs: 5.0,
        fat: 0.1
    },

    iogurte_natural: {
        name: "Iogurte natural",
        category: "laticinios",
        calories: 61,
        protein: 3.5,
        carbs: 4.7,
        fat: 3.3
    },

    iogurte_grego: {
        name: "Iogurte grego",
        category: "laticinios",
        calories: 120,
        protein: 8.0,
        carbs: 10.0,
        fat: 5.0
    },


    // ========================================================
    // FRUTAS
    // ========================================================

    banana: {
        name: "Banana",
        category: "frutas",
        calories: 89,
        protein: 1.1,
        carbs: 22.8,
        fat: 0.3
    },

    maca: {
        name: "Maçã",
        category: "frutas",
        calories: 52,
        protein: 0.3,
        carbs: 13.8,
        fat: 0.2
    },

    laranja: {
        name: "Laranja",
        category: "frutas",
        calories: 47,
        protein: 0.9,
        carbs: 11.8,
        fat: 0.1
    },

    mamao: {
        name: "Mamão",
        category: "frutas",
        calories: 43,
        protein: 0.5,
        carbs: 10.8,
        fat: 0.3
    },

    melancia: {
        name: "Melancia",
        category: "frutas",
        calories: 30,
        protein: 0.6,
        carbs: 7.6,
        fat: 0.2
    },

    melao: {
        name: "Melão",
        category: "frutas",
        calories: 34,
        protein: 0.8,
        carbs: 8.2,
        fat: 0.2
    },

    abacaxi: {
        name: "Abacaxi",
        category: "frutas",
        calories: 50,
        protein: 0.5,
        carbs: 13.1,
        fat: 0.1
    },

    manga: {
        name: "Manga",
        category: "frutas",
        calories: 60,
        protein: 0.8,
        carbs: 15.0,
        fat: 0.4
    },

    uva: {
        name: "Uva",
        category: "frutas",
        calories: 69,
        protein: 0.7,
        carbs: 18.1,
        fat: 0.2
    },

    morango: {
        name: "Morango",
        category: "frutas",
        calories: 32,
        protein: 0.7,
        carbs: 7.7,
        fat: 0.3
    },

    pera: {
        name: "Pera",
        category: "frutas",
        calories: 57,
        protein: 0.4,
        carbs: 15.0,
        fat: 0.1
    },

    kiwi: {
        name: "Kiwi",
        category: "frutas",
        calories: 61,
        protein: 1.1,
        carbs: 14.7,
        fat: 0.5
    },

    abacate: {
        name: "Abacate",
        category: "frutas",
        calories: 160,
        protein: 2.0,
        carbs: 8.5,
        fat: 14.7
    },


    // ========================================================
    // VERDURAS E LEGUMES
    // ========================================================

    tomate: {
        name: "Tomate",
        category: "verduras_legumes",
        calories: 18,
        protein: 0.9,
        carbs: 3.9,
        fat: 0.2
    },

    cenoura: {
        name: "Cenoura",
        category: "verduras_legumes",
        calories: 41,
        protein: 0.9,
        carbs: 9.6,
        fat: 0.2
    },

    alface: {
        name: "Alface",
        category: "verduras_legumes",
        calories: 15,
        protein: 1.4,
        carbs: 2.9,
        fat: 0.2
    },

    brocolis: {
        name: "Brócolis",
        category: "verduras_legumes",
        calories: 35,
        protein: 2.4,
        carbs: 7.2,
        fat: 0.4
    },

    couve: {
        name: "Couve",
        category: "verduras_legumes",
        calories: 32,
        protein: 3.0,
        carbs: 5.4,
        fat: 0.6
    },

    espinafre: {
        name: "Espinafre",
        category: "verduras_legumes",
        calories: 23,
        protein: 2.9,
        carbs: 3.6,
        fat: 0.4
    },

    pepino: {
        name: "Pepino",
        category: "verduras_legumes",
        calories: 15,
        protein: 0.7,
        carbs: 3.6,
        fat: 0.1
    },

    abobrinha: {
        name: "Abobrinha",
        category: "verduras_legumes",
        calories: 17,
        protein: 1.2,
        carbs: 3.1,
        fat: 0.3
    },

    berinjela: {
        name: "Berinjela",
        category: "verduras_legumes",
        calories: 25,
        protein: 1.0,
        carbs: 6.0,
        fat: 0.2
    },

    beterraba: {
        name: "Beterraba",
        category: "verduras_legumes",
        calories: 43,
        protein: 1.6,
        carbs: 9.6,
        fat: 0.2
    },

    chuchu: {
        name: "Chuchu",
        category: "verduras_legumes",
        calories: 19,
        protein: 0.8,
        carbs: 4.5,
        fat: 0.1
    },

    repolho: {
        name: "Repolho",
        category: "verduras_legumes",
        calories: 25,
        protein: 1.3,
        carbs: 5.8,
        fat: 0.1
    },

    couve_flor: {
        name: "Couve-flor",
        category: "verduras_legumes",
        calories: 25,
        protein: 1.9,
        carbs: 5.0,
        fat: 0.3
    },


    // ========================================================
    // OLEAGINOSAS
    // ========================================================

    castanha: {
        name: "Castanha",
        category: "gorduras",
        calories: 600,
        protein: 14.0,
        carbs: 30.0,
        fat: 46.0
    },

    castanha_caju: {
        name: "Castanha de caju",
        category: "gorduras",
        calories: 553,
        protein: 18.2,
        carbs: 30.2,
        fat: 43.8
    },

    amendoas: {
        name: "Amêndoas",
        category: "gorduras",
        calories: 579,
        protein: 21.2,
        carbs: 21.6,
        fat: 49.9
    },

    nozes: {
        name: "Nozes",
        category: "gorduras",
        calories: 654,
        protein: 15.2,
        carbs: 13.7,
        fat: 65.2
    },


    // ========================================================
    // GORDURAS
    // ========================================================

    azeite: {
        name: "Azeite de oliva",
        category: "gorduras",
        calories: 884,
        protein: 0,
        carbs: 0,
        fat: 100
    }

};


// ============================================================
// ALIASES
// Permite que o usuário escreva naturalmente no WhatsApp.
// ============================================================

const FOOD_ALIASES = {

    // ARROZ

    arroz: "arroz_branco_cozido",
    "arroz branco": "arroz_branco_cozido",
    "arroz branco cozido": "arroz_branco_cozido",

    "arroz integral": "arroz_integral_cozido",
    "arroz integral cozido": "arroz_integral_cozido",


    // FEIJÃO

    feijao: "feijao_carioca_cozido",
    "feijão": "feijao_carioca_cozido",
    "feijao carioca": "feijao_carioca_cozido",
    "feijão carioca": "feijao_carioca_cozido",

    "feijao preto": "feijao_preto_cozido",
    "feijão preto": "feijao_preto_cozido",


    // FRANGO

    frango: "frango_grelhado",
    "frango grelhado": "frango_grelhado",
    "peito de frango": "frango_grelhado",
    "frango grelhado": "frango_grelhado",

    "frango cozido": "frango_cozido",


    // CARNE

    carne: "carne_bovina_magra",
    "carne bovina": "carne_bovina_magra",
    "carne vermelha": "carne_bovina_magra",

    patinho: "patinho",

    "carne moida": "carne_moida",
    "carne moída": "carne_moida",

    "carne moida magra": "carne_moida_magra",
    "carne moída magra": "carne_moida_magra",

    alcatra: "alcatra",

    "coxao mole": "coxao_mole",
    "coxão mole": "coxao_mole",


    // PEIXE

    peixe: "peixe_grelhado",
    "peixe grelhado": "peixe_grelhado",

    tilapia: "tilapia",
    tilápia: "tilapia",

    atum: "atum",

    sardinha: "sardinha",

    salmao: "salmao",
    salmão: "salmao",


    // OVOS

    ovo: "ovo_inteiro",
    ovos: "ovo_inteiro",
    "ovo inteiro": "ovo_inteiro",

    "clara": "clara_ovo",
    "clara de ovo": "clara_ovo",
    "claras": "clara_ovo",


    // BATATAS

    batata: "batata_inglesa_cozida",
    "batata inglesa": "batata_inglesa_cozida",
    "batata cozida": "batata_inglesa_cozida",

    "batata doce": "batata_doce_cozida",
    "batata-doce": "batata_doce_cozida",
    "batata doce cozida": "batata_doce_cozida",

    aipim: "aipim_cozido",
    mandioca: "aipim_cozido",
    macaxeira: "aipim_cozido",

    inhame: "inhame_cozido",
    "inhame cozido": "inhame_cozido",


    // MASSAS E PÃES

    macarrao: "macarrao_cozido",
    macarrão: "macarrao_cozido",
    massa: "macarrao_cozido",
    "macarrão cozido": "macarrao_cozido",

    pao: "pao_frances",
    pão: "pao_frances",
    "pao frances": "pao_frances",
    "pão francês": "pao_frances",

    "pao integral": "pao_integral",
    "pão integral": "pao_integral",

    "pao de forma": "pao_de_forma",
    "pão de forma": "pao_de_forma",

    aveia: "aveia",
    "flocos de aveia": "aveia",

    granola: "granola",


    // CUSCUZ / TAPIOCA

    cuscuz: "cuscuz_milho_cozido",
    "cuscuz de milho": "cuscuz_milho_cozido",

    tapioca: "tapioca",


    // QUEIJOS

    queijo: "queijo_mussarela",
    mussarela: "queijo_mussarela",
    muçarela: "queijo_mussarela",
    "queijo mussarela": "queijo_mussarela",

    "queijo minas": "queijo_minas",
    "queijo branco": "queijo_minas",

    presunto: "presunto",

    requeijao: "requeijao",
    requeijão: "requeijao",


    // LEITE / IOGURTE

    leite: "leite_integral",
    "leite integral": "leite_integral",

    "leite desnatado": "leite_desnatado",

    iogurte: "iogurte_natural",
    "iogurte natural": "iogurte_natural",

    "iogurte grego": "iogurte_grego",


    // FRUTAS

    banana: "banana",

    maca: "maca",
    maçã: "maca",

    laranja: "laranja",

    mamao: "mamao",
    mamão: "mamao",

    melancia: "melancia",

    melao: "melao",
    melão: "melao",

    abacaxi: "abacaxi",

    manga: "manga",

    uva: "uva",

    morango: "morango",

    pera: "pera",
    pêra: "pera",

    kiwi: "kiwi",

    abacate: "abacate",


    // VERDURAS / LEGUMES

    tomate: "tomate",

    cenoura: "cenoura",

    alface: "alface",

    brocolis: "brocolis",
    brócolis: "brocolis",

    couve: "couve",

    espinafre: "espinafre",

    pepino: "pepino",

    abobrinha: "abobrinha",

    berinjela: "berinjela",

    beterraba: "beterraba",

    chuchu: "chuchu",

    repolho: "repolho",

    "couve flor": "couve_flor",
    "couve-flor": "couve_flor",


    // LEGUMINOSAS

    lentilha: "lentilha_cozida",

    "grao de bico": "grao_bico_cozido",
    "grão de bico": "grao_bico_cozido",
    "grao-de-bico": "grao_bico_cozido",
    "grão-de-bico": "grao_bico_cozido",


    // CASTANHAS

    castanha: "castanha",
    castanhas: "castanha",

    "castanha de caju": "castanha_caju",
    "castanhas de caju": "castanha_caju",

    amendoa: "amendoas",
    amêndoa: "amendoas",
    amendoas: "amendoas",
    amêndoas: "amendoas",

    noz: "nozes",
    nozes: "nozes",


    // GORDURA

    azeite: "azeite",
    "azeite de oliva": "azeite"

};


// ============================================================
// NORMALIZAR TEXTO
// ============================================================

function normalizeText(text) {

    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

}


// ============================================================
// BUSCAR ALIMENTO
// ============================================================

function findFood(name) {

    const normalized =
        normalizeText(name);


    // Primeiro procura nos aliases

    const alias =
        Object.keys(FOOD_ALIASES)
            .find(
                key =>
                    normalizeText(key) ===
                    normalized
            );


    if (alias) {

        return FOODS[
            FOOD_ALIASES[alias]
        ];

    }


    // Depois procura pelo nome oficial

    const direct =
        Object.keys(FOODS)
            .find(
                key =>
                    normalizeText(
                        FOODS[key].name
                    ) === normalized
            );


    if (direct) {

        return FOODS[direct];

    }


    // Por último tenta encontrar pelo próprio ID

    const directKey =
        Object.keys(FOODS)
            .find(
                key =>
                    normalizeText(key) ===
                    normalized
            );


    if (directKey) {

        return FOODS[directKey];

    }


    return null;

}


// ============================================================
// CALCULAR NUTRIENTES POR QUANTIDADE
// ============================================================

function calculateFoodNutrition(
    food,
    grams
) {

    if (!food) {

        return null;

    }


    const quantity =
        Number(grams);


    if (
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {

        return null;

    }


    const factor =
        quantity / 100;


    return {

        grams: quantity,

        calories:
            Math.round(
                food.calories * factor
            ),

        protein:
            Number(
                (
                    food.protein *
                    factor
                ).toFixed(1)
            ),

        carbs:
            Number(
                (
                    food.carbs *
                    factor
                ).toFixed(1)
            ),

        fat:
            Number(
                (
                    food.fat *
                    factor
                ).toFixed(1)
            )

    };

}


// ============================================================
// BUSCAR ALIMENTOS POR CATEGORIA
// ============================================================

function getFoodsByCategory(
    category
) {

    if (!category) {

        return [];

    }


    const keys =
        FOOD_CATEGORIES[category];


    if (!keys) {

        return [];

    }


    return keys
        .filter(
            key => FOODS[key]
        )
        .map(
            key => ({
                key,
                ...FOODS[key]
            })
        );

}


// ============================================================
// LISTAR TODOS OS ALIMENTOS
// ============================================================

function getAllFoods() {

    return Object.entries(FOODS)
        .map(
            ([key, food]) => ({
                key,
                ...food
            })
        );

}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {

    FOODS,

    FOOD_CATEGORIES,

    FOOD_ALIASES,

    normalizeText,

    findFood,

    calculateFoodNutrition,

    getFoodsByCategory,

    getAllFoods

};