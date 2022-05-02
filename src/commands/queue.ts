import { Client, Message, MessageEmbed } from "discord.js";
import { Command } from "@commands";
import JukeBox from "@music/jukebox";

export class QueueCommand extends Command {
    constructor() {
        super({
            name: "queue",
            description: "Displays song queue.",
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
        const player = JukeBox.the().getPlayer(msg.guild.id);
        if (!player) {
            await msg.channel.send("Bot is not currently playing.");
            return;
        }

        let description = "";
        for (let i = 0; i < player.queue.length; i++) {
            const track = player.queue[i];
            description = `${description}\n${i + 1}) ${track.title} by ${
                track.channel
            }`;
        }
        const embed = new MessageEmbed()
            .setTitle("Music Queue")
            .setDescription(description)
            .setColor("#123123");

        await msg.channel.send({ embeds: [embed] });
    }
}
