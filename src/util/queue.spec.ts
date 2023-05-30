import { beforeEach, expect, it } from "vitest";
import Queue from "./queue.js";

declare module "vitest" {
    export interface TestContext {
        numbers: number[];
    }
}

const NUMBER_COUNT = 100;

beforeEach(ctx => {
    const numbers = [];
    for (let i = 0; i < NUMBER_COUNT; i++) {
        const number = Math.floor(Math.random() * 1000);
        numbers.push(number);
    }
    ctx.numbers = numbers;
});

it("Default queue should be empty", () => {
    const queue = new Queue<number>();
    expect(queue.isEmpty).toBeTruthy();
});

it("Queue length should be equal to number of items added", ctx => {
    const queue = new Queue<number>();
    for (let i = 0; i < ctx.numbers.length; i++) {
        queue.enqueue(ctx.numbers[i]);
        expect(queue.length).toBe(i + 1);
    }
});

it("Queue should be a FIFO", ctx => {
    const queue = new Queue<number>();
    for (let i = 0; i < ctx.numbers.length; i++) {
        queue.enqueue(ctx.numbers[i]);
    }
    for (let i = 0; i < ctx.numbers.length; i++) {
        expect(queue.dequeue()).toBe(ctx.numbers[i]);
    }
    expect(queue.isEmpty).toBeTruthy();
});
