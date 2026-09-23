const dotenv = require("dotenv");

dotenv.config();

const config = {
    port: process.env.PORT || 3000,

    wame: {
        key: process.env.WAME_KEY,
        server: process.env.WAME_SERVER || "https://us.api-wa.me"
    },

    openai: {
        apiKey: process.env.OPENAI_API_KEY
    }
};

module.exports = config;