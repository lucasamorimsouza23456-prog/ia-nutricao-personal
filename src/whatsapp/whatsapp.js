// ============================================================
// IA NUTRIÇÃO + PERSONAL
// WHATSAPP - CONEXÃO DIRETA
// BAILEYS + IA + POSTGRESQL
// ============================================================

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const QRCode = require("qrcode");

const {
    processUserMessage
} = require("../ai/assistant");

const {
    saveMessage
} = require("../database/conversation");


// ============================================================
// CONFIGURAÇÃO
// ============================================================

const AUTH_FOLDER = process.env.WHATSAPP_AUTH_FOLDER || "./auth_info";
let sock = null;


// ============================================================
// EXTRAIR TEXTO DA MENSAGEM
// ============================================================

function getMessageText(message) {

    if (!message) {
        return null;
    }

    if (message.conversation) {
        return message.conversation;
    }

    if (
        message.extendedTextMessage &&
        message.extendedTextMessage.text
    ) {
        return message.extendedTextMessage.text;
    }

    if (
        message.imageMessage &&
        message.imageMessage.caption
    ) {
        return message.imageMessage.caption;
    }

    if (
        message.videoMessage &&
        message.videoMessage.caption
    ) {
        return message.videoMessage.caption;
    }

    return null;

}


// ============================================================
// LIMPAR NÚMERO
// ============================================================

function normalizePhone(phone) {

    if (!phone) {
        return null;
    }

    const number =
        String(phone)
            .replace(/\D/g, "");

    if (!number) {
        return null;
    }

    return number;

}


// ============================================================
// DESCOBRIR NÚMERO REAL DO REMETENTE
// ============================================================

function getSenderInfo(message) {

    const key = message.key || {};

    const remoteJid =
        key.remoteJid || null;

    const remoteJidAlt =
        key.remoteJidAlt || null;

    const participant =
        key.participant || null;

    const participantAlt =
        key.participantAlt || null;


    // --------------------------------------------------------
    // CASO NORMAL
    // --------------------------------------------------------

    if (
        remoteJid &&
        remoteJid.endsWith("@s.whatsapp.net")
    ) {

        const phone =
            normalizePhone(
                remoteJid.split("@")[0]
            );

        return {

            phone,

            jid: remoteJid,

            originalJid: remoteJid,

            isLid: false

        };

    }


    // --------------------------------------------------------
    // CASO LID
    // --------------------------------------------------------

    if (
        remoteJid &&
        remoteJid.endsWith("@lid")
    ) {

        console.log(
            "Mensagem recebida usando LID:",
            remoteJid
        );


        // O WhatsApp/Baileys pode fornecer
        // o número real através do remoteJidAlt.

        if (
            remoteJidAlt &&
            remoteJidAlt.endsWith(
                "@s.whatsapp.net"
            )
        ) {

            const phone =
                normalizePhone(
                    remoteJidAlt.split("@")[0]
                );

            if (phone) {

                return {

                    phone,

                    jid: remoteJidAlt,

                    originalJid: remoteJid,

                    isLid: true

                };

            }

        }


        // ----------------------------------------------------
        // PARTICIPANT ALT
        // ----------------------------------------------------

        if (
            participantAlt &&
            participantAlt.endsWith(
                "@s.whatsapp.net"
            )
        ) {

            const phone =
                normalizePhone(
                    participantAlt.split("@")[0]
                );

            if (phone) {

                return {

                    phone,

                    jid: participantAlt,

                    originalJid: remoteJid,

                    isLid: true

                };

            }

        }


        // ----------------------------------------------------
        // PARTICIPANT NORMAL
        // ----------------------------------------------------

        if (
            participant &&
            participant.endsWith(
                "@s.whatsapp.net"
            )
        ) {

            const phone =
                normalizePhone(
                    participant.split("@")[0]
                );

            if (phone) {

                return {

                    phone,

                    jid: participant,

                    originalJid: remoteJid,

                    isLid: true

                };

            }

        }


        // ----------------------------------------------------
        // NÃO FOI POSSÍVEL DESCOBRIR
        // ----------------------------------------------------

        return {

            phone: null,

            jid: remoteJid,

            originalJid: remoteJid,

            isLid: true

        };

    }


    // --------------------------------------------------------
    // FALLBACK
    // --------------------------------------------------------

    if (participantAlt) {

        const phone =
            normalizePhone(
                participantAlt.split("@")[0]
            );

        if (phone) {

            return {

                phone,

                jid: participantAlt,

                originalJid: remoteJid,

                isLid: false

            };

        }

    }


    return {

        phone: null,

        jid: remoteJid,

        originalJid: remoteJid,

        isLid: false

    };

}


// ============================================================
// INICIAR WHATSAPP
// ============================================================

async function startWhatsApp() {

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(
        AUTH_FOLDER
    );


    sock = makeWASocket({

        auth: state,

        printQRInTerminal: false,

        browser: [
            "IA Nutricao Personal",
            "Chrome",
            "1.0.0"
        ]

    });


    // ========================================================
    // SALVAR CREDENCIAIS
    // ========================================================

    sock.ev.on(
        "creds.update",
        saveCreds
    );


    // ========================================================
    // CONEXÃO
    // ========================================================

    sock.ev.on(
        "connection.update",
        async (update) => {

            const {
                connection,
                lastDisconnect,
                qr
            } = update;


            // ------------------------------------------------
            // QR CODE
            // ------------------------------------------------

            if (qr) {

                console.log(
                    "=========================================="
                );

                console.log(
                    "           QR CODE WHATSAPP"
                );

                console.log(
                    "=========================================="
                );

                try {

                    await QRCode.toFile(
                        "./whatsapp-qr.png",
                        qr
                    );

                    console.log(
                        "QR Code salvo em:"
                    );

                    console.log(
                        "./whatsapp-qr.png"
                    );

                } catch (error) {

                    console.error(
                        "Erro ao gerar QR Code:",
                        error.message
                    );

                }

                console.log(
                    "=========================================="
                );

            }


            // ------------------------------------------------
            // CONECTADO
            // ------------------------------------------------

            if (connection === "open") {

                console.log(
                    "=========================================="
                );

                console.log(
                    "       WHATSAPP CONECTADO"
                );

                console.log(
                    "       IA PRONTA PARA ATENDER"
                );

                console.log(
                    "=========================================="
                );

            }


            // ------------------------------------------------
            // DESCONECTADO
            // ------------------------------------------------

            if (connection === "close") {

                const statusCode =
                    lastDisconnect
                        ?.error
                        ?.output
                        ?.statusCode;


                const shouldReconnect =
                    statusCode !==
                    DisconnectReason.loggedOut;


                console.log(
                    "WhatsApp desconectado."
                );


                if (shouldReconnect) {

                    console.log(
                        "Reconectando em 3 segundos..."
                    );

                    setTimeout(
                        startWhatsApp,
                        3000
                    );

                } else {

                    console.log(
                        "Sessão encerrada."
                    );

                }

            }

        }
    );


    // ========================================================
    // MENSAGENS RECEBIDAS
    // ========================================================

    sock.ev.on(
        "messages.upsert",
        async ({ messages }) => {

            for (
                const message
                of messages
            ) {

                try {

                    // ----------------------------------------
                    // IGNORAR MENSAGENS SEM CONTEÚDO
                    // ----------------------------------------

                    if (
                        !message ||
                        !message.message
                    ) {

                        continue;

                    }


                    // ----------------------------------------
                    // IGNORAR MENSAGENS ENVIADAS PELO BOT
                    // ----------------------------------------

                    if (
                        message.key &&
                        message.key.fromMe
                    ) {

                        continue;

                    }


                    // ----------------------------------------
                    // TEXTO
                    // ----------------------------------------

                    const text =
                        getMessageText(
                            message.message
                        );


                    if (!text) {

                        console.log(
                            "Mensagem sem texto ignorada."
                        );

                        continue;

                    }


                    // ----------------------------------------
                    // REMETENTE
                    // ----------------------------------------

                    const sender =
                        getSenderInfo(
                            message
                        );


                    console.log("");
                    console.log(
                        "=========================================="
                    );

                    console.log(
                        "           NOVA MENSAGEM"
                    );

                    console.log(
                        "=========================================="
                    );

                    console.log(
                        "JID original:",
                        sender.originalJid
                    );

                    console.log(
                        "É LID:",
                        sender.isLid
                    );

                    console.log(
                        "Número real:",
                        sender.phone ||
                        "NÃO IDENTIFICADO"
                    );

                    console.log(
                        "JID para resposta:",
                        sender.jid
                    );

                    console.log(
                        "Mensagem:",
                        text
                    );

                    console.log(
                        "=========================================="
                    );


                    // ----------------------------------------
                    // SE NÃO TEMOS O TELEFONE REAL
                    // ----------------------------------------

                    if (!sender.phone) {

                        console.error(
                            "ERRO: não foi possível identificar o número real."
                        );

                        console.error(
                            "remoteJid:",
                            message.key?.remoteJid
                        );

                        console.error(
                            "remoteJidAlt:",
                            message.key?.remoteJidAlt
                        );

                        console.error(
                            "participant:",
                            message.key?.participant
                        );

                        console.error(
                            "participantAlt:",
                            message.key?.participantAlt
                        );

                        continue;

                    }


                    // ----------------------------------------
                    // PROCESSAR IA
                    // ----------------------------------------

                    console.log(
                        "Processando mensagem com a IA..."
                    );

                    console.log(
                        "=========================================="
                    );


                    const result =
                        await processUserMessage(
                            sender.phone,
                            text
                        );


                    const response =
                        result?.message ||
                        result?.text ||
                        String(result);


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


                    // ----------------------------------------
                    // SALVAR RESPOSTA NO HISTÓRICO
                    // ----------------------------------------

                    try {

                        await saveMessage(
                            sender.phone,
                            "assistant",
                            response
                        );

                    } catch (error) {

                        console.error(
                            "Erro ao salvar resposta:",
                            error.message
                        );

                    }


                    // ----------------------------------------
                    // ENVIAR PARA O JID CORRETO
                    // ----------------------------------------

                    console.log(
                        "Enviando resposta para:",
                        sender.jid
                    );


                    await sock.sendMessage(
                        sender.jid,
                        {
                            text: response
                        }
                    );


                    console.log(
                        "Resposta enviada para:",
                        sender.phone
                    );

                    console.log(
                        "=========================================="
                    );


                } catch (error) {

                    console.error(
                        "=========================================="
                    );

                    console.error(
                        "ERRO AO PROCESSAR MENSAGEM"
                    );

                    console.error(
                        error
                    );

                    console.error(
                        "=========================================="
                    );

                }

            }

        }
    );


    return sock;

}


// ============================================================
// ENVIAR MENSAGEM MANUALMENTE
// ============================================================

async function sendMessage(
    phone,
    text
) {

    if (!sock) {

        throw new Error(
            "WhatsApp ainda não está conectado."
        );

    }


    const number =
        normalizePhone(phone);


    if (!number) {

        throw new Error(
            "Número de telefone inválido."
        );

    }


    const jid =
        `${number}@s.whatsapp.net`;


    return await sock.sendMessage(
        jid,
        {
            text: String(text)
        }
    );

}


// ============================================================
// EXPORTAR
// ============================================================

module.exports = {

    startWhatsApp,

    sendMessage

};