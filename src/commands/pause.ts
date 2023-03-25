import { Command, CommandContext } from "@commands";
import JukeBox from "@music/jukebox";

export class PauseCommand extends Command {
    constructor() {
        super({
            name: "pause",
            description: "Pauses the current song.",
        });
    }

    async run({ message, guild, member }: CommandContext, args: string[]): Promise<void> {
        if (args.length !== 0) {
            await message.channel.send("Pause command doesn't require arguments!");
        }

        const jukeBox = JukeBox.the();
        const player = jukeBox.getPlayer(guild.id);

        if (!player || !player.isPlaying) {
            await message.channel.send("Bot is not currently playing.");
            return;
        }

        // User should be in the same channel with the bot
        if (player.channelId !== member.voice.channel?.id) {
            await message.channel.send(
                "You should be in the same voice channel with the bot to pause!"
            );
            return;
        }

        player.pause();
        await message.channel.send("Streaming paused.");
    }
}
