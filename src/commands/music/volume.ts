import { Client, Message } from "discord.js";
import { musician } from ".";
import { Command } from "..";
import { logger } from "../../bot";

export class VolumeCommand extends Command {
    constructor() {
        super({
            name: "volume",
            description: "Sets volume of audio.",
            aliases: ["vol"],
        });
    }

    async run(bot: Client, message: Message, args: string[]): Promise<void> {
        // User should be in a voice channel
        if (!message.member.voice.channel) {
            await message.channel.send("You need to be in a voice channel!");
            return;
        }

        // User should provide volume in arguments
        const argMessage = "You need to provide volume level between 0-100.";
        if (args.length !== 1) {
            await message.channel.send(argMessage);
            return;
        }
        const volume = Number.parseInt(args[0]);
        if (!volume || volume < 0 || volume > 100) {
            await message.channel.send(argMessage);
            return;
        }

        // User should be in the same channel with the bot
        if (
            musician.channel !== message.member.voice.channel &&
            musician.channel
        ) {
            await message.channel.send(
                "Bot is currently playing in another channel!"
            );
            return;
        }

        try {
            musician.dispatcher.setVolume(volume / 100);
            await message.channel.send(`Volume set to ${volume}%.`);
            logger.info(`Volume set to ${volume}%.`);
        } catch (error) {
            logger.error("Error occured when joining channel.");
            await message.channel.send(
                "An error occured while joining your channel."
            );
            return;
        }
    }
}
