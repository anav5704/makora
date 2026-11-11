import { db, JobStatus } from "@makora/db";
import { createConnection } from "@makora/queue";
import { type Job, UnrecoverableError, Worker } from "bullmq";

interface StartWorkerOptions<T> {
    name: string;
    concurrency: number;
    processor: (job: Job<T>) => Promise<void>;
}

export async function startWorker<T>({ name, concurrency, processor }: StartWorkerOptions<T>): Promise<void> {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        throw new Error("REDIS_URL environment variable is not set");
    }

    const worker = new Worker<T>(name, processor, {
        connection: createConnection(redisUrl),
        concurrency,
    });

    worker.on("failed", (job, error) => {
        console.error(`[${name}] job ${job?.id} failed: ${error.message}`);
        if (!job?.id || !isTerminalFailure(job, error)) return;

        void db.main.job
            .update({
                where: { id: job.id },
                data: {
                    status: JobStatus.FAILED,
                    error: error.message || "Unknown error",
                },
            })
            .catch((updateError: unknown) => {
                const message = updateError instanceof Error ? updateError.message : "Unknown error";
                console.error(`[${name}] could not mark job ${job.id} failed: ${message}`);
            });
    });

    const shutdown = async (): Promise<void> => {
        await worker.close();
        process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    await worker.waitUntilReady();
    console.log(`[${name}] worker started (concurrency: ${concurrency})`);
}

// moveToFailed increments attemptsMade before this event runs.
function isTerminalFailure(job: Job, error: Error): boolean {
    const maxAttempts = job.opts.attempts ?? 1;
    const unrecoverable = error instanceof UnrecoverableError || error.name === "UnrecoverableError";
    return unrecoverable || job.attemptsMade >= maxAttempts;
}
