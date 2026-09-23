// ============================================================
// IA NUTRIÇÃO + PERSONAL
// SERVIDOR PRINCIPAL
// ============================================================

const express = require("express");
const path = require("path");
const config = require("./config/env");

const {
    ask,
    generateResponse,
    processUserMessage
} = require("./ai/assistant");

const {
    createMealTrackerTable
} = require("./nutrition/mealTracker");

const {
    startWhatsApp
} = require("./whatsapp/whatsapp");

const {
    createUsersTable
} = require("./users/userService");

const {
    createConversationTable
} = require("./database/conversation");

// ============================================================
// EXPRESS
// ============================================================

const app = express();

app.use(express.json());

// ============================================================
// ROTA PRINCIPAL
// ============================================================

app.get("/", (req, res) => {

    res.json({
        status: "online",
        sistema: "IA Nutrição + Personal",
        versao: "1.0.0",
        ambiente:
            process.env.NODE_ENV ||
            "development"
    });

});
// ============================================================
// QR CODE DO WHATSAPP
// ============================================================

app.get("/whatsapp-qr", (req, res) => {

    const qrPath = path.join(
        process.cwd(),
        "whatsapp-qr.png"
    );

    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.setHeader(
        "Pragma",
        "no-cache"
    );

    res.setHeader(
        "Expires",
        "0"
    );

    res.sendFile(qrPath, (error) => {

        if (error) {

            res.status(404).send(
                "QR Code ainda não foi gerado."
            );

        }

    });

});
// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/health", (req, res) => {

    res.json({
        status: "ok",
        servidor: "funcionando",
        timestamp: new Date().toISOString()
    });

});

// ============================================================
// TESTE SIMPLES DA IA
// POST /ai/test
// ============================================================

app.post("/ai/test", async (req, res) => {

    try {

        const {
            message
        } = req.body;

        if (!message) {

            return res.status(400).json({
                success: false,
                error: "message é obrigatório."
            });

        }

        console.log(
            "=========================================="
        );

        console.log(
            "TESTE DA IA"
        );

        console.log(
            "Mensagem:",
            message
        );

        console.log(
            "=========================================="
        );

        const response =
            await ask(message);

        console.log(
            "=========================================="
        );

        console.log(
            "RESPOSTA DA IA"
        );

        console.log(
            response
        );

        console.log(
            "=========================================="
        );

        return res.status(200).json({

            success: true,

            message:
                response

        });

    } catch (error) {

        console.error(
            "Erro ao testar IA:",
            error
        );

        return res.status(500).json({

            success: false,

            error:
                "Erro ao processar a IA.",

            details:
                error.message

        });

    }

});

// ============================================================
// TESTE DA IA COM CONTEXTO
// POST /ai/test-context
// ============================================================

app.post(
    "/ai/test-context",
    async (req, res) => {

        try {

            const {
                message,
                context
            } = req.body;

            if (!message) {

                return res.status(400).json({

                    success: false,

                    error:
                        "message é obrigatório."

                });

            }

            console.log(
                "=========================================="
            );

            console.log(
                "TESTE DA IA COM CONTEXTO"
            );

            console.log(
                "=========================================="
            );

            console.log(
                "Mensagem:",
                message
            );

            console.log(
                "Contexto:",
                JSON.stringify(
                    context || {},
                    null,
                    2
                )
            );

            const result =
                await generateResponse(
                    message,
                    context || {}
                );

            console.log(
                "=========================================="
            );

            console.log(
                "RESPOSTA DA IA"
            );

            console.log(
                "=========================================="
            );

            console.log(
                result.text
            );

            return res.status(200).json({

                success: true,

                message:
                    result.text,

                model:
                    result.model,

                usage:
                    result.usage

            });

        } catch (error) {

            console.error(
                "Erro no teste com contexto:",
                error
            );

            return res.status(500).json({

                success: false,

                error:
                    "Erro ao processar a IA.",

                details:
                    error.message

            });

        }

    }
);

// ============================================================
// TESTE DIRETO DO USUÁRIO
// POST /ai/user
// ============================================================

app.post(
    "/ai/user",
    async (req, res) => {

        try {

            const {
                phone,
                message
            } = req.body;

            if (!phone) {

                return res.status(400).json({

                    success: false,

                    error:
                        "phone é obrigatório."

                });

            }

            if (!message) {

                return res.status(400).json({

                    success: false,

                    error:
                        "message é obrigatório."

                });

            }

            console.log(
                "=========================================="
            );

            console.log(
                "TESTE USUÁRIO"
            );

            console.log(
                "Telefone:",
                phone
            );

            console.log(
                "Mensagem:",
                message
            );

            console.log(
                "=========================================="
            );

            const result =
                await processUserMessage(
                    phone,
                    message
                );

            return res.status(200).json({

                success: true,

                message:
                    result.message,

                user:
                    result.user || null

            });

        } catch (error) {

            console.error(
                "Erro ao processar usuário:",
                error
            );

            return res.status(500).json({

                success: false,

                error:
                    "Erro ao processar usuário.",

                details:
                    error.message

            });

        }

    }
);

// ============================================================
// INICIAR SERVIDOR
// ============================================================

async function startServer() {

    try {

        console.log(
            "=========================================="
        );

        console.log(
            "      INICIANDO IA NUTRIÇÃO + PERSONAL"
        );

        console.log(
            "=========================================="
        );

        // ====================================================
        // BANCO DE DADOS
        // ====================================================

        console.log(
            "Inicializando banco de dados..."
        );

        // ----------------------------------------------------
        // USUÁRIOS
        // ----------------------------------------------------

        await createUsersTable();

        console.log(
            "✓ Tabela users OK"
        );

        // ----------------------------------------------------
        // CONVERSAS
        // ----------------------------------------------------

        await createConversationTable();

        console.log(
            "✓ Tabela conversation_messages OK"
        );

        // ----------------------------------------------------
        // REFEIÇÕES
        // ----------------------------------------------------

        await createMealTrackerTable();

        console.log(
            "✓ Tabela meal_entries OK"
        );

        // ====================================================
        // SERVIDOR HTTP
        // ====================================================

        app.listen(
            config.port,
            () => {

                console.log(
                    "=========================================="
                );

                console.log(
                    "       SERVIDOR ONLINE"
                );

                console.log(
                    "=========================================="
                );

                console.log(
                    `Porta: ${config.port}`
                );

                console.log(
                    `http://localhost:${config.port}`
                );

                console.log(
                    "=========================================="
                );

            }
        );

        // ====================================================
        // WHATSAPP
        // ====================================================

        console.log(
            "Inicializando WhatsApp..."
        );

        await startWhatsApp();

        console.log(
            "WhatsApp iniciado."
        );

    } catch (error) {

        console.error(
            "=========================================="
        );

        console.error(
            "ERRO AO INICIAR SISTEMA"
        );

        console.error(
            "=========================================="
        );

        console.error(
            error
        );

        process.exit(1);

    }

}

// ============================================================
// INICIAR
// ============================================================

startServer();