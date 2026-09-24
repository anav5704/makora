import { db, JobStatus } from "@makora/db";
import type { AnalyzeGameJob } from "@makora/queue";
import { getEval } from "../../lib/getEval";
import { createProgressReporter, type ProgressCallback } from "./job-progress";

const serializeError = (error: unknown): string => {
    return error instanceof Error ? error.message : "Unknown error";
};

export async function analyzeGame(input: AnalyzeGameJob, jobId: string, onProgress?: ProgressCallback): Promise<void> {
    const reportProgress = createProgressReporter(jobId, onProgress);
    const { gameId } = input;

    await db.main.job.update({
        where: { id: jobId },
        data: { status: JobStatus.ACTIVE },
    });

    try {
        const evaluation = await db.main.evaluation.findUnique({
            where: {
                gameId,
            },
        });

        if (evaluation) {
            await db.main.job.update({
                where: { id: jobId },
                data: { status: JobStatus.COMPLETED, progress: 100 },
            });
            return;
        }

        const game = await db.main.game.findUnique({
            where: {
                id: gameId,
            },
            select: {
                moves: true,
                color: true,
            },
        });

        if (!game) {
            await db.main.job.update({
                where: { id: jobId },
                data: { status: JobStatus.FAILED, error: "Game not found" },
            });
            return;
        }

        const evalResult = await getEval(game.moves, game.color, (completed, total) =>
            reportProgress(total ? (completed / total) * 100 : 0),
        );

        await db.main.evaluation.create({
            data: {
                gameId,
                accuracy: evalResult.accuracy,
                results: evalResult.results as any,
            },
        });

        await db.main.game.update({
            where: {
                id: gameId,
            },
            data: {
                reviewed: true,
            },
        });

        console.log(evalResult);

        await db.main.job.update({
            where: { id: jobId },
            data: { status: JobStatus.COMPLETED, progress: 100 },
        });
    } catch (error) {
        await db.main.job.update({
            where: { id: jobId },
            data: { status: JobStatus.FAILED, error: serializeError(error) },
        });
        throw error;
    }
}
