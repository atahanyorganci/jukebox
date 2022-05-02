import { Client, Message } from "discord.js";
import { Command } from "@commands";
import { logger } from "@logger";
import JukeBox from "@music/jukebox";
import { PlayerState } from "@music/player";
import { videoToEmbed } from "@music";

export class SkipCommand extends Command {
    constructor() {
        super({
            name: "skip",
            description: "Skips current song.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (!msg.member || !msg.guild) {
            return;
        }

        if (args.length !== 0) {
            await msg.channel.send("Skip command doesn't require arguments!");
        }

        const player = JukeBox.the().getPlayer(msg.guild.id);
        if (!player || !player.isPlaying) {
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

        const { id: channelId } = msg.member.voice.channel;

        // User should be in the same channel with the bot
        if (player.channelId !== channelId) {
            await msg.channel.send(errorMessage);
            return;
        }

        try {
            const { title } = player.skip();
            if (player.state === PlayerState.Stopped) {
                await msg.channel.send("No more songs in queue.");
            }
            const current = player.nowPlaying();
            const embed = videoToEmbed(current, {
                title: `Skipped ${title} and currently playing:`,
            });
            await msg.channel.send({ embeds: [embed] });
        } catch (error) {
            logger.error(`${error} occurred while handling skip command`);
        }
    }
}
