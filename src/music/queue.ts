import { Video } from "@music";

export default class VideoQueue {
    private _current: Video | null = null;
    private _queue: Video[] = [];

    get isEmpty(): boolean {
        return this._current === null && this._queue.length === 0;
    }

    get current(): Video | null {
        return this._current;
    }

    get length(): number {
        if (this._current === null) {
            return 0;
        }
        return this._queue.length + 1;
    }

    enqueue(video: Video): void {
        if (this._current) {
            this._queue.push(video);
        } else {
            this._current = video;
        }
    }

    dequeue(): Video | null {
        if (this.isEmpty) {
            return null;
        }
        const video = this._queue.shift() || null;
        const current = this._current;
        this._current = video;
        return current;
    }

    remove(idx: number): Video | null {
        if (this.isEmpty || idx < 0 || idx >= this._queue.length) {
            return null;
        }
        const video = this._queue.splice(idx, 1)[0] || null;
        const current = this._current;
        this._current = video;
        return current;
    }

    forEach(callback: (video: Video, idx: number) => void): void {
        if (this._current === null) {
            return;
        }
        callback(this._current, 0);
        this._queue.forEach((video, idx) => callback(video, idx + 1));
    }

    map<T>(callback: (video: Video, idx: number) => T): T[] {
        const result: T[] = [];
        this.forEach((video, idx) => {
            result.push(callback(video, idx));
        });
        return result;
    }
}
