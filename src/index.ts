import { Client } from "discord.js";
import * as winston from "winston";
import { DispactherBuilder } from "./commands";
import { InfoCommand } from "./commands/info";
import { NowPlayingCommand } from "./commands/nowPlaying";
import { PauseCommand } from "./commands/pause";
import { PlayCommand } from "./commands/play";
import { QueueCommand } from "./commands/queue";
import { ResumeCommand } from "./commands/resume";
import { SearchVideoCommand } from "./commands/search";
import { SkipCommand } from "./commands/skip";
import { VolumeCommand } from "./commands/volume";
import config from "./config";

export const { BOT_TOKEN, API_KEY, PREFIX } = config();

const { combine, timestamp, printf, colorize } = winston.format;
const myFormat = printf(({ level, message, timestamp }) => {
    const colorizer = colorize();
    const level_str = colorizer.colorize(level, `[${level.toUpperCase()}]:`);
    return `${level_str} ${timestamp}: ${message}`;
});

export const logger = winston.createLogger({
    format: combine(timestamp({ format: "YYYY/MM/DD HH:mm:ss" }), myFormat),
    transports: [new winston.transports.Console()],
});

export const bot = new Client();
const handler = new DispactherBuilder()
    .register(new InfoCommand())
    .register(new NowPlayingCommand())
    .register(new PauseCommand())
    .register(new PlayCommand())
    .register(new QueueCommand())
    .register(new ResumeCommand())
    .register(new SearchVideoCommand())
    .register(new SkipCommand())
    .register(new VolumeCommand())
    .build();
bot.once("ready", () => {
    logger.info("Bot is ready.");
});
bot.on("message", msg => handler.handle(bot, msg));
bot.login(BOT_TOKEN);
