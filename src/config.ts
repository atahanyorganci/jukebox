import { logger } from "@logger";
import dotenv from "dotenv";
import { z } from "zod";

const botConfigSchema = z.object({
    API_KEY: z.string(),
    BOT_TOKEN: z.string(),
    PREFIX: z.string().length(1),
});

export type BotConfig = z.infer<typeof botConfigSchema>;

export const NODE_ENV = process.env.NODE_ENV || "development";

function config(): BotConfig {
    if (NODE_ENV === "development") {
        dotenv.config();
    }
    const botConfig = botConfigSchema.safeParse(process.env);
    if (!botConfig.success) {
        logger.error("Invalid environment variables check your .env file");
        process.exit(1);
    }
    return botConfig.data;
}

export const { API_KEY, BOT_TOKEN, PREFIX } = config();
