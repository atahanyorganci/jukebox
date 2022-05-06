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

        if (!player) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        logger.info(`Currently playing ${player.nowPlaying.title}.`);
        const embed = videoToEmbed(player.nowPlaying);
        await message.channel.send({ embeds: [embed] });
    }
}
