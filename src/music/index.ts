import { AudioResource, createAudioResource } from "@discordjs/voice";
import { EmbedBuilder } from "discord.js";
import { google } from "googleapis";
import ytdl from "ytdl-core";
import { API_KEY } from "~/config.js";

export const YouTube = google.youtube({
    version: "v3",
    auth: API_KEY,
});

interface YouTubeResourceFragment {
    type: "video" | "playlist";
    id: string;
}

export class UnknownDomainError extends Error {
    constructor(domain: string) {
        super(`Unknown domain: ${domain}`);
    }
}

export class InvalidYouTubeUrlError extends Error {
    constructor(url: string) {
        super(`Invalid YouTube URL: ${url}`);
    }
}

export class NoResultsError extends Error {
    constructor() {
        super("No results found!");
    }
}

export async function getVideoById(id: string): Promise<Video> {
    const { data } = await YouTube.videos.list({
        id: [id],
        part: ["snippet"],
    });
    if (!data.items || data.items.length === 0) {
        throw new NoResultsError();
    }
    const { snippet } = data.items[0];
    if (!snippet) {
        throw new NoResultsError();
    }

    const { channelTitle, title, description, thumbnails } = snippet;
    if (!channelTitle || !title || !description || !thumbnails?.default?.url) {
        throw new NoResultsError();
    }
    return new Video(id, title, description, channelTitle, thumbnails.default.url);
}

export async function getPlaylistById(playlistId: string): Promise<Video[]> {
    const { data } = await YouTube.playlistItems.list({
        playlistId,
        part: ["contentDetails", "snippet"],
        maxResults: 25,
    });
    if (!data.items || data.items.length === 0) {
        throw new NoResultsError();
    }
    const videos = data.items.map(item => {
        const { contentDetails, snippet } = item;
        if (!snippet || !contentDetails) {
            throw new NoResultsError();
        }
        const { channelTitle, title, description, thumbnails } = snippet;
        if (
            !contentDetails.videoId ||
            !channelTitle ||
            !title ||
            !description ||
            !thumbnails?.default?.url
        ) {
            throw new NoResultsError();
        }
        return new Video(
            contentDetails.videoId,
            title,
            description,
            channelTitle,
            thumbnails.default.url
        );
    });
    return videos;
}

export async function queryVideo(query: string): Promise<Video> {
    const list = await YouTube.search.list({
        part: ["id", "snippet"],
        maxResults: 1,
        q: query,
    });
    if (!list.data.items || list.data.items.length === 0) {
        throw new NoResultsError();
    }

    const { id, snippet } = list.data.items[0];
    if (!id || !snippet) {
        throw new NoResultsError();
    }

    const { channelTitle, title, description, thumbnails } = snippet;
    if (!id?.videoId || !channelTitle || !title || !description || !thumbnails?.default?.url) {
        throw new NoResultsError();
    }

    return new Video(id.videoId, title, description, channelTitle, thumbnails.default.url);
}

function parseYouTubeUrl(url: string): YouTubeResourceFragment | null {
    try {
        const { hostname, searchParams, pathname } = new URL(url);
        if (
            hostname !== "www.youtube.com" &&
            hostname !== "youtube.com" &&
            hostname !== "youtu.be"
        ) {
            throw new UnknownDomainError(hostname);
        }
        const videoId = searchParams.get("v");
        const playlistId = searchParams.get("list");
        if (pathname === "/watch" && videoId) {
            return {
                type: "video",
                id: videoId,
            };
        } else if (pathname === "/playlist" && playlistId) {
            return {
                type: "playlist",
                id: playlistId,
            };
        }
        throw new InvalidYouTubeUrlError(url);
    } catch (error) {
        return null;
    }
}

async function fetchResourceFromUrl(url: string): Promise<null | Video | Video[]> {
    const resource = parseYouTubeUrl(url);
    if (!resource) return null;
    const { id, type } = resource;
    switch (type) {
        case "video":
            return await getVideoById(id);
        case "playlist":
            return await getPlaylistById(id);
    }
}

export async function fetchYouTubeResource(args: string[]): Promise<null | Video | Video[]> {
    if (args.length === 1) {
        const resource = await fetchResourceFromUrl(args[0]);
        if (resource) return resource;
    }
    return await queryVideo(args.join(" "));
}

export class Video {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly description: string,
        public readonly channel: string,
        public readonly thumbnail: string
    ) {}

    get url(): string {
        return `https://www.youtube.com/watch?v=${this.id}`;
    }

    toEmbed(): EmbedBuilder {
        const { title, channel, thumbnail } = { ...this };
        const description =
            this.description.length > 280
                ? `${this.description.slice(0, 280)}...`
                : this.description;

        return new EmbedBuilder({
            title,
            description,
            thumbnail: {
                url: thumbnail,
            },
            url: this.url,
            fields: [
                {
                    name: "Channel",
                    value: channel,
                    inline: true,
                },
            ],
        });
    }
}

/**
 * Convert YouTube video to `AudioResource<Video>` that is playable in Discord with
 * YouTube video's metadata.
 * @param video YouTube video
 * @param volume default volume of the resource
 * @returns AudioResource
 */
export function videoToAudioResource(video: Video, volume?: number): AudioResource<Video> {
    if (volume && (volume < 0 || volume > 1)) {
        throw new Error("Volume must be greater than 0.");
    }
    volume = volume || 0.25;

    const stream = ytdl(video.url, {
        filter: "audioonly",
    });
    const resource = createAudioResource(stream, {
        inlineVolume: true,
        metadata: video,
    });
    resource.volume?.setVolume(volume);
    return resource;
}
