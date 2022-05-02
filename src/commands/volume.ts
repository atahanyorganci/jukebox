import { Client, Message } from "discord.js";
import { Command } from "@commands";
import { logger } from "@logger";
import { musician } from "@music";

export class VolumeCommand extends Command {
    constructor() {
        super({
            name: "volume",
            description: "Sets volume of audio.",
            aliases: ["vol"],
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        // User should be in a voice channel
        if (!msg.member.voice.channel) {
            await msg.channel.send("You need to be in a voice channel!");
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
        const jukebox = musician.get(msg.guild.id);
        if (!jukebox) {
            await msg.channel.send("Bot is not currently playing!");
            return;
        }

        if (jukebox.channel !== msg.member.voice.channel && jukebox.channel) {
            await msg.channel.send(
                "Bot is currently playing in another channel!"
            );
            return;
        }

        try {
            jukebox.setVolume(volume);
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
