const {
    default: makeWASocket,
    useMultiFileAuthState
} = require("@whiskeysockets/baileys");

async function main() {

    const { state, saveCreds } =
        await useMultiFileAuthState("./auth_info");

    const sock = makeWASocket({
        auth: state,

        browser: [
            "IA Nutricao Personal",
            "Chrome",
            "1.0.0"
        ]
    });

    sock.ev.on(
        "creds.update",
        saveCreds
    );

    sock.ev.on(
        "connection.update",
        async (update) => {

            const {
                connection
            } = update;

            if (connection !== "open") {
                return;
            }

            console.log("====================================");
            console.log("WHATSAPP CONECTADO");
            console.log("====================================");

            const numero = "557188634006";

            console.log(
                "Consultando contato:",
                numero
            );

            try {

                const resultado =
                    await sock.onWhatsApp(numero);

                console.log(
                    "Resultado onWhatsApp:"
                );

                console.log(
                    JSON.stringify(
                        resultado,
                        null,
                        2
                    )
                );

                if (
                    !resultado ||
                    resultado.length === 0
                ) {

                    console.log(
                        "CONTATO NÃO ENCONTRADO."
                    );

                    return;
                }

                const contato =
                    resultado[0];

                console.log(
                    "JID encontrado:",
                    contato.jid
                );

                if (contato.lid) {

                    console.log(
                        "LID encontrado:",
                        contato.lid
                    );

                }

                console.log(
                    "===================================="
                );

                console.log(
                    "ENVIANDO MENSAGEM"
                );

                console.log(
                    "===================================="
                );

                const envio =
                    await sock.sendMessage(
                        contato.jid,
                        {
                            text:
                                "TESTE DIRETO DO BOT ✅"
                        }
                    );

                console.log(
                    "===================================="
                );

                console.log(
                    "RESULTADO DO ENVIO"
                );

                console.log(
                    "===================================="
                );

                console.log(
                    JSON.stringify(
                        envio,
                        null,
                        2
                    )
                );

            } catch (error) {

                console.error(
                    "===================================="
                );

                console.error(
                    "ERRO"
                );

                console.error(
                    "===================================="
                );

                console.error(error);

            }

        }

    );

}

main().catch(console.error);