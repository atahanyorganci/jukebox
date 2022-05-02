import { Client, Message } from "discord.js";
import { Command } from ".";
import { queryVideo } from "../music";

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
        const video = await queryVideo(videoName);
        const embed = video.toEmbed();
        msg.channel.send({ embeds: [embed] });
    }
}
