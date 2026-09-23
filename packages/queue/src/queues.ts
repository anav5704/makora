import { Queue } from "bullmq";
import type IORedis from "ioredis";
import { createConnection } from "./connection";
import type { AnalyzeGameJob, SyncAccountJob } from "./jobs";

export const SYNC_QUEUE_NAME = "game-sync" as const;
export const ANALYSIS_QUEUE_NAME = "game-analysis" as const;

export function createSyncQueue(connection: IORedis): Queue<SyncAccountJob> {
    return new Queue<SyncAccountJob>(SYNC_QUEUE_NAME, {
        connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: 100,
            removeOnFail: 500,
        },
    });
}

export function createAnalysisQueue(connection: IORedis): Queue<AnalyzeGameJob> {
    return new Queue<AnalyzeGameJob>(ANALYSIS_QUEUE_NAME, {
        connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: 100,
            removeOnFail: 500,
        },
    });
}

function redisUrl(): string {
    const url = process.env.REDIS_URL;

    if (!url) {
        throw new Error("REDIS_URL environment variable is not set");
    }

    return url;
}

let syncQueue: Queue<SyncAccountJob> | null = null;
let analysisQueue: Queue<AnalyzeGameJob> | null = null;

export function getSyncQueue(): Queue<SyncAccountJob> {
    syncQueue ??= createSyncQueue(createConnection(redisUrl()));
    return syncQueue;
}

export function getAnalysisQueue(): Queue<AnalyzeGameJob> {
    analysisQueue ??= createAnalysisQueue(createConnection(redisUrl()));
    return analysisQueue;
}
