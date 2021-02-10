import { Client, Message } from "discord.js";
import { musician } from ".";
import { Command } from "..";
import { logger } from "../../bot";

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
        if (musician.streaming) {
            await message.channel.send("Bot is currently playing.");
            return;
        }

        const errorMessage =
            "You need to be in the same voice channel with the bot to resume the musician!";
        // User should be in a voice channel
        if (!message.member.voice.channel) {
            await message.channel.send(errorMessage);
            return;
        }

        const voiceChannel = message.member.voice.channel;

        // User should be in the same channel with the bot
        if (musician.channel !== voiceChannel && musician.channel) {
            await message.channel.send(errorMessage);
            return;
        }

        musician.dispatcher.resume();

        logger.info("Streaming resumed.");
        await message.channel.send("Streaming resumed.");
    }
}
