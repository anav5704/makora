import "dotenv/config";
import { syncAccount } from "@makora/api/jobs/sync-account";
import { SYNC_QUEUE_NAME, syncAccountJobSchema } from "@makora/queue";
import { startWorker } from "./index";

void startWorker({
    name: SYNC_QUEUE_NAME,
    concurrency: 2,
    processor: async (job) => {
        if (!job.id) throw new Error("Job is missing an id");

        const input = syncAccountJobSchema.parse(job.data);
        await syncAccount(input, job.id, (percentage) => job.updateProgress(percentage));
    },
});
