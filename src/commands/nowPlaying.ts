import { Command, CommandContext } from "@commands";
import { logger } from "@logger";
import JukeBox from "@music/jukebox";
import { videoToEmbed } from "@music";

export class NowPlayingCommand extends Command {
    constructor() {
        super({
            name: "np",
            description: "Displays currently playing song.",
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
            return;
        }

        const jukebox = JukeBox.the();
        const player = jukebox.getPlayer(guild.id);
        const current = player?.nowPlaying();

        if (!current) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        logger.info(`Currently playing ${current.title}.`);
        const embed = videoToEmbed(current);
        await message.channel.send({ embeds: [embed] });
    }
}
