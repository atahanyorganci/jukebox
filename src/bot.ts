import * as dotenv from "dotenv";
import { Client } from "discord.js";
import * as winston from "winston";
import { DispactherBuilder } from "./commands";
import InfoCommand from "./commands/info";
import { PlayCommand, SearchVideoCommand } from "./commands/music";

export const { PREFIX, BOT_TOKEN, LOG_FILE, API_KEY } = dotenv.config().parsed;

const { combine, timestamp, printf, colorize } = winston.format;
const myFormat = printf(({ level, message, timestamp }) => {
    const colorizer = colorize();
    const level_str = colorizer.colorize(level, `[${level.toUpperCase()}]:`);
    return `${level_str} ${timestamp}: ${message}`;
});

export const logger = winston.createLogger({
    format: combine(timestamp({ format: "YYYY/MM/DD HH:mm:ss" }), myFormat),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: LOG_FILE }),
    ],
});

export const bot = new Client();
const handler = new DispactherBuilder()
    .register(new InfoCommand())
    .register(new SearchVideoCommand())
    .register(new PlayCommand())
    .build();
bot.once("ready", () => {
    logger.info("Bot is ready.");
});
bot.on("message", msg => handler.handle(bot, msg));
bot.login(BOT_TOKEN);
