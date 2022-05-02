import { Client, Message } from "discord.js";
import { Command } from "@commands";
import { logger } from "@logger";
import JukeBox from "@music/jukebox";

const ERROR_MESSAGE =
    "You should be in the same voice channel with the bot to pause!";

export class PauseCommand extends Command {
    constructor() {
        super({
            name: "pause",
            description: "Pauses the current song.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (!msg.member || !msg.guild) {
            return;
        }

        if (args.length !== 0) {
            await msg.channel.send("Pause command doesn't require arguments!");
        }

        const jukeBox = JukeBox.the();
        const player = jukeBox.getPlayer(msg.guild.id);

        if (!player) {
            await msg.channel.send("Bot is not currently playing.");
            return;
        }

        if (!player.isPlaying) {
            await msg.channel.send("Bot is currently paused.");
            return;
        }

        // User should be in the same channel with the bot
        if (!msg.member.voice.channel) {
            await msg.channel.send(ERROR_MESSAGE);
            return;
        }

        const { id: channelId } = msg.member.voice.channel;
        if (player.channelId !== channelId) {
            await msg.channel.send(ERROR_MESSAGE);
            return;
        }

        player.pause();
        logger.info("Streaming paused.");
        await msg.channel.send("Streaming paused.");
    }
}
