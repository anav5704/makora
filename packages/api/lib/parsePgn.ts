import { Color, db, GamePhase, type Termination, TimeControl } from "@makora/db";
import { Chess } from "chess.js";
import { getTermination } from "./getTermination";

export interface ParsedPgn {
    moves: string[];
    url: string;
    opponent: string;
    date: Date | null;
    timeControl: TimeControl;
    opening: string;
    moveCount: number;
    termination: Termination;
    gamePhase: GamePhase;
    color: Color;
}

const getGamePhase = (moveCount: number): GamePhase => {
    if (moveCount < 15) return GamePhase.OPENING;
    if (moveCount < 30) return GamePhase.MIDDLE_GAME;
    return GamePhase.END_GAME;
};

const getColor = (username: string, white: string): Color => {
    return username.toLowerCase() === white?.toLowerCase() ? Color.WHITE : Color.BLACK;
};

const getOpponent = (color: Color, headers: Record<string, string>): string => {
    return color === Color.WHITE ? (headers.Black as string) : (headers.White as string);
};

export const getTimeControl = (time: string): TimeControl => {
    if (!time || time.includes("/")) return TimeControl.CLASSICAL;

    const baseSeconds = parseInt(time.split("+")[0] as string, 10);

    if (Number.isNaN(baseSeconds)) return TimeControl.CLASSICAL;
    if (baseSeconds < 180) return TimeControl.BULLET;
    if (baseSeconds < 600) return TimeControl.BLITZ;
    if (baseSeconds <= 3600) return TimeControl.RAPID;
    return TimeControl.CLASSICAL;
};

const getIsLoss = (result: string | undefined, color: Color): boolean => {
    if (color === Color.WHITE) return result === "0-1";
    return result === "1-0";
};

const getUrl = (headers: Record<string, string>): string => {
    return (headers.Link || headers.Site) as string;
};

const getMoveCount = (history: string[]): number => {
    return Math.ceil(history.length / 2);
};

const getDate = (headers: Record<string, string>): Date | null => {
    const date = headers.UTCDate || headers.Date;
    const time = headers.UTCTime ?? "00:00:00";

    if (!date) return null;

    const normalizedDate = date.replace(/\./g, "-");

    const [year, month, day] = normalizedDate.split("-").map(Number);
    const [hour, min, sec] = time.split(":").map(Number);

    if (
        year === undefined ||
        month === undefined ||
        day === undefined ||
        hour === undefined ||
        min === undefined ||
        sec === undefined ||
        Number.isNaN(year) ||
        Number.isNaN(month) ||
        Number.isNaN(day) ||
        Number.isNaN(hour) ||
        Number.isNaN(min) ||
        Number.isNaN(sec)
    ) {
        return null;
    }

    return new Date(Date.UTC(year, month - 1, day, hour, min, sec));
};

const getOpening = async (pgn: string): Promise<string> => {
    let bestOpening: string = "Unknown Opening";
    const board = new Chess();
    board.loadPgn(pgn);
    const moves = board.history();

    const game = new Chess();

    for (const move of moves) {
        game.move(move);
        const fen = game.fen().split(" ")[0];

        const candidateOpening = await db.chess.opening.findFirst({
            where: {
                fen,
            },
            select: {
                name: true,
            },
        });

        if (candidateOpening) {
            bestOpening = candidateOpening.name;
        }
    }

    return bestOpening;
};

export const parsePgn = async ({
    username,
    pgn,
}: {
    username: string;
    pgn: string;
}): Promise<{ parsedPgn: ParsedPgn | null }> => {
    const game = new Chess();
    game.loadPgn(pgn);

    const headers = game.getHeaders();

    const variant = headers.Variant;

    if (variant && variant.toLowerCase() !== "standard") {
        console.warn(`Skipping ${variant} game (only standard chess is supported)`);
        return { parsedPgn: null };
    }

    const moves = game.history();
    const moveCount = getMoveCount(moves);
    const color = getColor(username, headers.White as string);

    if (!getIsLoss(headers.Result, color)) {
        return { parsedPgn: null };
    }

    const parsedPgn: ParsedPgn = {
        moves,
        url: getUrl(headers),
        opponent: getOpponent(color, headers),
        date: getDate(headers),
        timeControl: getTimeControl(headers.TimeControl as string),
        opening: await getOpening(pgn),
        moveCount,
        termination: getTermination(pgn, headers),
        gamePhase: getGamePhase(moveCount),
        color,
    };

    return { parsedPgn };
};
