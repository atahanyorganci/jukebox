import { Client, Message, VoiceChannel } from "discord.js";
import { Command } from "@commands";
import { queryVideo, videoToEmbed } from "@music";
import JukeBox from "@music/jukebox";
import { PlayResult } from "@music/player";

export class PlayCommand extends Command {
    constructor() {
        super({
            name: "play",
            description: "Plays a song with the given name.",
        });
    }

    async run(bot: Client, msg: Message, args: string[]): Promise<void> {
        if (!msg.member || !msg.guild) {
            return;
        }

        // User should be in a voice channel
        if (!msg.member.voice.channel) {
            await msg.channel.send("You need to be in a voice channel!");
            return;
        }

        // User should provide track name in arguments
        if (args.length === 0) {
            await msg.channel.send("You need to provide a song name!");
            return;
        }

        const jukeBox = JukeBox.the();
        let player = jukeBox.getPlayer(msg.guild.id);

        // If a song is currently playing the user should be in same channel with the bot
        if (player && player.channelId !== msg.member.voice.channel.id) {
            await msg.channel.send(
                "Bot is currently playing in another channel!"
            );
            return;
        }

        if (!player) {
            const channelId = msg.member.voice.channel.id;
            const guildId = msg.guild.id;
            player = jukeBox.createPlayer(guildId, channelId);
        }

        try {
            const video = await queryVideo(args.join(" "));
            const voiceChannel =
                (await msg.member.voice.channel.fetch()) as VoiceChannel;
            const result = player.play(voiceChannel, video);

            if (result === PlayResult.Play) {
                const embed = videoToEmbed(video, {
                    title: `Currently playing: ${video.title}`,
                });
                await msg.channel.send({ embeds: [embed] });
            } else if (result === PlayResult.Enqueue) {
                await msg.channel.send(`${video.title} is added to the queue.`);
            }
        } catch (error) {
            await msg.channel.send("An error occurred playing a song.");
        }
    }
}
