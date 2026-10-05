import { db } from "@makora/db";
import { Chess } from "chess.js";

export interface Opening {
    eco: string;
    name: string;
}

export type Classification = { eco: string | null; name: string };

export const loadOpenings = async (): Promise<Map<string, Opening>> => {
    const rows = await db.chess.opening.findMany({
        select: { eco: true, name: true, fen: true },
    });

    const openings = new Map<string, Opening>();

    for (const row of rows) {
        if (!openings.has(row.fen)) {
            openings.set(row.fen, { eco: row.eco, name: row.name });
        }
    }

    return openings;
};

export const classify = (openings: Map<string, Opening>, pgn: string): Classification => {
    let best: Classification = { eco: null, name: "Unknown Opening" };

    const board = new Chess();
    board.loadPgn(pgn);
    const moves = board.history();

    const game = new Chess();

    for (const move of moves) {
        game.move(move);
        const fen = game.fen().split(" ")[0] as string;
        const candidate = openings.get(fen);

        if (candidate) {
            best = candidate;
        }
    }

    return best;
};
