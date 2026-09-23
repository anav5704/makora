import { db } from "@makora/db";

export type ProgressCallback = (percentage: number) => void | Promise<void>;

const DB_WRITE_STEP = 5;

export function createProgressReporter(jobId: string, onProgress?: ProgressCallback) {
    let lastWritten = 0;

    return async (percentage: number): Promise<void> => {
        await onProgress?.(percentage);

        if (percentage >= 100 || percentage - lastWritten >= DB_WRITE_STEP) {
            lastWritten = percentage;
            await db.main.job.update({
                where: { id: jobId },
                data: { progress: Math.round(percentage) },
            });
        }
    };
}
