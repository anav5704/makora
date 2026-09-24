import IORedis from "ioredis";

export function createConnection(url: string): IORedis {
    return new IORedis(url, {
        maxRetriesPerRequest: null,
    });
}
