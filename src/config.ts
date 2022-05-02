import * as dotenv from "dotenv";
import { logger } from "@logger";

export interface BotConfig {
    PREFIX: string;
    BOT_TOKEN: string;
    API_KEY: string;
}

function config(): BotConfig {
    try {
        dotenv.config();
    } catch {
        logger.info("No .env file found, using defaults.");
    }
    const { BOT_TOKEN, API_KEY, PREFIX } = process.env;
    if (!BOT_TOKEN) {
        throw new Error("`BOT_TOKEN` is not set.");
    }
    if (!API_KEY) {
        throw new Error("`API_KEY` is not set.");
    }
    if (!PREFIX) {
        throw new Error("`PREFIX` is not set.");
    }
    return {
        PREFIX,
        BOT_TOKEN,
        API_KEY,
    };
}

export default config;
export const { BOT_TOKEN, API_KEY, PREFIX } = config();
