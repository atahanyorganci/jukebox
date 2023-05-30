import { bold, italic } from "@discordjs/builders";
import { EmbedBuilder } from "discord.js";
import { Command, CommandContext } from "~/commands/index.js";
import JukeBox from "~/music/jukebox.js";

export class QueueCommand extends Command {
    constructor() {
        super({
            name: "queue",
            description: "Displays song queue.",
        });
    }

    async run({ message, guild }: CommandContext, args: string[]): Promise<void> {
        if (args.length !== 0) {
            await message.channel.send("Now playing command doesn't require arguments!");
        }
        const player = JukeBox.the().getPlayer(guild.id);
        if (!player) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        const queue = player.queue.map(({ title }, index) => {
            const number = bold(`${index + 1}.`);
            return `${number} ${italic(title)}`;
        });
        const description = queue.join("\n");

        const embed = new EmbedBuilder()
            .setTitle(`Currently playing ${italic(player.nowPlaying.title)}`)
            .setDescription(description)
            .setColor("#123123");

        await message.channel.send({ embeds: [embed] });
    }
}
