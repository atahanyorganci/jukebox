import { Client, Message } from "discord.js";
import { Command } from ".";
import { logger } from "..";
import { musician } from "../music";

export class ResumeCommand extends Command {
    constructor() {
        super({
            name: "resume",
            description: "Resumes the current song.",
        });
    }

    async run(bot: Client, message: Message, args: string[]): Promise<void> {
        if (args.length !== 0) {
            await message.channel.send(
                "Resume command doesn't require arguments!"
            );
        }
        const jukebox = musician.get(message.guild.id);

        if (!jukebox) {
            await message.channel.send("Queue is empty!");
            return;
        }

        if (jukebox.streaming) {
            await message.channel.send("Bot is currently playing.");
            return;
        }

        const errorMessage =
            "You need to be in the same voice channel with the bot to resume!";
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

        jukebox.dispatcher.resume();

        logger.info("Streaming resumed.");
        await message.channel.send("Streaming resumed.");
    }
}
