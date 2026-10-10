import { db, JobStatus } from "@makora/db";
import { getSyncQueue, type SyncAccountJob } from "@makora/queue";
import { failStaleJobs } from "./stale-jobs";

export async function enqueueSyncJobs(userId: string): Promise<string[]> {
    await failStaleJobs(userId);

    const accounts = await db.main.chessAccount.findMany({
        where: {
            userId,
        },
        select: {
            id: true,
            platform: true,
            username: true,
            syncedAt: true,
        },
    });

    const jobIds: string[] = [];

    for (const account of accounts) {
        const inFlight = await db.main.job.findFirst({
            where: {
                userId,
                type: "SYNC_ACCOUNT",
                status: { in: [JobStatus.QUEUED, JobStatus.ACTIVE] },
                payload: { path: ["account", "id"], equals: account.id },
            },
            select: { id: true },
        });

        if (inFlight) {
            jobIds.push(inFlight.id);
            continue;
        }

        const input: SyncAccountJob = {
            userId,
            account: {
                id: account.id,
                platform: account.platform,
                username: account.username,
                syncedAt: account.syncedAt?.toISOString() ?? null,
            },
        };

        const job = await db.main.job.create({
            data: {
                type: "SYNC_ACCOUNT",
                userId,
                payload: input,
            },
        });

        await getSyncQueue().add("sync-account", input, { jobId: job.id });

        jobIds.push(job.id);
    }

    return jobIds;
}
