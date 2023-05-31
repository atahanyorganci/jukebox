import {
    AudioPlayer,
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    DiscordGatewayAdapterCreator,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
} from "@discordjs/voice";
import { VoiceChannel } from "discord.js";
import EventEmitter from "events";
import { Video, videoToAudioResource } from "~/music/index.js";
import { unreachable } from "~/util/index.js";
import Queue from "~/util/queue.js";

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

export class InvalidStateError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidStateError";
    }
}

export class PlayerInitError extends InvalidStateError {
    constructor() {
        super("Player state isn't init and current audio resource is null");
        this.name = "FailedToInitializeError";
    }
}

export default class Player extends EventEmitter {
    private _state: PlayerState = PlayerState.Init;
    private _player: AudioPlayer | null = null;
    private _queue = new Queue<Video>();
    private _nowPlaying: AudioResource<Video> | null = null;
    private _volume = 0.25;

    constructor(public guildId: string, public channelId: string) {
        super();
        this.player.on(AudioPlayerStatus.Idle, () => this.handlePlayerIdle());
    }

    get volume(): number {
        return this._volume;
    }

    private set volume(volume: number) {
        this._volume = volume;
    }

    get state(): PlayerState {
        return this._state;
    }

    private set state(v: PlayerState) {
        this._state = v;
    }

    get queue(): Queue<Video> {
        return this._queue;
    }

    get isPlaying(): boolean {
        return this.state === PlayerState.Playing;
    }

    get nowPlaying(): Video {
        if (!this._nowPlaying) {
            throw new PlayerInitError();
        }
        return this._nowPlaying.metadata;
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

    private handlePlayerIdle(): void {
        if (this.queue.isEmpty) {
            return this.stopPlayer();
        }
        const next = this.queue.dequeue();
        if (!next) unreachable("Queue not empty with no current resource.");
        this.playVideo(next);
    }

    private playVideo(video: Video): void {
        const audioResource = videoToAudioResource(video, this._volume);
        this._nowPlaying = audioResource;
        this.player.play(audioResource);
        this.state = PlayerState.Playing;
    }

    private stopPlayer(): void {
        if (this.player.state.status !== AudioPlayerStatus.Idle) {
            this.player.pause(true);
        }
        this._nowPlaying = null;
        this.state = PlayerState.Stopped;
        this.player = null;
        this.queue.clear();
        this.emit("stopped");
    }

    private getVoiceConnection(channel: VoiceChannel): VoiceConnection {
        if (this.state === PlayerState.Init) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
            });
            connection.on("stateChange", (oldState, newState) => {
                if (
                    oldState.status === VoiceConnectionStatus.Ready &&
                    newState.status === VoiceConnectionStatus.Connecting
                ) {
                    connection.configureNetworking();
                }
            });
            return connection;
        }
        const connection = getVoiceConnection(this.guildId);
        if (!connection) {
            throw new Error("No voice connection found.");
        }
        return connection;
    }

    play(channel: VoiceChannel, video: Video): PlayResult {
        if (this.state !== PlayerState.Init) {
            this.queue.enqueue(video);
            return PlayResult.Enqueue;
        }
        const connection = this.getVoiceConnection(channel);
        connection.subscribe(this.player);
        this.playVideo(video);
        return PlayResult.Play;
    }

    playPlaylist(channel: VoiceChannel, playlist: Video[]): PlayResult {
        const [first, ...rest] = playlist;
        const result = this.play(channel, first);
        rest.forEach(video => this.queue.enqueue(video));
        return result;
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

    setVolume(volume: number): void {
        if (volume < 0 || volume > 1) {
            throw new Error("Volume must be between 0 and 1.");
        }
        if (!this._nowPlaying) {
            throw new PlayerInitError();
        }
        this._volume = volume;
        this._nowPlaying.volume?.setVolume(volume);
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
        if (!this._nowPlaying) {
            throw new PlayerInitError();
        }
        const skipped = this._nowPlaying.metadata;
        if (this.queue.isEmpty) {
            this.stopPlayer();
            return skipped;
        }
        const current = this.queue.dequeue();
        if (!current) unreachable("Queue not empty with no current resource.");
        this.playVideo(current);
        return skipped;
    }
}
