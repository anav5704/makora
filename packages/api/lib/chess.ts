import { Color, db, GamePhase, Termination, TimeControl } from "@makora/db";
import { Chess } from "chess.js";

export interface ParsedPgn {
    url: string;
    opponent: string;
    date: Date;
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
    return username === white ? Color.WHITE : Color.BLACK;
};

const getOpponent = (color: Color, headers: Record<string, string>): string => {
    return color === Color.WHITE
        ? (headers.Black as string)
        : (headers.White as string);
};

const getTimeControl = (time: string): TimeControl => {
    const baseSeconds = parseInt(time.split("+")[0] as string, 10);
    if (baseSeconds <= 180) return TimeControl.BULLET;
    if (baseSeconds <= 600) return TimeControl.BLITZ;
    if (baseSeconds <= 3600) return TimeControl.RAPID;
    return TimeControl.CLASSICAL;
};

const getTermination = (pgn: string): Termination => {
    if (pgn.toLowerCase().includes("checkmate")) return Termination.CHECKMATE;
    if (pgn.toLowerCase().includes("resign")) return Termination.RESIGNATION;
    return Termination.TIMEOUT;
};

const getUrl = (headers: Record<string, string>): string => {
    return (headers.Link || headers.Site) as string;
};

const getMoveCount = (history: string[]): number => {
    return Math.ceil(history.length / 2);
};

const getDate = (headers: Record<string, string>): Date => {
    const date = headers.UTCDate || headers.Date;
    const time = headers.UTCTime ?? "00:00:00";

    if (!date) return new Date();

    const normalizedDate = date.replace(/\./g, "-");

    const [year, month, day] = normalizedDate.split("-").map(Number);
    const [hour, min, sec] = time.split(":").map(Number);

    //@ts-expect-error
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
}) => {
    console.log(pgn);
    const game = new Chess();
    game.loadPgn(pgn);

    const headers = game.getHeaders();
    const history = game.history();

    const parsedPgn: ParsedPgn = {
        url: getUrl(headers),
        opponent: getOpponent(
            getColor(username, headers.White as string),
            headers,
        ),
        date: getDate(headers),
        timeControl: getTimeControl(headers.TimeControl as string),
        opening: await getOpening(pgn),
        moveCount: getMoveCount(history),
        termination: getTermination(pgn),
        gamePhase: getGamePhase(getMoveCount(history)),
        color: getColor(username, headers.White as string),
    };

    return { parsedPgn };
};
