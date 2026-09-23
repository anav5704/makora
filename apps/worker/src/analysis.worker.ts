import "dotenv/config";
import { analyzeGame } from "@makora/api/jobs/analyze-game";
import { ANALYSIS_QUEUE_NAME, analyzeGameJobSchema } from "@makora/queue";
import { startWorker } from "./index";

void startWorker({
    name: ANALYSIS_QUEUE_NAME,
    concurrency: 1,
    processor: async (job) => {
        if (!job.id) throw new Error("Job is missing an id");

        const input = analyzeGameJobSchema.parse(job.data);
        await analyzeGame(input, job.id, (percentage) => job.updateProgress(percentage));
    },
});
