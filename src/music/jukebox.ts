import { StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js";
import ytdl from "ytdl-core";
import { Video, musician } from ".";
import { logger } from "..";

export class JukeBox {
    private _guildId: string;
    private _queue: Video[] = [];
    private _dispatcher: StreamDispatcher | null = null;
    private _channel: VoiceChannel | null = null;
    private _connection: VoiceConnection | null = null;
    private _volume = 1;

    constructor(guildId: string) {
        this._guildId = guildId;
    }

    public get streaming(): boolean {
        return this._dispatcher !== null && !this._dispatcher.paused;
    }

    public get channel() {
        return this._channel;
    }

    public get queue() {
        return this._queue;
    }

    public get connection() {
        return this._connection;
    }

    public get dispatcher() {
        return this._dispatcher;
    }

    public get volume() {
        return this._volume;
    }

    public set volume(volume: number) {
        if (volume < 0 || volume > 100) return;
        this._volume = volume / 100;
        if (this.dispatcher) this.dispatcher.setVolume(this._volume);
    }

    get nowPlaying() {
        return this._queue[0];
    }

    private async joinChannel(channel: VoiceChannel): Promise<void> {
        if (this._channel) this._channel.leave();
        this._channel = channel;
        logger.info(`Connected to channel "${channel.name}"`);
    }

    private async leaveChannel(): Promise<void> {
        if (!this._channel) return;

        this._channel.leave();
        this._channel = null;
    }

    private enqueue(video: Video): void {
        this._queue.push(video);
    }

    async play(
        channel: VoiceChannel,
        video: Video
    ): Promise<"play" | "queue" | "error"> {
        this.enqueue(video);
        if (this.streaming) {
            logger.info(`${video.title} is added to the queue.`);
            return "queue";
        }

        try {
            this.joinChannel(channel);
            await this.playFromQueue();
            logger.info(`Streaming ${video.title}.`);
        } catch (error) {
            logger.error(`${error} occured when playing song.`);
            return "error";
        }
        return "play";
    }

    pause(): void {
        if (this.dispatcher) this.dispatcher.pause();
    }

    resume(): void {
        if (this.dispatcher) this.dispatcher.resume();
    }

    setVolume(volume: number): void {
        this.volume = volume;
    }

    async skip(): Promise<"next" | "end" | "error"> {
        this.queue.splice(0, 1);
        try {
            return this.onSongFinish();
        } catch (error) {
            logger.error(`${error} occured when playing song.`);
            return "error";
        }
    }

    async clear(): Promise<"success" | "error"> {
        this._queue = [];
        try {
            await this.onSongFinish();
            return "success";
        } catch (error) {
            logger.error(`${error} occured when playing song.`);
            return "error";
        }
    }

    async remove(index: number): Promise<Video | null> {
        try {
            const video = this.queue.splice(index, 1);
            if (index === 0) await this.onSongFinish();
            return video[0];
        } catch (error) {
            logger.error(`${error} occured when playing song.`);
            return null;
        }
    }

    private async playFromQueue() {
        if (!this.channel) return;
        const stream = ytdl(this.queue[0].url, {
            filter: "audioonly",
        });
        const connection = await this.channel.join();
        const dispatcher = connection.play(stream);
        dispatcher.setVolume(this.volume);

        dispatcher.on("finish", async () => {
            this.queue.splice(0, 1);
            await this.onSongFinish();
        });

        this._connection = connection;
        this._dispatcher = dispatcher;
    }

    private async onSongFinish(): Promise<"next" | "end"> {
        if (this.queue.length === 0) {
            try {
                await this.leaveChannel();
            } catch (error) {
                logger.error(
                    `"${error}" occured while leaving the voice channel.`
                );
            }
            musician.delete(this._guildId);
            return "end";
        } else {
            await this.playFromQueue();
            return "next";
        }
    }
}
