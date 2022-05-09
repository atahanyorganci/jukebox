import { Command, CommandContext } from "@commands";
import JukeBox from "@music/jukebox";
import { PlayerState } from "@music/player";
import { unreachable } from "@util";
import { italic } from "@discordjs/builders";

export class SkipCommand extends Command {
    constructor() {
        super({
            name: "skip",
            description: "Skips current song.",
        });
    }

    async run(
        { message, guild, member }: CommandContext,
        args: string[]
    ): Promise<void> {
        if (args.length !== 0) {
            await message.channel.send(
                "Skip command doesn't require arguments!"
            );
        }

        const player = JukeBox.the().getPlayer(guild.id);
        if (!player || !player.isPlaying) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        // User should be in the same channel with the bot
        const channelId = member.voice.channel?.id;
        if (player.channelId !== channelId) {
            await message.channel.send(
                "You need to be in the same voice channel with the bot to skip tracks!"
            );
            return;
        }

        const skipped = player.skip();
        if (player.state === PlayerState.Stopped) {
            await message.channel.send("No more songs in queue.");
            return;
        }
        const current = player.nowPlaying;
        if (!current) {
            unreachable(
                "`queue.current` should not be `null` if `queue.state` is not `Stopped`."
            );
        }
        const skippedTitle = italic(skipped.title);
        const currentTitle = italic(current.title);
        const embed = current
            .toEmbed()
            .setTitle(`Skipped ${skippedTitle}, playing ${currentTitle}`);
        await message.channel.send({ embeds: [embed] });
    }
}
