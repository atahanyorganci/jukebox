import { Client, Message, MessageEmbed } from "discord.js";
import { Command } from ".";
import { musician } from "../music";

export class QueueCommand extends Command {
    constructor() {
        super({
            name: "queue",
            description: "Displays song queue.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (args.length !== 0) {
            await msg.channel.send(
                "Now playing command doesn't require arguments!"
            );
        }
        const jukebox = musician.get(msg.guild.id);
        if (!jukebox || !jukebox.streaming) {
            await msg.channel.send("Bot is not currently playing.");
            return;
        }

        let description = "";
        for (let i = 0; i < jukebox.queue.length; i++) {
            const track = jukebox.queue[i];
            description = `${description}\n${i + 1}) ${track.title} by ${
                track.channel
            }`;
        }
        const embed = new MessageEmbed()
            .setTitle("Music Queue")
            .setDescription(description)
            .setColor("#123123");

        await msg.channel.send(embed);
    }
}
