import { Client, Message } from "discord.js";
import { musician } from ".";
import { Command } from "..";
import { logger } from "../../bot";

export class SkipCommand extends Command {
    constructor() {
        super({
            name: "skip",
            description: "Skips current song.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (args.length !== 0) {
            await msg.channel.send("Skip command doesn't require arguments!");
        }
        if (!musician.streaming) {
            await msg.channel.send("Bot is not currently playing.");
            return;
        }

        const errorMessage =
            "You need to be in the same voice channel with the bot to skip tracks!";
        // User should be in a voice channel
        if (!msg.member.voice.channel) {
            await msg.channel.send(errorMessage);
            return;
        }

        const voiceChannel = msg.member.voice.channel;

        // User should be in the same channel with the bot
        if (musician.channel !== voiceChannel && musician.channel) {
            await msg.channel.send(errorMessage);
            return;
        }

        musician.nextSong();

        logger.info("Skipping track.");
        await msg.channel.send("Skipping track.");
    }
}
