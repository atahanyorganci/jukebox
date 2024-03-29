import { Client, IntentsBitField } from "discord.js";
import { DispatcherBuilder } from "~/commands/index.js";
import { InfoCommand } from "~/commands/info.js";
import { NowPlayingCommand } from "~/commands/nowPlaying.js";
import { PauseCommand } from "~/commands/pause.js";
import { PlayCommand } from "~/commands/play.js";
import { QueueCommand } from "~/commands/queue.js";
import { RemoveCommand } from "~/commands/remove.js";
import { ResumeCommand } from "~/commands/resume.js";
import { SearchVideoCommand } from "~/commands/search.js";
import { SkipCommand } from "~/commands/skip.js";
import { StopCommand } from "~/commands/stop.js";
import { VolumeCommand } from "~/commands/volume.js";
import { BOT_TOKEN } from "~/config.js";
import { logger } from "~/logger.js";

export const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.MessageContent,
    ],
});

const handler = new DispatcherBuilder()
    .register(new StopCommand())
    .register(new InfoCommand())
    .register(new NowPlayingCommand())
    .register(new PauseCommand())
    .register(new PlayCommand())
    .register(new QueueCommand())
    .register(new RemoveCommand())
    .register(new ResumeCommand())
    .register(new SearchVideoCommand())
    .register(new SkipCommand())
    .register(new VolumeCommand())
    .build();
bot.once("ready", () => {
    logger.info(`Bot is ready, version ${VERSION}`);
});
bot.on("messageCreate", async msg => {
    await handler.handle(bot, msg);
});
bot.login(BOT_TOKEN).catch(err => {
    logger.error(`Failed to start, error ${err}`);
});
