import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { spawn } from "node:child_process";
import type { TimeControl } from "@makora/db";
import { Chess } from "chess.js";

interface RawStockfishResult {
    evaluation: number;
    bestMove: string;
    isMate: boolean;
    mateIn?: number;
}

interface StockfishResult {
    accuracy: number;
    bestMove: string;
    postMoveEval: string;
    winDrop: number;
}

interface EvalResult {
    results: StockfishResult[];
    accuracy: number;
}

interface Position {
    fen: string;
    blackToMove: boolean;
}

// Rapid and classical get the deep search; bullet and blitz are short-form games
// where extra depth does not move the accuracy metric but costs a lot of time.
const DEPTH_BY_TIME_CONTROL: Record<TimeControl, number> = {
    BULLET: 10,
    BLITZ: 12,
    RAPID: 16,
    CLASSICAL: 18,
};

// Each engine is single-threaded and they contend for the same cores, so N
// engines finish a game far sooner than one N-threaded engine. Tuned for a
// 4-core host that is also running the API and Postgres.
const ENGINE_COUNT = 3;

// Deliberately well above the old 10s: several engines sharing cores makes any
// given position slower than it would be alone, and a timeout costs the job.
const POSITION_TIMEOUT_MS = 20_000;

const calculateWinPercent = (centipawns: number): number => {
    return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
};

const calculateAccuracy = (winBefore: number, winAfter: number): number => {
    return 103.1668 * Math.exp(-0.04354 * (winBefore - winAfter)) - 3.1669;
};

const formatEval = (evaluation: number, isMate: boolean, mateIn?: number): string => {
    if (isMate && mateIn !== undefined) {
        return `#${mateIn}`;
    }
    const evalInPawns = evaluation / 100;
    return evalInPawns >= 0 ? `+${evalInPawns.toFixed(1)}` : evalInPawns.toFixed(1);
};

/**
 * A single single-threaded Stockfish process, reused across positions.
 *
 * A position that times out kills this engine and marks it dead; the caller is
 * responsible for starting a fresh one rather than handing the dead process to
 * the next position.
 */
class StockfishEngine {
    private process: ChildProcessWithoutNullStreams | null = null;
    private dead = false;

    get isDead(): boolean {
        return this.dead;
    }

    async start(): Promise<void> {
        if (this.process && !this.dead) return;

        const proc = spawn("stockfish");
        proc.setMaxListeners(32);
        this.process = proc;
        this.dead = false;

        await new Promise<void>((resolve, reject) => {
            const onData = (data: Buffer) => {
                if (data.toString().includes("readyok")) {
                    proc.stdout.off("data", onData);
                    proc.off("error", onError);
                    resolve();
                }
            };

            const onError = (err: Error) => {
                proc.stdout.off("data", onData);
                this.dead = true;
                reject(err);
            };

            proc.stdout.on("data", onData);
            proc.once("error", onError);

            proc.stdin.write("uci\n");
            proc.stdin.write("setoption name Threads value 1\n");
            proc.stdin.write("setoption name Hash value 16\n");
            proc.stdin.write("isready\n");
        });
    }

    async analyze(position: Position, depth: number): Promise<RawStockfishResult> {
        const proc = this.process;
        if (!proc || this.dead) throw new Error("Stockfish is not running");

        return new Promise<RawStockfishResult>((resolve, reject) => {
            let evaluation: number | undefined;
            let bestMove: string | undefined;
            let isMate = false;
            let mateIn: number | undefined;
            let settled = false;
            let timer: ReturnType<typeof setTimeout> | undefined;

            const cleanup = () => {
                if (timer) clearTimeout(timer);
                proc.stdout.off("data", onData);
                proc.off("error", onError);
                proc.off("exit", onExit);
            };

            const succeed = () => {
                if (settled) return;
                settled = true;
                cleanup();
                resolve({ evaluation: evaluation as number, bestMove: bestMove as string, isMate, mateIn });
            };

            const fail = (error: Error) => {
                if (settled) return;
                settled = true;
                cleanup();
                reject(error);
            };

            // A wedged engine cannot be reused, so take it down. The pool starts
            // a replacement, and only this position fails.
            const onTimeout = () => {
                this.dead = true;
                proc.kill();
                fail(new Error(`Stockfish timed out after ${POSITION_TIMEOUT_MS}ms`));
            };

            const onError = (err: Error) => {
                this.dead = true;
                fail(err);
            };

            const onExit = () => {
                this.dead = true;
                fail(new Error("Stockfish exited before returning a best move"));
            };

            const onData = (data: Buffer) => {
                for (const line of data.toString().split("\n")) {
                    const cpMatch = line.match(/score cp (-?\d+)/);
                    if (cpMatch) {
                        evaluation = parseInt(cpMatch[1] as string, 10);
                        if (position.blackToMove) evaluation *= -1;
                        isMate = false;
                    }

                    const mateMatch = line.match(/score mate (-?\d+)/);
                    if (mateMatch) {
                        const mateInRaw = parseInt(mateMatch[1] as string, 10);
                        mateIn = Math.abs(mateInRaw);
                        evaluation = mateInRaw > 0 ? 32767 : -32767;
                        if (position.blackToMove) evaluation *= -1;
                        isMate = true;
                    }

                    if (line.match(/bestmove (.+)/)) {
                        bestMove = line.match(/bestmove (.+)/)?.[1]?.trim();
                        if (evaluation === undefined || bestMove === undefined) {
                            fail(new Error("Failed to parse evaluation or best move"));
                            return;
                        }
                        succeed();
                        return;
                    }
                }
            };

            timer = setTimeout(onTimeout, POSITION_TIMEOUT_MS);

            proc.stdout.on("data", onData);
            proc.once("error", onError);
            proc.once("exit", onExit);

            proc.stdin.write(`position fen ${position.fen}\n`);
            proc.stdin.write(`go depth ${depth}\n`);
        });
    }

    async close(): Promise<void> {
        const proc = this.process;
        this.process = null;
        this.dead = true;
        if (!proc) return;

        proc.stdout.removeAllListeners("data");
        proc.kill();
    }
}

/**
 * Walks the game once to materialise every position Stockfish needs.
 *
 * The positions only depend on the move list, so they can all be gathered up
 * front and searched concurrently instead of one ply at a time.
 */
const collectPositions = (moves: string[]): Position[] => {
    const board = new Chess();
    const positions: Position[] = [];

    for (const move of moves) {
        positions.push({ fen: board.fen(), blackToMove: board.turn() === "b" });
        board.move(move);
        positions.push({ fen: board.fen(), blackToMove: board.turn() === "b" });
    }

    return positions;
};

const analyzePositions = async (
    positions: Position[],
    depth: number,
    onPositionAnalyzed?: () => void,
): Promise<RawStockfishResult[]> => {
    const results = new Array<RawStockfishResult>(positions.length);
    if (positions.length === 0) return results;

    const failure: { current: Error | null } = { current: null };
    let cursor = 0;

    const worker = async () => {
        const engine = new StockfishEngine();

        try {
            await engine.start();

            for (;;) {
                // Another engine already failed; stop pulling new work.
                if (failure.current) return;

                const index = cursor++;
                if (index >= positions.length) return;

                try {
                    if (engine.isDead) await engine.start();
                    results[index] = await engine.analyze(positions[index] as Position, depth);
                    onPositionAnalyzed?.();
                } catch (error) {
                    failure.current ??= error instanceof Error ? error : new Error(String(error));
                    return;
                }
            }
        } catch (error) {
            failure.current ??= error instanceof Error ? error : new Error(String(error));
        } finally {
            await engine.close();
        }
    };

    const workerCount = Math.min(ENGINE_COUNT, positions.length);
    await Promise.all(Array.from({ length: workerCount }, worker));

    if (failure.current) throw failure.current;

    return results;
};

export const getEval = async (
    moves: string[],
    playerColor: "WHITE" | "BLACK",
    timeControl: TimeControl,
    onProgress?: (completed: number, total: number) => void,
): Promise<EvalResult> => {
    const depth = DEPTH_BY_TIME_CONTROL[timeControl];
    const positions = collectPositions(moves);

    let analyzed = 0;
    const reportPosition = () => {
        analyzed += 1;
        // Two positions per move, and the callback speaks in moves.
        onProgress?.(Math.min(Math.floor(analyzed / 2), moves.length), moves.length);
    };

    const raw = await analyzePositions(positions, depth, reportPosition);

    const results: StockfishResult[] = [];

    for (const [index] of moves.entries()) {
        const resultBefore = raw[index * 2] as RawStockfishResult;
        const resultAfter = raw[index * 2 + 1] as RawStockfishResult;
        const isWhiteMove = !(positions[index * 2] as Position).blackToMove;

        const winBefore = resultBefore.isMate
            ? resultBefore.evaluation > 0
                ? 100
                : 0
            : calculateWinPercent(resultBefore.evaluation);

        const winAfter = resultAfter.isMate
            ? resultAfter.evaluation > 0
                ? 100
                : 0
            : calculateWinPercent(resultAfter.evaluation);

        const winDrop = isWhiteMove ? winBefore - winAfter : winAfter - winBefore;
        const movingSideWinBefore = isWhiteMove ? winBefore : 100 - winBefore;
        const movingSideWinAfter = isWhiteMove ? winAfter : 100 - winAfter;
        const accuracy = calculateAccuracy(movingSideWinBefore, movingSideWinAfter);
        const postMoveEval = formatEval(resultAfter.evaluation, resultAfter.isMate, resultAfter.mateIn);

        results.push({
            accuracy: Math.round(accuracy * 100) / 100,
            postMoveEval,
            bestMove: resultAfter.bestMove,
            winDrop: Math.round(winDrop * 100) / 100,
        });
    }

    const playerMoves: number[] = [];

    results.forEach((result, index) => {
        const isWhiteMove = index % 2 === 0;
        const isPlayerMove = (playerColor === "WHITE" && isWhiteMove) || (playerColor === "BLACK" && !isWhiteMove);

        if (isPlayerMove) {
            playerMoves.push(Math.min(result.accuracy, 100));
        }
    });

    const accuracy =
        playerMoves.length > 0
            ? Math.round((playerMoves.reduce((sum, acc) => sum + acc, 0) / playerMoves.length) * 100) / 100
            : 0;

    return {
        results,
        accuracy,
    };
};
