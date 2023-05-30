import { Command, CommandContext } from "~/commands/index.js";
import JukeBox from "~/music/jukebox.js";

export class VolumeCommand extends Command {
    constructor() {
        super({
            name: "volume",
            description: "Sets volume of audio.",
            aliases: ["vol"],
        });
    }

    async run({ message, guild, member }: CommandContext, args: string[]): Promise<void> {
        if (args.length !== 1) {
            await message.channel.send("You need to provide volume level 0-100.");
            return;
        }

        const volume = Number.parseInt(args[0]);
        if (Number.isNaN(volume) || `${volume}` !== args[0]) {
            await message.channel.send("Volume should be a number.");
            return;
        }

        if (volume < 0 || volume > 100) {
            await message.channel.send("Volume should be between 0-100.");
            return;
        }

        const player = JukeBox.the().getPlayer(guild.id);
        if (!player) {
            await message.channel.send("Bot is not currently playing!");
            return;
        }

        // User should be in the same channel with the bot
        const channelId = member.voice.channel?.id;
        if (player.channelId !== channelId) {
            await message.channel.send(
                "You need to be in the same voice channel with the bot to change volume!"
            );
            return;
        }

        player.setVolume(volume / 100);
        await message.channel.send(`Volume set to ${volume}%.`);
    }
}
