import { Command, CommandContext } from "@commands";
import { queryVideo, videoToEmbed } from "../music";

export class SearchVideoCommand extends Command {
    constructor() {
        super({
            name: "search",
            description: "Search YouTube for given video",
            aliases: ["s"],
        });
    }

    async run({ message }: CommandContext, args: string[]): Promise<void> {
        const videoName = args.join(" ");
        const video = await queryVideo(videoName);
        const embed = videoToEmbed(video);
        await message.channel.send({ embeds: [embed] });
    }
}
