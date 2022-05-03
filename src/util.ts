export function unreachable(message?: string): never {
    if (message) {
        throw new Error(message);
    }
    throw new Error("Unreachable");
}
