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

export default class Player {
    private _state: PlayerState = PlayerState.Init;
    private _player: AudioPlayer;

    queue: Video[] = [];
    volume: number = 1.0;

    public get state(): PlayerState {
        return this._state;
    }

    public set state(v: PlayerState) {
        this._state = v;
    }

    constructor(public guildId: string, public channelId: string) {
        this._player = createAudioPlayer();
        this._player.on(AudioPlayerStatus.Idle, () => this.handlePlayerIdle());
    }

    private handlePlayerIdle(): void {
        console.log("Player idle");
    }

    public get isPlaying(): boolean {
        return this.state === PlayerState.Playing;
    }

    private getVoiceConnection(channel: VoiceChannel): VoiceConnection {
        if (this.state === PlayerState.Init) {
            return joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
        }
        const connection = getVoiceConnection(this.guildId);
        if (!connection) {
            throw new Error("No voice connection found.");
        }
        return connection;
    }

    private enqueue(video: Video): void {
        this.queue.push(video);
    }

    play(channel: VoiceChannel, video: Video): PlayResult {
        this.enqueue(video);
        if (this.state !== PlayerState.Init) {
            return PlayResult.Enqueue;
        }
        const connection = this.getVoiceConnection(channel);
        connection.subscribe(this._player);

        this._player.play(videoToAudioResource(video));
        this.state = PlayerState.Playing;
        return PlayResult.Play;
    }

    nowPlaying(): Video {
        throw new Error("Method not implemented.");
    }

    pause(): void {
        throw new Error("Method not implemented.");
    }

    stop(): void {
        throw new Error("Method not implemented.");
    }

    setVolume(volume: number): void {
        throw new Error("Method not implemented.");
    }

    resume(): void {
        throw new Error("Method not implemented.");
    }

    remove(index: number): Video {
        throw new Error("Method not implemented.");
    }

    skip(): Video {
        throw new Error("Method not implemented.");
    }
}
