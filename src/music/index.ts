import { MessageEmbed } from "discord.js";
import { google } from "googleapis";
import { API_KEY } from "..";
import { Musican } from "./musician";

export { JukeBox } from "./jukebox";
export { Musican } from "./musician";

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

export const musician = new Musican();
