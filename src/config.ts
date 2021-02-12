import * as dotenv from "dotenv";

export interface BotConfig {
    PREFIX: string;
    BOT_TOKEN: string;
    API_KEY: string;
}

function config(): BotConfig {
    try {
        const { PREFIX, BOT_TOKEN, API_KEY } = dotenv.config().parsed;
        return { PREFIX, BOT_TOKEN, API_KEY };
    } catch (err) {
        const { PREFIX, BOT_TOKEN, API_KEY } = process.env;
        return { PREFIX, BOT_TOKEN, API_KEY };
    }
}

export default config;
