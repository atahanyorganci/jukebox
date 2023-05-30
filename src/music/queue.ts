import { Video } from "~/music/index.js";

export default class VideoQueue {
    private _queue: Video[] = [];

    get isEmpty(): boolean {
        return this._queue.length === 0;
    }

    get length(): number {
        return this._queue.length;
    }

    enqueue(video: Video): void {
        this._queue.push(video);
    }

    dequeue(): Video | null {
        return this._queue.shift() || null;
    }

    remove(idx: number): Video | null {
        if (idx < 0 || idx >= this._queue.length) {
            return null;
        }
        return this._queue.splice(idx, 1)[0];
    }

    forEach(callback: (video: Video, idx: number) => void): void {
        this._queue.forEach((video, idx) => {
            callback(video, idx);
        });
    }

    map<T>(callback: (video: Video, idx: number) => T): T[] {
        const result: T[] = [];
        this.forEach((video, idx) => {
            result.push(callback(video, idx));
        });
        return result;
    }

    clear(): void {
        this._queue = [];
    }
}
