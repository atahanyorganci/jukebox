import { Client, Message } from "discord.js";
import { Command } from "@commands";
import { logger } from "@logger";
import JukeBox from "@music/jukebox";

const ERROR_MSG =
    "You need to be in the same voice channel with the bot to resume!";

export class ResumeCommand extends Command {
    constructor() {
        super({
            name: "resume",
            description: "Resumes the current song.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (!msg.member || !msg.guild) {
            return;
        }

        if (args.length !== 0) {
            await msg.channel.send("Resume command doesn't require arguments!");
        }
        const player = JukeBox.the().getPlayer(msg.guild.id);

        if (!player) {
            await msg.channel.send(
                "Bot is not currently playing in any voice channel!"
            );
            return;
        }

        if (player.isPlaying) {
            await msg.channel.send("Bot is already playing!");
            return;
        }

        // User should be in a voice channel
        if (!msg.member.voice.channel) {
            await msg.channel.send(ERROR_MSG);
            return;
        }

        const { id: channelId } = msg.member.voice.channel;

        // User should be in the same channel with the bot
        if (player.channelId !== channelId) {
            await msg.channel.send(ERROR_MSG);
            return;
        }

        player.resume();
        logger.info("Streaming resumed.");

        await msg.channel.send("Streaming resumed.");
    }
}
