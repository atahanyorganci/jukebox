import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    DiscordGatewayAdapterCreator,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
} from "@discordjs/voice";
import { Video } from "@music";
import { VoiceChannel } from "discord.js";
import EventEmitter from "events";
import VideoQueue from "@music/queue";
import { unreachable } from "@util";

export enum PlayResult {
    Play,
    Enqueue,
}

export enum PlayerState {
    Init,
    Playing,
    Paused,
    Stopped,
}

export default class Player extends EventEmitter {
    private _state: PlayerState = PlayerState.Init;
    private _player: AudioPlayer | null = null;
    private _queue: VideoQueue = new VideoQueue();

    public get state(): PlayerState {
        return this._state;
    }

    private set state(v: PlayerState) {
        this._state = v;
    }

    get queue(): VideoQueue {
        return this._queue;
    }

    private get player(): AudioPlayer {
        if (!this._player) {
            this._player = createAudioPlayer();
        }
        return this._player;
    }

    private set player(player: null | AudioPlayer) {
        if (this._player) {
            this._player.stop();
        }
        this._player = player;
    }

    constructor(public guildId: string, public channelId: string) {
        super();
        this.player.on(AudioPlayerStatus.Idle, () => this.handlePlayerIdle());
    }

    private handlePlayerIdle(): void {
        const current = this.queue.dequeue();
        if (!current) {
            unreachable("Player idle without any song in queue!");
        }
        if (this.queue.isEmpty) {
            return this.stopPlayer();
        }
        const next = this.queue.current;
        if (!next) unreachable("Queue not empty with no current resource.");
        this.player.play(next);
    }

    private stopPlayer(): void {
        if (this.player.state.status !== AudioPlayerStatus.Idle) {
            this.player.pause(true);
        }
        this.state = PlayerState.Stopped;
        this.player = null;
        this.queue.clear();
        this.emit("stopped");
    }

    public get isPlaying(): boolean {
        return this.state === PlayerState.Playing;
    }

    private getVoiceConnection(channel: VoiceChannel): VoiceConnection {
        if (this.state === PlayerState.Init) {
            return joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild
                    .voiceAdapterCreator as DiscordGatewayAdapterCreator,
            });
        }
        const connection = getVoiceConnection(this.guildId);
        if (!connection) {
            throw new Error("No voice connection found.");
        }
        return connection;
    }

    play(channel: VoiceChannel, video: Video): PlayResult {
        this.queue.enqueue(video);
        if (this.state !== PlayerState.Init) {
            return PlayResult.Enqueue;
        }
        const connection = this.getVoiceConnection(channel);
        connection.subscribe(this.player);

        const audioResource = this.queue.current;
        if (!audioResource) {
            unreachable("No audio resource found after enqueuing.");
        }

        this.player.play(audioResource);
        this.state = PlayerState.Playing;
        return PlayResult.Play;
    }

    nowPlaying(): Video | null {
        const resource = this.queue.current;
        return resource ? resource.metadata : null;
    }

    pause(): void {
        if (!this.isPlaying) {
            return;
        }
        const success = this.player.pause(true);
        if (!success) {
            throw new Error("Unable to pause player.");
        }
        this.state = PlayerState.Paused;
    }

    stop(): void {
        this.stopPlayer();
    }

    setVolume(_volume: number): void {
        throw new Error("Method not implemented.");
    }

    resume(): void {
        if (this.isPlaying) {
            return;
        }
        const success = this.player.unpause();
        if (!success) {
            throw new Error("Unable to resume player.");
        }
        this.state = PlayerState.Playing;
    }

    remove(index: number): Video {
        if (index < 0 || index >= this.queue.length) {
            throw new Error("Index out of range.");
        }
        if (index === 0) {
            return this.skip();
        }
        const removed = this.queue.remove(index);
        if (!removed) {
            unreachable("Removed resource is null.");
        }
        return removed;
    }

    skip(): Video {
        const skipped = this.queue.dequeue();
        if (!skipped) {
            unreachable("Queue empty when trying to skip.");
        }
        if (this.queue.isEmpty) {
            this.stopPlayer();
        } else {
            const current = this.queue.current;
            if (!current) {
                unreachable("Queue not empty with no current resource.");
            }
            this.player.play(current);
        }
        return skipped;
    }
}
