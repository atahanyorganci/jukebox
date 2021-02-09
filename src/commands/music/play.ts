import { Client, Message } from "discord.js";
import { musician, query_video } from ".";
import { Command } from "..";
import { logger } from "../../bot";

export class PlayCommand extends Command {
    constructor() {
        super({
            name: "play",
            description: "Plays a song with the given name.",
        });
    }

    async run(bot: Client, message: Message, args: string[]): Promise<void> {
        // User should be in a voice channel
        if (!message.member.voice.channel) {
            await message.channel.send("You need to be in a voice channel!");
            return;
        }

        // User should provide trackname in arguments
        if (args.length === 0) {
            await message.channel.send("You need to provide a song name!");
            return;
        }

        // User should be in the same channel with the bot
        if (
            musician.channel !== message.member.voice.channel &&
            musician.channel
        ) {
            await message.channel.send(
                "Bot is currently playing in another channel!"
            );
            return;
        }

        try {
            const video = await query_video(args.join(" "));
            musician.enqueue(video);

            if (musician.streaming) {
                logger.info(`${video.title} is added to the queue.`);
                await message.channel.send(
                    `${video.title} is added to the queue.`
                );
            } else {
                musician.joinChannel(message.member.voice.channel);
                musician.playFromQueue();

                logger.info(`Streaming ${video.title}.`);
                await message.channel.send(video.toEmbed("Currently playing"));
            }
        } catch (error) {
            logger.error("Error occured when joining channel.");
            logger.error(error);
            await message.channel.send(
                "An error occured while joining your channel."
            );
            return;
        }
    }
}
