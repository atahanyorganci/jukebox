import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
} from "@discordjs/voice";
import { Video, videoToAudioResource } from "@music";
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

    queue: VideoQueue = new VideoQueue();
    volume: number = 1.0;

    public get state(): PlayerState {
        return this._state;
    }

    private set state(v: PlayerState) {
        this._state = v;
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
        const prev = this.queue.dequeue();
        if (!prev) {
            unreachable("Player idle without any song in queue!");
        }
        if (this.queue.isEmpty) {
            return this.stopPlayer();
        }
    }

    private stopPlayer() {
        this.state = PlayerState.Stopped;
        this.player = null;
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
                adapterCreator: channel.guild.voiceAdapterCreator as any,
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

        this.player.play(videoToAudioResource(video));
        this.state = PlayerState.Playing;
        return PlayResult.Play;
    }

    nowPlaying(): Video | null {
        return this.queue.current;
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
        throw new Error("Method not implemented.");
    }

    setVolume(volume: number): void {
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
        throw new Error("Method not implemented.");
    }

    skip(): Video {
        throw new Error("Method not implemented.");
    }
}
