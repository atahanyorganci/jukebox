import { Command, CommandContext } from "@commands";
import { queryVideo, videoToEmbed } from "@music";
import JukeBox from "@music/jukebox";
import { PlayResult } from "@music/player";
import { VoiceChannel } from "discord.js";

export class PlayCommand extends Command {
    constructor() {
        super({
            name: "play",
            description: "Plays a song with the given name.",
        });
    }

    async run(
        { message, guild, member }: CommandContext,
        args: string[]
    ): Promise<void> {
        if (!message.member || !message.guild) {
            return;
        }

        // User should be in a voice channel
        if (!member.voice.channel) {
            await message.channel.send("You need to be in a voice channel!");
            return;
        }
        const channelId = member.voice.channel.id;

        // User should provide track name in arguments
        if (args.length === 0) {
            await message.channel.send("You need to provide a song name!");
            return;
        }

        const jukeBox = JukeBox.the();
        let player = jukeBox.getPlayer(guild.id);

        // If a song is currently playing the user should be in same channel with the bot
        if (player && player.channelId !== channelId) {
            await message.channel.send(
                "Bot is currently playing in another channel!"
            );
            return;
        }

        if (!player) {
            player = jukeBox.createPlayer(guild.id, channelId);
        }

        try {
            const video = await queryVideo(args.join(" "));
            const voiceChannel = await member.voice.channel.fetch();
            const result = player.play(voiceChannel as VoiceChannel, video);

            if (result === PlayResult.Play) {
                const embed = videoToEmbed(video, {
                    title: `Currently playing: ${video.title}`,
                });
                await message.channel.send({ embeds: [embed] });
            } else if (result === PlayResult.Enqueue) {
                await message.channel.send(
                    `${video.title} is added to the queue.`
                );
            }
        } catch (error) {
            await message.channel.send("An error occurred playing a song.");
        }
    }
}
