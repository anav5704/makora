import { createConnection } from "@makora/queue";
import { type Job, Worker } from "bullmq";

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
