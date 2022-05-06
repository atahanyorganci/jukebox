import { Command, CommandContext } from "@commands";
import JukeBox from "@music/jukebox";

export class ResumeCommand extends Command {
    constructor() {
        super({
            name: "resume",
            description: "Resumes the current song.",
        });
    }

    async run(
        { message, member, guild }: CommandContext,
        args: string[]
    ): Promise<void> {
        if (args.length !== 0) {
            await message.channel.send(
                "Resume command doesn't require arguments!"
            );
        }
        const player = JukeBox.the().getPlayer(guild.id);

        if (!player) {
            await message.channel.send(
                "Bot is not currently playing in any voice channel!"
            );
            return;
        }

        if (player.isPlaying) {
            await message.channel.send("Bot is already playing!");
            return;
        }

        // User should be in the same channel with the bot
        if (player.channelId !== member.voice.channel?.id) {
            await message.channel.send(
                "You need to be in the same voice channel with the bot to resume!"
            );
            return;
        }

        player.resume();
        await message.channel.send("Streaming resumed.");
    }
}
