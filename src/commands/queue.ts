import { MessageEmbed } from "discord.js";
import { Command, CommandContext } from "@commands";
import JukeBox from "@music/jukebox";

export class QueueCommand extends Command {
    constructor() {
        super({
            name: "queue",
            description: "Displays song queue.",
        });
    }

    async run(
        { message, guild }: CommandContext,
        args: string[]
    ): Promise<void> {
        if (args.length !== 0) {
            await message.channel.send(
                "Now playing command doesn't require arguments!"
            );
        }
        const player = JukeBox.the().getPlayer(guild.id);
        if (!player) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        const current = `Currently playing ${player.nowPlaying.title}`;
        const queue = player.queue.map(({ title }, index) => {
            return `${index + 1}. ${title}`;
        });
        const description = [current, ...queue].join("\n");

        const embed = new MessageEmbed({
            title: "Song Queue",
            description,
            color: "#123123",
        });

        await message.channel.send({ embeds: [embed] });
    }
}
