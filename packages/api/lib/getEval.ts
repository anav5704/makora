import { Chess } from "chess.js";
import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";

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

const calculateWinPercent = (centipawns: number): number => {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1);
};

const calculateAccuracy = (winBefore: number, winAfter: number): number => {
  return 103.1668 * Math.exp(-0.04354 * (winBefore - winAfter)) - 3.1669;
};

const getStockfishResult = async (
  stockfish: ChildProcessWithoutNullStreams,
  fen: string,
  board: Chess
): Promise<RawStockfishResult> => {
  return new Promise((resolve, reject) => {
    let evaluation: number | undefined;
    let bestMove: string | undefined;
    let isMate = false;
    let mateIn: number | undefined;

    const timeout = setTimeout(() => {
      stockfish.kill();
      reject(new Error("Stockfish timeout"));
    }, 10000);

    const onData = (data: Buffer) => {
      const output = data.toString();
      const lines = output.split("\n");

      for (const line of lines) {
        const cpMatch = line.match(/score cp (-?\d+)/);
        if (cpMatch) {
          evaluation = parseInt(cpMatch[1]!);
          if (board.turn() === 'b') evaluation *= -1;
          isMate = false;
        }

        const mateMatch = line.match(/score mate (-?\d+)/);
        if (mateMatch) {
          const mateInRaw = parseInt(mateMatch[1]!);
          mateIn = Math.abs(mateInRaw);
          evaluation = mateInRaw > 0 ? 32767 : -32767;
          if (board.turn() === 'b') evaluation *= -1;
          isMate = true;
        }

        const bestMoveMatch = line.match(/bestmove (.+)/);
        if (bestMoveMatch) {
          bestMove = bestMoveMatch[1]!;
          clearTimeout(timeout);
          stockfish.stdout.off("data", onData);
          if (evaluation !== undefined && bestMove !== undefined) {
            resolve({
              evaluation: evaluation!,
              bestMove: bestMove!,
              isMate,
              mateIn
            });
          } else {
            reject(new Error("Failed to parse evaluation or best move"));
          }
        }
      }
    };

    stockfish.stdout.on("data", onData);

    stockfish.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    stockfish.stdin.write(`position fen ${fen}\n`);
    stockfish.stdin.write("go depth 20\n");
  });
};

const formatEval = (evaluation: number, isMate: boolean, mateIn?: number): string => {
  if (isMate && mateIn !== undefined) {
    return evaluation > 0 ? `+M${mateIn}` : `-M${mateIn}`;
  }
  const evalInPawns = evaluation / 100;
  return evalInPawns >= 0 ? `+${evalInPawns.toFixed(1)}` : evalInPawns.toFixed(1);
};

export const getEval = async (moves: string[]): Promise<StockfishResult[]> => {
  const board = new Chess();
  const results: StockfishResult[] = [];
  const stockfish = spawn("stockfish");
  stockfish.setMaxListeners(20);

  // Initialize Stockfish
  await new Promise<void>((resolve, reject) => {
    const onData = (data: Buffer) => {
      if (data.toString().includes("readyok")) {
        stockfish.stdout.off("data", onData);
        resolve();
      }
    };
    stockfish.stdout.on("data", onData);
    stockfish.on("error", reject);
    stockfish.stdin.write("uci\n");
    stockfish.stdin.write("setoption name Threads value 2\n");
    stockfish.stdin.write("isready\n");
  });

  for (const move of moves) {
    const fenBefore = board.fen();
    const resultBefore = await getStockfishResult(stockfish, fenBefore, board);
    const winBefore = resultBefore.isMate ? (resultBefore.evaluation > 0 ? 100 : 0) : calculateWinPercent(resultBefore.evaluation);

    board.move(move);

    const fenAfter = board.fen();
    const resultAfter = await getStockfishResult(stockfish, fenAfter, board);
    const winAfter = resultAfter.isMate ? (resultAfter.evaluation > 0 ? 100 : 0) : calculateWinPercent(resultAfter.evaluation);

    const accuracy = calculateAccuracy(winBefore, winAfter);
    const postMoveEval = formatEval(resultAfter.evaluation, resultAfter.isMate, resultAfter.mateIn);
    const winDrop = winBefore - winAfter;

    console.log(`Accuracy: ${Math.round(accuracy * 100) / 100}, Win drop: ${Math.round(winDrop * 100) / 100}, Eval: ${postMoveEval}, Best move: ${resultAfter.bestMove}`);

    results.push({
      accuracy: Math.round(accuracy * 100) / 100,
      postMoveEval,
      bestMove: resultAfter.bestMove,
      winDrop: Math.round(winDrop * 100) / 100
    });
  }

  stockfish.stdin.write("quit\n");
  return results;
};
