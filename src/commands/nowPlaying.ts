import { italic } from "@discordjs/builders";
import { Command, CommandContext } from "~/commands/index.js";
import JukeBox from "~/music/jukebox.js";

export class NowPlayingCommand extends Command {
    constructor() {
        super({
            name: "np",
            description: "Displays currently playing song.",
        });
    }

    async run({ message, guild }: CommandContext, args: string[]): Promise<void> {
        if (args.length !== 0) {
            await message.channel.send("Now playing command doesn't require arguments!");
            return;
        }

        const jukebox = JukeBox.the();
        const player = jukebox.getPlayer(guild.id);
        if (!player) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        const embed = player.nowPlaying
            .toEmbed()
            .setTitle(`Playing ${italic(player.nowPlaying.title)}`);
        await message.channel.send({ embeds: [embed] });
    }
}
