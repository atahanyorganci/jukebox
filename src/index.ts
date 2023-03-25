import { DispatcherBuilder } from "@commands";
import { InfoCommand } from "@commands/info";
import { NowPlayingCommand } from "@commands/nowPlaying";
import { PauseCommand } from "@commands/pause";
import { PlayCommand } from "@commands/play";
import { QueueCommand } from "@commands/queue";
import { RemoveCommand } from "@commands/remove";
import { ResumeCommand } from "@commands/resume";
import { SearchVideoCommand } from "@commands/search";
import { SkipCommand } from "@commands/skip";
import { StopCommand } from "@commands/stop";
import { VolumeCommand } from "@commands/volume";
import { BOT_TOKEN } from "@config";
import { logger } from "@logger";
import { Client, IntentsBitField } from "discord.js";

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
    logger.info("Bot is ready.");
});
bot.on("messageCreate", async msg => {
    await handler.handle(bot, msg);
});
bot.login(BOT_TOKEN).catch(err => {
    logger.error(`Failed to start, error ${err}`);
});
