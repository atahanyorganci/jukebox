import { Client, Message } from "discord.js";
import { musician } from "../music";
import { Command } from ".";
import { logger } from "..";

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
        await msg.channel.send(jukebox.nowPlaying.toEmbed());
    }
}
