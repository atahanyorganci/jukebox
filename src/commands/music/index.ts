import { MessageEmbed } from "discord.js";
import { google } from "googleapis";
import { API_KEY } from "../../bot";

export { SearchVideoCommand } from "./search";

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
        id.channelId,
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

    toEmbed() {
        return new MessageEmbed()
            .setTitle(this.title)
            .setDescription(this.description)
            .addField("Channel", this.channel)
            .setImage(this.thumbnail);
    }
}

export class MusicQueue {
    queue: Video[];
}
