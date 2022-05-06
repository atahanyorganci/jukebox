import VideoQueue from "@music/queue";

const VIDEOS = [
    {
        id: "1",
        title: "Video 1",
        description: "Description 1",
        thumbnail: "thumbnail.jpg",
        channel: "Channel 1",
    },
    {
        id: "2",
        title: "Video 2",
        description: "Description 2",
        thumbnail: "thumbnail.jpg",
        channel: "Channel 2",
    },
    {
        id: "3",
        title: "Video 3",
        description: "Description 3",
        thumbnail: "thumbnail.jpg",
        channel: "Channel 3",
    },
    {
        id: "4",
        title: "Video 4",
        description: "Description 4",
        thumbnail: "thumbnail.jpg",
        channel: "Channel 4",
    },
];

test("Default queue should be empty", () => {
    const queue = new VideoQueue();
    expect(queue.isEmpty).toBeTruthy();
});

test("Queue length should 1 after adding a single video", () => {
    const queue = new VideoQueue();
    queue.enqueue(VIDEOS[0]);

    expect(queue.isEmpty).toBeFalsy();
    expect(queue.length).toBe(1);
});

test("Queue length should 2 after adding two videos", () => {
    const queue = new VideoQueue();
    queue.enqueue(VIDEOS[0]);
    queue.enqueue(VIDEOS[1]);

    expect(queue.isEmpty).toBeFalsy();
    expect(queue.length).toBe(2);
});

test("Queue length should decrease after removing a video", () => {
    const queue = new VideoQueue();
    for (let i = 0; i < VIDEOS.length; i++) {
        queue.enqueue(VIDEOS[i]);
    }

    expect(queue.isEmpty).toBeFalsy();
    expect(queue.length).toBe(VIDEOS.length);

    for (let i = 0; i < VIDEOS.length; i++) {
        queue.dequeue();
        expect(queue.length).toBe(VIDEOS.length - i - 1);
    }

    expect(queue.isEmpty).toBeTruthy();
    expect(queue.length).toBe(0);
});

test("Queue should be empty after clearing", () => {
    const queue = new VideoQueue();
    for (let i = 0; i < VIDEOS.length; i++) {
        queue.enqueue(VIDEOS[i]);
    }

    expect(queue.isEmpty).toBeFalsy();
    expect(queue.length).toBe(VIDEOS.length);

    queue.clear();

    expect(queue.isEmpty).toBeTruthy();
    expect(queue.length).toBe(0);
});
