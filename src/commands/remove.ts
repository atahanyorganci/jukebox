import { Client, Message } from "discord.js";
import { Command } from "@commands";
import { logger } from "@logger";
import JukeBox from "@music/jukebox";
import { videoToEmbed } from "@music";

export class RemoveCommand extends Command {
    constructor() {
        super({
            name: "remove",
            description: "Removes a song from queue.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (!msg.member || !msg.guild) {
            return;
        }

        if (args.length !== 1) {
            await msg.channel.send("`!remove` takes in index of the song.");
        }

        const player = JukeBox.the().getPlayer(msg.guild.id);
        if (!player) {
            await msg.channel.send("Bot is not currently playing.");
            return;
        }

        const index = Number.parseInt(args[0]) - 1;
        if (isNaN(index) || index < 0 || index >= player.queue.length) {
            await msg.channel.send(
                `Queue index should be between 1-${player.queue.length}.`
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

        const { id: channelId } = msg.member.voice.channel;

        // User should be in the same channel with the bot
        if (player.channelId !== channelId) {
            await msg.channel.send(errorMessage);
            return;
        }

        try {
            const video = player.remove(index);
            const embed = videoToEmbed(video, {
                title: "Removed from queue",
            });
            await msg.channel.send({ embeds: [embed] });
        } catch (error) {
            logger.error(`${error} occurred while handling remove command`);
        }
    }
}
