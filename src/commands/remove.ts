import { Command, CommandContext } from "@commands";
import JukeBox from "@music/jukebox";
import { videoToEmbed } from "@music";
import { italic } from "@discordjs/builders";

export class RemoveCommand extends Command {
    constructor() {
        super({
            name: "remove",
            description: "Removes a song from queue.",
        });
    }

    async run(
        { message, guild, member }: CommandContext,
        args: string[]
    ): Promise<void> {
        if (args.length !== 1) {
            await message.channel.send("`!remove` takes in index of the song.");
        }

        const player = JukeBox.the().getPlayer(guild.id);
        if (!player) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        const index = Number.parseInt(args[0]) - 1;
        if (isNaN(index) || index < 0 || index >= player.queue.length) {
            await message.channel.send(
                `Queue index should be between 1-${player.queue.length}.`
            );
            return;
        }

        // User should be in the same channel with the bot
        if (player.channelId !== member.voice.channel?.id) {
            await message.channel.send(
                "You need to be in the same voice channel with the bot to remove a song!"
            );
            return;
        }

        const video = player.remove(index);
        const embed = videoToEmbed(video, {
            title: `Removed ${italic(video.title)} from queue`,
        });
        await message.channel.send({ embeds: [embed] });
    }
}
