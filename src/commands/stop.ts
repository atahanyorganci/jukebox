import { Client, Message } from "discord.js";
import { Command } from ".";
import { logger } from "..";
import { musician } from "../music";

export class StopCommand extends Command {
    constructor() {
        super({
            name: "stop",
            description: "Stop audio stream, clears queue, and leaves channel.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (args.length !== 0) {
            await msg.channel.send("Stop command doesn't require arguments!");
        }

        const jukebox = musician.get(msg.guild.id);
        if (!jukebox || !jukebox.streaming) {
            await msg.channel.send("Bot is not currently playing.");
            return;
        }

        const errorMessage =
            "You need to be in the same voice channel with the bot to stop it";
        // User should be in a voice channel
        if (!msg.member.voice.channel) {
            await msg.channel.send(errorMessage);
            return;
        }

        const voiceChannel = msg.member.voice.channel;

        // User should be in the same channel with the bot
        if (jukebox.channel !== voiceChannel && jukebox.channel) {
            await msg.channel.send(errorMessage);
            return;
        }

        try {
            const result = await jukebox.clear();
            if (result === "success") {
                await msg.channel.send("Stopped streaming.");
            } else if (result === "error") {
                await msg.channel.send("An error occurred while stopping.");
            }
        } catch (error) {
            logger.error(`${error} occurred while handling stop command`);
        }
    }
}
