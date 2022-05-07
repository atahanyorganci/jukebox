import { MessageEmbed } from "discord.js";
import { google } from "googleapis";
import { API_KEY } from "@config";
import { AudioResource, createAudioResource } from "@discordjs/voice";
import ytdl from "ytdl-core";

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

export async function getVideoById(id: string): Promise<Video> {
    const { data } = await YouTube.videos.list({
        id: [id],
        part: ["snippet"],
    });
    if (!data.items || data.items.length === 0) {
        throw new Error("No results found.");
    }
    const { snippet } = data.items[0];
    if (!id || !snippet) {
        throw new Error("No results found.");
    }

    const { channelTitle, title, description, thumbnails } = snippet;
    if (!channelTitle || !title || !description || !thumbnails?.default?.url) {
        throw new Error("No results found.");
    }
    return {
        id,
        channel: channelTitle,
        title,
        description,
        thumbnail: thumbnails.default.url,
    };
}

export async function queryVideo(query: string): Promise<Video> {
    const list = await YouTube.search.list({
        part: ["id", "snippet"],
        maxResults: 1,
        q: query,
    });
    if (!list.data.items || list.data.items.length === 0) {
        throw new Error("No results found.");
    }

    const { id, snippet } = list.data.items[0];
    if (!id || !snippet) {
        throw new Error("No results found.");
    }

    const { channelTitle, title, description, thumbnails } = snippet;
    if (
        !id?.videoId ||
        !channelTitle ||
        !title ||
        !description ||
        !thumbnails?.default?.url
    ) {
        throw new Error("No results found.");
    }

    return {
        id: id.videoId,
        title,
        description,
        channel: channelTitle,
        thumbnail: thumbnails.default.url,
    };
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

async function fetchResourceFromUrl(url: string): Promise<null | Video> {
    const resource = parseYouTubeUrl(url);
    if (!resource) return null;
    const { id, type } = resource;
    switch (type) {
        case "video":
            return await getVideoById(id);
        case "playlist":
            throw new Error("Playlist feature isn't implemented");
    }
}

export async function fetchYouTubeResource(
    args: string[]
): Promise<null | Video> {
    if (args.length === 1) {
        const resource = await fetchResourceFromUrl(args[0]);
        if (resource) return resource;
    }
    return await queryVideo(args.join(" "));
}

export interface Video {
    id: string;
    title: string;
    description: string;
    channel: string;
    thumbnail: string;
}

export function videoToEmbed(video: Video, opt?: Partial<Video>): MessageEmbed {
    opt = opt || {};
    const { title, description, channel, thumbnail } = { ...video, ...opt };
    return new MessageEmbed()
        .setTitle(title)
        .setDescription(description)
        .addField("Channel", channel)
        .setImage(thumbnail);
}

export function videoUrl({ id }: Video): string {
    return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * Convert YouTube video to `AudioResource<Video>` that is playable in Discord with
 * YouTube video's metadata.
 * @param video YouTube video
 * @param volume default volume of the resource
 * @returns AudioResource
 */
export function videoToAudioResource(
    video: Video,
    volume?: number
): AudioResource<Video> {
    if (volume && (volume < 0 || volume > 1)) {
        throw new Error("Volume must be greater than 0.");
    }
    volume = volume || 0.25;

    const url = videoUrl(video);
    const stream = ytdl(url, {
        filter: "audioonly",
    });
    const resource = createAudioResource(stream, {
        inlineVolume: true,
        metadata: video,
    });
    resource.volume?.setVolume(volume);
    return resource;
}
