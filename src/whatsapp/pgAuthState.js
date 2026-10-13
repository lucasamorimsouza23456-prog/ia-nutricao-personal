const { initAuthCreds, BufferJSON, proto } = require("@whiskeysockets/baileys");
const { pool } = require("../database/database");

async function usePostgresAuthState(sessionId = "default") {

    await pool.query(
        "CREATE TABLE IF NOT EXISTS whatsapp_auth (" +
        "session_id TEXT NOT NULL, " +
        "key TEXT NOT NULL, " +
        "value TEXT NOT NULL, " +
        "PRIMARY KEY (session_id, key))"
    );

    async function write(key, data) {
        const value = JSON.stringify(data, BufferJSON.replacer);
        await pool.query(
            "INSERT INTO whatsapp_auth (session_id, key, value) VALUES ($1, $2, $3) " +
            "ON CONFLICT (session_id, key) DO UPDATE SET value = EXCLUDED.value",
            [sessionId, key, value]
        );
    }

    async function read(key) {
        const { rows } = await pool.query(
            "SELECT value FROM whatsapp_auth WHERE session_id = $1 AND key = $2",
            [sessionId, key]
        );
        return rows[0] ? JSON.parse(rows[0].value, BufferJSON.reviver) : null;
    }

    async function remove(key) {
        await pool.query(
            "DELETE FROM whatsapp_auth WHERE session_id = $1 AND key = $2",
            [sessionId, key]
        );
    }

    const creds = (await read("creds")) || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await read(type + "-" + id);
                            if (type === "app-state-sync-key" && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = category + "-" + id;
                            tasks.push(value ? write(key, value) : remove(key));
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => write("creds", creds),
        clearSession: async () => {
            await pool.query("DELETE FROM whatsapp_auth WHERE session_id = $1", [sessionId]);
        }
    };
}

module.exports = { usePostgresAuthState };