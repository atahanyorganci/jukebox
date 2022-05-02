import { Client, Message } from "discord.js";
import { Command } from ".";
import { logger } from "..";
import { musician } from "../music";

export class RemoveCommand extends Command {
    constructor() {
        super({
            name: "remove",
            description: "Removes a song from queue.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (args.length !== 1) {
            await msg.channel.send("`!remove` takes in index of the song.");
        }

        const jukebox = musician.get(msg.guild.id);
        if (!jukebox || !jukebox.streaming) {
            await msg.channel.send("Bot is not currently playing.");
            return;
        }

        const index = Number.parseInt(args[0]) - 1;
        if (isNaN(index) || index < 0 || index >= jukebox.queue.length) {
            await msg.channel.send(
                `Queue index should be between 1-${jukebox.queue.length}.`
            );
            return;
        }

        const errorMessage =
            "You need to be in the same voice channel with the bot to remove a song!";
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
            const video = await jukebox.remove(index);
            if (video) {
                const embed = video.toEmbed("Removed");
                await msg.channel.send({ embeds: [embed] });
            } else {
                await msg.channel.send(
                    "An error occurred while removing the song."
                );
            }
        } catch (error) {
            logger.error(`${error} occurred while handling remove command`);
        }
    }
}
