import { Client, Message } from "discord.js";
import { musician } from "@music";
import { Command } from "@commands";
import { logger } from "@logger";

export class NowPlayingCommand extends Command {
    constructor() {
        super({
            name: "np",
            description: "Displays currently playing song.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (args.length !== 0) {
            await msg.channel.send(
                "Now playing command doesn't require arguments!"
            );
        }

        const jukebox = musician.get(msg.guild.id);
        if (!jukebox || !jukebox.streaming) {
            await msg.channel.send("Bot is not currently playing.");
            return;
        }

        logger.info(`Currently playing ${jukebox.nowPlaying.title}.`);
        const embed = jukebox.nowPlaying.toEmbed();
        await msg.channel.send({ embeds: [embed] });
    }
}
