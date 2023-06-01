import { AudioResource, createAudioResource } from "@discordjs/voice";
import { EmbedBuilder } from "discord.js";
import ytdl from "ytdl-core";
import { z } from "zod";
import { API_KEY } from "~/config.js";

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

const YouTubeThumbnailSchema = z.object({
    url: z.string(),
    width: z.number(),
    height: z.number(),
});

const VideoSchema = z
    .object({
        id: z.object({
            videoId: z.string(),
        }),
        snippet: z.object({
            title: z.string(),
            description: z.string(),
            thumbnails: z.object({
                default: YouTubeThumbnailSchema,
            }),
            publishedAt: z
                .string()
                .datetime()
                .transform(date => new Date(date)),
            channelTitle: z.string(),
        }),
    })
    .transform(
        ({
            id: { videoId: id },
            snippet: { title, description, thumbnails, publishedAt, channelTitle: channel },
        }) => ({
            id,
            channel,
            title,
            description,
            thumbnail: thumbnails.default.url,
            publishedAt,
        })
    );

const YouTubeSearchListSchema = z.object({
    kind: z.string(),
    etag: z.string(),
    items: z.array(VideoSchema).optional(),
});

const YouTubeVideoListSchema = z.object({
    kind: z.string(),
    etag: z.string(),
    items: z
        .array(
            z
                .object({
                    id: z.string(),
                    snippet: z.object({
                        title: z.string(),
                        description: z.string(),
                        thumbnails: z.object({
                            default: YouTubeThumbnailSchema,
                        }),
                        channelTitle: z.string(),
                        publishedAt: z
                            .string()
                            .datetime()
                            .transform(date => new Date(date)),
                    }),
                })
                .transform(
                    ({
                        id,
                        snippet: { title, description, thumbnails, channelTitle, publishedAt },
                    }) => ({
                        id,
                        title,
                        description,
                        thumbnail: thumbnails.default.url,
                        channel: channelTitle,
                        publishedAt,
                    })
                )
        )
        .optional(),
});

const YouTubePlaylistListSchema = z.object({
    kind: z.string(),
    etag: z.string(),
    items: z
        .array(
            z
                .object({
                    snippet: z.object({
                        title: z.string(),
                        description: z.string(),
                        thumbnails: z.object({
                            default: YouTubeThumbnailSchema,
                        }),
                        channelTitle: z.string(),
                        publishedAt: z
                            .string()
                            .datetime()
                            .transform(date => new Date(date)),
                    }),
                    contentDetails: z.object({
                        videoId: z.string(),
                    }),
                })
                .transform(
                    ({
                        contentDetails: { videoId: id },
                        snippet: { title, description, thumbnails, channelTitle, publishedAt },
                    }) => ({
                        id,
                        title,
                        description,
                        thumbnail: thumbnails.default.url,
                        channel: channelTitle,
                        publishedAt,
                    })
                )
        )
        .optional(),
});

export async function getVideoById(id: string): Promise<Video> {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("id", id);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("maxResults", "1");

    const response = await fetch(url);
    const result = YouTubeVideoListSchema.safeParse(await response.json());
    if (!result.success || !result.data.items || result.data.items.length === 0) {
        throw new NoResultsError();
    }

    const { channel, title, description, thumbnail } = result.data.items[0];
    return new Video(id, title, description, channel, thumbnail);
}

export async function getPlaylistById(playlistId: string): Promise<Video[]> {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("key", API_KEY);

    const response = await fetch(url);
    const result = YouTubePlaylistListSchema.safeParse(await response.json());
    if (!result.success || !result.data.items || result.data.items.length === 0) {
        throw new NoResultsError();
    }

    const playlist = result.data.items.map(({ id, channel, title, description, thumbnail }) => {
        return new Video(id, title, description, channel, thumbnail);
    });
    return playlist;
}

export async function queryVideo(query: string): Promise<Video> {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("q", query);

    const response = await fetch(url);
    const result = YouTubeSearchListSchema.safeParse(await response.json());
    if (!result.success || !result.data.items || result.data.items.length === 0) {
        throw new NoResultsError();
    }

    const { id, channel, title, description, thumbnail } = result.data.items[0];
    return new Video(id, title, description, channel, thumbnail);
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
