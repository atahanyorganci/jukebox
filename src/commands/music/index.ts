import {
    MessageEmbed,
    StreamDispatcher,
    VoiceChannel,
    VoiceConnection,
} from "discord.js";
import { google } from "googleapis";
import ytdl from "ytdl-core";
import { API_KEY, logger } from "../../bot";

export { SearchVideoCommand } from "./search";
export { PlayCommand } from "./play";

export const youtube = google.youtube("v3");

export async function query_video(query: string): Promise<Video> {
    const list = await youtube.search.list({
        auth: API_KEY,
        part: ["id", "snippet"],
        maxResults: 1,
        q: query,
    });
    const { id, snippet } = list.data.items[0];
    const { channelTitle, title, description, thumbnails } = snippet;

    return new Video(
        id.videoId,
        title,
        description,
        channelTitle,
        thumbnails.default.url
    );
}
export class Video {
    id: string;
    title: string;
    description: string;
    channel: string;
    thumbnail: string;

    constructor(
        id: string,
        title: string,
        description: string,
        channel: string,
        thumbnail: string
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.channel = channel;
        this.thumbnail = thumbnail;
    }

    get url(): string {
        return `https://www.youtube.com/watch?v=${this.id}`;
    }

    toEmbed(prefix?: string) {
        const title = prefix ? `${prefix} - ${this.title}` : this.title;
        return new MessageEmbed()
            .setTitle(title)
            .setDescription(this.description)
            .addField("Channel", this.channel)
            .setImage(this.thumbnail);
    }
}

export class MusicQueue {
    private queue: Video[] = [];
    dispatcher: StreamDispatcher | null = null;
    channel: VoiceChannel | null = null;
    connection: VoiceConnection | null = null;

    public get streaming(): boolean {
        return this.dispatcher !== null && !this.dispatcher.paused;
    }

    enqueue(video: Video): void {
        this.queue.push(video);
    }

    async joinChannel(channel: VoiceChannel): Promise<void> {
        if (this.channel) this.channel.leave();
        this.channel = channel;
        logger.info(`Connected to channel "${this.connection.channel.name}"`);
    }

    async leaveChannel(): Promise<void> {
        if (!this.channel) return;

        this.channel.leave();
        this.channel = null;
    }

    async playFromQueue() {
        if (this.queue.length === 0 || this.channel === null) return;

        const stream = ytdl(this.queue[0].url, {
            filter: "audioonly",
        });
        this.connection = await this.channel.join();
        this.dispatcher = this.connection.play(stream);
        this.dispatcher.on("finish", () => {
            this.queue.splice(0, 1);
            if (this.queue.length !== 0) {
                this.playFromQueue();
            } else {
                this.leaveChannel();
            }
        });
    }
}

export const musician = new MusicQueue();
