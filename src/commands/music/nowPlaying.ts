import { Client, Message } from "discord.js";
import { musician } from ".";
import { Command } from "..";
import { logger } from "../../bot";

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
        if (!musician.streaming) {
            await msg.channel.send("Bot is not currently playing.");
            return;
        }

        logger.info(`Currently playing ${musician.nowPlaying.title}.`);
        await msg.channel.send(musician.nowPlaying.toEmbed());
    }
}
