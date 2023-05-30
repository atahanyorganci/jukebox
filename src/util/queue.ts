export default class Queue<TItem> {
    private _queue: TItem[] = [];

    get isEmpty(): boolean {
        return this._queue.length === 0;
    }

    get length(): number {
        return this._queue.length;
    }

    enqueue(video: TItem): void {
        this._queue.push(video);
    }

    dequeue(): TItem | null {
        return this._queue.shift() || null;
    }

    remove(idx: number): TItem | null {
        if (idx < 0 || idx >= this._queue.length) {
            return null;
        }
        return this._queue.splice(idx, 1)[0];
    }

    forEach(callback: (item: TItem, idx: number) => void): void {
        this._queue.forEach((item, idx) => {
            callback(item, idx);
        });
    }

    map<TResult>(callback: (item: TItem, idx: number) => TResult): TResult[] {
        return this._queue.map(callback);
    }

    clear(): void {
        this._queue = [];
    }
}
