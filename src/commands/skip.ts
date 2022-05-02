import { Client, Message } from "discord.js";
import { Command } from ".";
import { logger } from "..";
import { musician } from "../music";

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

        const jukebox = musician.get(msg.guild.id);
        if (!jukebox || !jukebox.streaming) {
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
        if (jukebox.channel !== voiceChannel && jukebox.channel) {
            await msg.channel.send(errorMessage);
            return;
        }

        try {
            const result = await jukebox.skip();
            if (result === "next") {
                const embed = jukebox.nowPlaying.toEmbed(
                    "Skipped and currently playing"
                );
                await msg.channel.send({ embeds: [embed] });
            } else if (result === "error") {
                await msg.channel.send(
                    "An error occurred while skipping the song."
                );
            }
        } catch (error) {
            logger.error(`${error} occurred while handling skip command`);
        }
    }
}
