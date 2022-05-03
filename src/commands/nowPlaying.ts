import { Client, Message } from "discord.js";
import { Command } from "@commands";
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

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (!msg.member || !msg.guild) {
            return;
        }

        if (args.length !== 0) {
            await msg.channel.send(
                "Now playing command doesn't require arguments!"
            );
        }

        const jukebox = JukeBox.the();
        const player = jukebox.getPlayer(msg.guild.id);

        if (!player) {
            return this.botNotPlayingError(bot, msg);
        }
        const current = player.nowPlaying();
        if (!current) {
            return this.botNotPlayingError(bot, msg);
        }

        logger.info(`Currently playing ${current.title}.`);
        const embed = videoToEmbed(current);
        await msg.channel.send({ embeds: [embed] });
    }

    async botNotPlayingError(bot: Client, message: Message): Promise<void> {
        await message.channel.send("Bot is not currently playing.");
    }
}
