import { db, JobStatus } from "@makora/db";

const STALE_AFTER_MINUTES = 60;

export async function failStaleJobs(userId: string): Promise<void> {
    await db.main.job.updateMany({
        where: {
            userId,
            status: { in: [JobStatus.QUEUED, JobStatus.ACTIVE] },
            updatedAt: { lt: new Date(Date.now() - STALE_AFTER_MINUTES * 60 * 1000) },
        },
        data: { status: JobStatus.FAILED, error: "Worker did not report back in time" },
    });
}
