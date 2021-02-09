import { Client, Message } from "discord.js";
import { query_video } from ".";
import { Command } from "..";

export class SearchVideoCommand extends Command {
    constructor() {
        super({
            name: "search",
            description: "Search YouTube for given video",
            aliases: ["s"],
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        const videoName = args.join(" ");
        const video = await query_video(videoName);
        msg.channel.send(video.toEmbed());
    }
}
