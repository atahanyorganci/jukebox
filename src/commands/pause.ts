import { Client, Message } from "discord.js";
import { Command } from ".";
import { logger } from "..";
import { musician } from "../music";

export class PauseCommand extends Command {
    constructor() {
        super({
            name: "pause",
            description: "Pauses the current song.",
        });
    }

    async run(bot: Client, message: Message, args: string[]): Promise<void> {
        if (args.length !== 0) {
            await message.channel.send(
                "Pause command doesn't require arguments!"
            );
        }

        const jukebox = musician.get(message.guild.id);
        if (!jukebox || !jukebox.streaming) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        const errorMessage =
            "You need to be in the same voice channel with the bot to pause the musician!";
        // User should be in a voice channel
        if (!message.member.voice.channel) {
            await message.channel.send(errorMessage);
            return;
        }

        const voiceChannel = message.member.voice.channel;

        // User should be in the same channel with the bot
        if (jukebox.channel !== voiceChannel && jukebox.channel) {
            await message.channel.send(errorMessage);
            return;
        }

        jukebox.dispatcher.pause();

        logger.info("Streaming paused.");
        await message.channel.send("Streaming paused.");
    }
}
