import { Command, CommandContext } from "@commands";
import JukeBox from "@music/jukebox";

export class StopCommand extends Command {
    constructor() {
        super({
            name: "stop",
            description: "Stop audio stream, clears queue, and leaves channel.",
        });
    }

    async run(
        { message, guild, member }: CommandContext,
        args: string[]
    ): Promise<void> {
        if (!message.member || !message.guild) {
            return;
        }

        if (args.length !== 0) {
            await message.channel.send(
                "Stop command doesn't require arguments!"
            );
        }

        const player = JukeBox.the().getPlayer(guild.id);
        if (!player || !player.isPlaying) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        // User should be in the same channel with the bot
        if (player.channelId !== member.voice.channel?.id) {
            await message.channel.send(
                "You need to be in the same voice channel with the bot to stop it"
            );
            return;
        }

        player.stop();
        await message.channel.send("Stopped streaming.");
    }
}
