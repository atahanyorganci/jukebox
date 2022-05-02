import { Video } from "@music";

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
    channelId: string;
    queue: Video[];
    volume: number;
    state: PlayerState;

    constructor(channelId: string) {
        this.channelId = channelId;
        this.queue = [];
        this.volume = 1.0;
        this.state = PlayerState.Init;
    }

    public get isPlaying(): boolean {
        return false;
    }

    play(video: Video): PlayResult {
        throw new Error("Method not implemented.");
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
