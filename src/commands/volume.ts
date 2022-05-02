import { Client, Message } from "discord.js";
import { Command } from "@commands";
import { logger } from "@logger";
import JukeBox from "@music/jukebox";

export class VolumeCommand extends Command {
    constructor() {
        super({
            name: "volume",
            description: "Sets volume of audio.",
            aliases: ["vol"],
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (!msg.member || !msg.guild) {
            return;
        }

        // User should provide volume in arguments
        const argMessage = "You need to provide volume level between 0-100.";
        if (args.length !== 1) {
            await msg.channel.send(argMessage);
            return;
        }
        const volume = Number.parseInt(args[0]);
        if (!volume || volume < 0 || volume > 100) {
            await msg.channel.send(argMessage);
            return;
        }

        // User should be in the same channel with the bot
        const player = JukeBox.the().getPlayer(msg.guild.id);
        if (!player) {
            await msg.channel.send("Bot is not currently playing!");
            return;
        }

        const errorMessage =
            "You need to be in the same voice channel with the bot to resume!";
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
            player.setVolume(volume);
            await msg.channel.send(`Volume set to ${volume}%.`);
            logger.info(`Volume set to ${volume}%.`);
        } catch (error) {
            logger.error("Error occurred when joining channel.");
            await msg.channel.send(
                "An error occurred while joining your channel."
            );
            return;
        }
    }
}
