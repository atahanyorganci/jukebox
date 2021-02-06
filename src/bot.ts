import * as dotenv from "dotenv";
import { Client } from "discord.js";
import * as winston from "winston";

const { BOT_TOKEN, LOG_FILE } = dotenv.config().parsed;

const { combine, timestamp, label, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${level.toUpperCase()}: ${timestamp}: ${message}`;
});

const colorizer = colorize();

const logger = winston.createLogger({
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

const client = new Client();
client.once("ready", () => {
    logger.info("Bot is ready.");
});
client.login(BOT_TOKEN);
