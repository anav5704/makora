import { db, JobStatus, Prisma } from "@makora/db";
import type { AnalyzeGameJob } from "@makora/queue";
import { getEval, type StockfishResult } from "../../lib/getEval";

const isMoveResult = (value: unknown): value is StockfishResult => {
    if (!value || typeof value !== "object") return false;
    const move = value as Record<string, unknown>;
    return (
        typeof move.accuracy === "number" &&
        typeof move.bestMove === "string" &&
        typeof move.postMoveEval === "string" &&
        typeof move.winDrop === "number"
    );
};

const readCheckpoint = (value: unknown, moveCount: number): Array<StockfishResult | null> => {
    const saved = Array<StockfishResult | null>(moveCount).fill(null);
    if (!Array.isArray(value)) return saved;

    for (let index = 0; index < moveCount && index < value.length; index += 1) {
        if (isMoveResult(value[index])) saved[index] = value[index];
    }

    return saved;
};

export async function analyzeGame(input: AnalyzeGameJob, jobId: string): Promise<void> {
    const { gameId } = input;

    await db.main.job.update({
        where: { id: jobId },
        data: { status: JobStatus.ACTIVE },
    });

    const evaluation = await db.main.evaluation.findUnique({
        where: { gameId },
    });

    if (evaluation) {
        await db.main.job.update({
            where: { id: jobId },
            data: { status: JobStatus.COMPLETED },
        });
        return;
    }

    const game = await db.main.game.findUnique({
        where: { id: gameId },
        select: {
            moves: true,
            color: true,
            timeControl: true,
            analysisCheckpoint: true,
        },
    });

    if (!game) {
        await db.main.job.update({
            where: { id: jobId },
            data: { status: JobStatus.FAILED, error: "Game not found" },
        });
        return;
    }

    const saved = readCheckpoint(game.analysisCheckpoint, game.moves.length);
    let write = Promise.resolve();

    const evalResult = await getEval(game.moves, game.color, game.timeControl, {
        saved,
        onMove: (index, result) => {
            write = write.then(async () => {
                saved[index] = result;
                await db.main.game.update({
                    where: { id: gameId },
                    data: { analysisCheckpoint: [...saved] as Prisma.InputJsonValue },
                });
            });
            return write;
        },
    });

    await write;

    await db.main.evaluation.create({
        data: {
            gameId,
            accuracy: evalResult.accuracy,
            results: evalResult.results as any,
        },
    });

    await db.main.game.update({
        where: { id: gameId },
        data: {
            reviewed: true,
            analysisCheckpoint: Prisma.DbNull,
        },
    });

    await db.main.job.update({
        where: { id: jobId },
        data: { status: JobStatus.COMPLETED },
    });
}
