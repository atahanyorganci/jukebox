import { Client, Message } from "discord.js";
import { Command } from "@commands";
import { logger } from "@logger";
import JukeBox from "@music/jukebox";

export class StopCommand extends Command {
    constructor() {
        super({
            name: "stop",
            description: "Stop audio stream, clears queue, and leaves channel.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (!msg.member || !msg.guild) {
            return;
        }

        if (args.length !== 0) {
            await msg.channel.send("Stop command doesn't require arguments!");
        }

        const player = JukeBox.the().getPlayer(msg.guild.id);
        if (!player || !player.isPlaying) {
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

        const { id: channelId } = msg.member.voice.channel;

        // User should be in the same channel with the bot
        if (player.channelId !== channelId) {
            await msg.channel.send(errorMessage);
            return;
        }

        try {
            player.stop();
            await msg.channel.send("Stopped streaming.");
        } catch (error) {
            logger.error(`${error} occurred while handling stop command`);
        }
    }
}
