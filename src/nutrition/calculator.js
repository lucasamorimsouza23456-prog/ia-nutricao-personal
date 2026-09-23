// ============================================================
// IA NUTRIÇÃO + PERSONAL
// CALCULADORA NUTRICIONAL
// ============================================================

// ------------------------------------------------------------
// CALCULAR IMC
// ------------------------------------------------------------

function calculateBMI(weight, height) {

    weight = Number(weight);
    height = Number(height);

    if (
        !Number.isFinite(weight) ||
        !Number.isFinite(height) ||
        weight <= 0 ||
        height <= 0
    ) {
        return null;
    }

    const bmi =
        weight / (height * height);

    return Number(
        bmi.toFixed(2)
    );
}


// ------------------------------------------------------------
// CLASSIFICAÇÃO DO IMC
// ------------------------------------------------------------

function classifyBMI(bmi) {

    if (
        bmi === null ||
        bmi === undefined ||
        !Number.isFinite(Number(bmi))
    ) {
        return "Não informado";
    }

    bmi = Number(bmi);

    if (bmi < 18.5) {
        return "Abaixo do peso";
    }

    if (bmi < 25) {
        return "Peso normal";
    }

    if (bmi < 30) {
        return "Sobrepeso";
    }

    if (bmi < 35) {
        return "Obesidade grau I";
    }

    if (bmi < 40) {
        return "Obesidade grau II";
    }

    return "Obesidade grau III";
}


// ------------------------------------------------------------
// CALCULAR TMB
// Fórmula de Mifflin-St Jeor
// ------------------------------------------------------------

function calculateBMR({
    weight,
    height,
    age,
    gender
}) {

    weight = Number(weight);
    height = Number(height);
    age = Number(age);

    if (
        !Number.isFinite(weight) ||
        !Number.isFinite(height) ||
        !Number.isFinite(age) ||
        weight <= 0 ||
        height <= 0 ||
        age <= 0 ||
        !gender
    ) {
        return null;
    }

    const normalizedGender =
        String(gender)
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );

    let bmr;

    // --------------------------------------------------------
    // HOMEM
    // --------------------------------------------------------

    if (
        normalizedGender.includes("homem") ||
        normalizedGender.includes("mascul")
    ) {

        bmr =
            (10 * weight) +
            (6.25 * (height * 100)) -
            (5 * age) +
            5;

    }

    // --------------------------------------------------------
    // MULHER
    // --------------------------------------------------------

    else if (
        normalizedGender.includes("mulher") ||
        normalizedGender.includes("feminin")
    ) {

        bmr =
            (10 * weight) +
            (6.25 * (height * 100)) -
            (5 * age) -
            161;

    }

    else {

        return null;
    }

    return Math.round(bmr);
}


// ------------------------------------------------------------
// INTERPRETAR ATIVIDADE FÍSICA
// ------------------------------------------------------------
// activityLevel = quantidade de treinos por semana
//
// 0       = sedentário
// 1 a 2   = levemente ativo
// 3 a 4   = moderadamente ativo
// 5 a 6   = muito ativo
// 7+      = extremamente ativo
// ------------------------------------------------------------

function getActivityFactor(activityLevel) {

    if (
        activityLevel === null ||
        activityLevel === undefined ||
        activityLevel === ""
    ) {
        return null;
    }

    const value =
        Number(activityLevel);

    if (!Number.isFinite(value)) {
        return null;
    }

    if (value <= 0) {
        return 1.20;
    }

    if (value <= 2) {
        return 1.375;
    }

    if (value <= 4) {
        return 1.55;
    }

    if (value <= 6) {
        return 1.725;
    }

    return 1.90;
}


// ------------------------------------------------------------
// DESCRIÇÃO DA ATIVIDADE
// ------------------------------------------------------------

function getActivityDescription(activityLevel) {

    if (
        activityLevel === null ||
        activityLevel === undefined ||
        activityLevel === ""
    ) {
        return "Não informado";
    }

    const value =
        Number(activityLevel);

    if (!Number.isFinite(value)) {
        return "Não informado";
    }

    if (value <= 0) {
        return "Sedentário";
    }

    if (value <= 2) {
        return "Levemente ativo";
    }

    if (value <= 4) {
        return "Moderadamente ativo";
    }

    if (value <= 6) {
        return "Muito ativo";
    }

    return "Extremamente ativo";
}


// ------------------------------------------------------------
// CALCULAR GASTO CALÓRICO TOTAL
// ------------------------------------------------------------

function calculateTDEE(
    bmr,
    activityLevel
) {

    bmr = Number(bmr);

    if (
        !Number.isFinite(bmr) ||
        bmr <= 0
    ) {
        return null;
    }

    const factor =
        getActivityFactor(
            activityLevel
        );

    if (
        factor === null ||
        !Number.isFinite(factor)
    ) {
        return null;
    }

    return Math.round(
        bmr * factor
    );
}


// ------------------------------------------------------------
// CALORIAS PARA PERDA DE GORDURA
// ------------------------------------------------------------

function calculateCutCalories(
    tdee
) {

    tdee = Number(tdee);

    if (
        !Number.isFinite(tdee) ||
        tdee <= 0
    ) {
        return null;
    }

    // Déficit inicial de aproximadamente 20%

    return Math.round(
        tdee * 0.80
    );
}


// ------------------------------------------------------------
// CALCULAR MACROS
// ------------------------------------------------------------

function calculateMacros({
    weight,
    calories
}) {

    weight = Number(weight);
    calories = Number(calories);

    if (
        !Number.isFinite(weight) ||
        !Number.isFinite(calories) ||
        weight <= 0 ||
        calories <= 0
    ) {
        return null;
    }

    // --------------------------------------------------------
    // PROTEÍNA
    // Aproximadamente 2 g/kg
    // --------------------------------------------------------

    const protein =
        Math.round(
            weight * 2
        );

    // --------------------------------------------------------
    // GORDURA
    // Aproximadamente 0,8 g/kg
    // --------------------------------------------------------

    const fat =
        Math.round(
            weight * 0.8
        );

    // --------------------------------------------------------
    // CALORIAS DA PROTEÍNA
    // --------------------------------------------------------

    const proteinCalories =
        protein * 4;

    // --------------------------------------------------------
    // CALORIAS DA GORDURA
    // --------------------------------------------------------

    const fatCalories =
        fat * 9;

    // --------------------------------------------------------
    // CALORIAS RESTANTES PARA CARBOIDRATO
    // --------------------------------------------------------

    const remainingCalories =
        calories -
        proteinCalories -
        fatCalories;

    // --------------------------------------------------------
    // CARBOIDRATOS
    // --------------------------------------------------------

    const carbs =
        Math.max(
            0,
            Math.round(
                remainingCalories / 4
            )
        );

    return {

        protein,

        fat,

        carbs

    };
}


// ------------------------------------------------------------
// CALCULAR PERFIL NUTRICIONAL COMPLETO
// ------------------------------------------------------------

function calculateNutritionProfile(user) {

    if (!user) {

        throw new Error(
            "Dados do usuário são obrigatórios."
        );
    }

    // --------------------------------------------------------
    // PESO
    // --------------------------------------------------------

    const weight =
        Number(user.weight);

    // --------------------------------------------------------
    // ALTURA
    // --------------------------------------------------------

    const height =
        Number(user.height);

    // --------------------------------------------------------
    // IDADE
    // --------------------------------------------------------

    const age =
        Number(user.age);

    // --------------------------------------------------------
    // ATIVIDADE
    //
    // O banco utiliza:
    // activity_level
    //
    // Outras partes do sistema podem utilizar:
    // activityLevel
    //
    // Aceitamos os dois.
    // --------------------------------------------------------

    const rawActivityLevel =
        user.activityLevel !== undefined &&
        user.activityLevel !== null
            ? user.activityLevel
            : user.activity_level;

    const activityLevel =
        Number(rawActivityLevel);

    // --------------------------------------------------------
    // VALIDAÇÃO DOS DADOS PRINCIPAIS
    // --------------------------------------------------------

    const validWeight =
        Number.isFinite(weight) &&
        weight > 0;

    const validHeight =
        Number.isFinite(height) &&
        height > 0;

    const validAge =
        Number.isFinite(age) &&
        age > 0;

    const validActivity =
        Number.isFinite(activityLevel) &&
        activityLevel >= 0;

    // --------------------------------------------------------
    // IMC
    // --------------------------------------------------------

    const bmi =
        validWeight && validHeight
            ? calculateBMI(
                weight,
                height
            )
            : null;

    const bmiClassification =
        classifyBMI(bmi);

    // --------------------------------------------------------
    // TMB
    // --------------------------------------------------------

    const bmr =
        validWeight &&
        validHeight &&
        validAge &&
        user.gender
            ? calculateBMR({

                weight,

                height,

                age,

                gender: user.gender

            })
            : null;

    // --------------------------------------------------------
    // FATOR DE ATIVIDADE
    // --------------------------------------------------------

    const activityFactor =
        validActivity
            ? getActivityFactor(
                activityLevel
            )
            : null;

    // --------------------------------------------------------
    // DESCRIÇÃO DA ATIVIDADE
    // --------------------------------------------------------

    const activityDescription =
        validActivity
            ? getActivityDescription(
                activityLevel
            )
            : "Não informado";

    // --------------------------------------------------------
    // GASTO CALÓRICO TOTAL
    // --------------------------------------------------------

    const tdee =
        bmr !== null &&
        validActivity
            ? calculateTDEE(
                bmr,
                activityLevel
            )
            : null;

    // --------------------------------------------------------
    // CALORIAS-ALVO
    // --------------------------------------------------------

    let calories = null;

    if (tdee !== null) {

        const normalizedGoal =
            String(
                user.goal || ""
            )
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );

        // ----------------------------------------------------
        // PERDA DE GORDURA
        // ----------------------------------------------------

        if (
            normalizedGoal.includes("perder") ||
            normalizedGoal.includes("emagrecer") ||
            normalizedGoal.includes("secar") ||
            normalizedGoal.includes("gordura")
        ) {

            calories =
                calculateCutCalories(
                    tdee
                );
        }

        // ----------------------------------------------------
        // GANHO DE MASSA
        // ----------------------------------------------------

        else if (
            normalizedGoal.includes("ganhar") ||
            normalizedGoal.includes("massa") ||
            normalizedGoal.includes("hipertrofia")
        ) {

            calories =
                Math.round(
                    tdee * 1.10
                );
        }

        // ----------------------------------------------------
        // MANUTENÇÃO
        // ----------------------------------------------------

        else {

            calories =
                Math.round(tdee);
        }
    }

    // --------------------------------------------------------
    // MACROS
    // --------------------------------------------------------

    const macros =
        calories !== null
            ? calculateMacros({

                weight,

                calories

            })
            : null;

    // --------------------------------------------------------
    // RETORNO
    // --------------------------------------------------------

    return {

        weight,

        height,

        age,

        gender:
            user.gender || null,

        goal:
            user.goal || null,

        activityLevel,

        activityDescription,

        activityFactor,

        bmi,

        bmiClassification,

        bmr,

        tdee,

        targetCalories:
            calories,

        macros

    };
}


// ------------------------------------------------------------
// EXPORTAR
// ------------------------------------------------------------

module.exports = {

    calculateBMI,

    classifyBMI,

    calculateBMR,

    getActivityFactor,

    getActivityDescription,

    calculateTDEE,

    calculateCutCalories,

    calculateMacros,

    calculateNutritionProfile

};