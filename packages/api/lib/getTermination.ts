import { Termination } from "@makora/db";

interface MovetextEnding {
    lastSan: string;
    result: string;
}

const getMovetextEnding = (pgn: string): MovetextEnding | null => {
    const movetext = pgn
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "" && !line.startsWith("["))
        .join(" ");

    const withoutComments = movetext.replace(/\{[^}]*\}/g, " ");
    const tokens = withoutComments.split(/\s+/).filter(Boolean);

    const lastToken = tokens[tokens.length - 1];

    if (!lastToken) return null;

    const result = /^(1-0|0-1|1\/2-1\/2|\*)$/.test(lastToken) ? lastToken : "";
    const sans = result ? tokens.slice(0, -1) : tokens;

    let lastSan = sans[sans.length - 1] ?? "";

    if (/^\d+\.+$/.test(lastSan)) {
        lastSan = sans[sans.length - 2] ?? "";
    }

    return { lastSan, result };
};

export const getTermination = (pgn: string, headers: Record<string, string>): Termination => {
    const terminationHeader = (headers.Termination ?? "").toLowerCase();

    if (terminationHeader.includes("checkmate")) return Termination.CHECKMATE;
    if (terminationHeader.includes("resign")) return Termination.RESIGNATION;

    if (
        terminationHeader.includes("draw") ||
        terminationHeader.includes("stalemate") ||
        terminationHeader.includes("insufficient") ||
        terminationHeader.includes("agreement") ||
        terminationHeader.includes("repetition")
    ) {
        return Termination.DRAW;
    }

    if (
        terminationHeader.includes("time") ||
        terminationHeader.includes("forfeit") ||
        terminationHeader.includes("flag") ||
        terminationHeader.includes("abandon") ||
        terminationHeader.includes("abort")
    ) {
        return Termination.TIMEOUT;
    }

    const ending = getMovetextEnding(pgn);

    if (!ending) return Termination.TIMEOUT;
    if (ending.lastSan.endsWith("#")) return Termination.CHECKMATE;
    if (ending.result === "1/2-1/2") return Termination.DRAW;
    if (ending.result === "*") return Termination.TIMEOUT;

    return Termination.RESIGNATION;
};
