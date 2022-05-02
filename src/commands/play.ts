import { Client, Message } from "discord.js";
import { Command } from ".";
import { musician, queryVideo } from "../music";

export class PlayCommand extends Command {
    constructor() {
        super({
            name: "play",
            description: "Plays a song with the given name.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        // User should be in a voice channel
        if (!msg.member.voice.channel) {
            await msg.channel.send("You need to be in a voice channel!");
            return;
        }

        // User should provide trackname in arguments
        if (args.length === 0) {
            await msg.channel.send("You need to provide a song name!");
            return;
        }

        let jukebox = musician.get(msg.guild.id);
        if (!jukebox) jukebox = musician.create(msg.guild.id);

        // User should be in the same channel with the bot
        if (jukebox.channel && jukebox.channel !== msg.member.voice.channel) {
            await msg.channel.send(
                "Bot is currently playing in another channel!"
            );
            return;
        }

        try {
            const video = await queryVideo(args.join(" "));
            const result = await jukebox.play(msg.member.voice.channel, video);
            if (result === "play") {
                await msg.channel.send(video.toEmbed("Currently playing"));
            } else if (result === "queue") {
                await msg.channel.send(`${video.title} is added to the queue.`);
            }
        } catch (error) {
            await msg.channel.send("An error occured playing a song.");
        }
    }
}
