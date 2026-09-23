import { Queue } from "bullmq";
import type IORedis from "ioredis";
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
