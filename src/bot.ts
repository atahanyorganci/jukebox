import * as dotenv from "dotenv";
import { Client } from "discord.js";
import * as winston from "winston";
import { CommandHandlerBuilder } from "./command";
import infoCommand, { infoDescription } from "./command/info";

export const { PREFIX, BOT_TOKEN, LOG_FILE } = dotenv.config().parsed;

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${level.toUpperCase()}: ${timestamp}: ${message}`;
});

const colorizer = colorize();

export const logger = winston.createLogger({
    format: combine(
        timestamp({ format: "YYYY/MM/DD HH:mm:ss" }),
        myFormat,
        printf(msg =>
            colorizer.colorize(
                msg.level,
                `[${msg.level.toUpperCase()}] ${msg.timestamp}: ${msg.message}`
            )
        )
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: LOG_FILE }),
    ],
});

const handler = new CommandHandlerBuilder()
    .register("info", infoCommand, { description: infoDescription })
    .build();

export const bot = new Client();
bot.once("ready", () => {
    logger.info("Bot is ready.");
});
bot.on("message", msg => {
    handler.handle(msg);
});
bot.login(BOT_TOKEN);
