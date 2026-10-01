import { db, JobStatus, Platform } from "@makora/db";
import type { SyncAccountJob } from "@makora/queue";
import { UnrecoverableError } from "bullmq";
import { type ParsedPgn, parsePgn } from "../../lib/parsePgn";
import { createProgressReporter, type ProgressCallback } from "./job-progress";

type ReportProgress = (percentage: number) => Promise<void>;

const ARCHIVE_CONCURRENCY = 5;
const INSERT_CHUNK_SIZE = 500;
const FETCH_TIMEOUT_MS = 30000;
const LICHESS_FETCH_TIMEOUT_MS = 120000;

const serializeError = (error: unknown): string => {
    return error instanceof Error ? error.message : "Unknown error";
};

export async function syncAccount(input: SyncAccountJob, jobId: string, onProgress?: ProgressCallback): Promise<void> {
    const reportProgress = createProgressReporter(jobId, onProgress);
    const { account } = input;
    const syncedAt = account.syncedAt ? new Date(account.syncedAt) : null;

    await db.main.job.update({
        where: { id: jobId },
        data: { status: JobStatus.ACTIVE },
    });

    try {
        if (account.platform === Platform.CHESS_COM) {
            await syncChessComAccount(account.username, account.id, syncedAt, reportProgress);
        }

        if (account.platform === Platform.LICHESS_ORG) {
            await syncLichessAccount(account.username, account.id, syncedAt, reportProgress);
        }

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

async function filterNewGames(accountId: string, games: ParsedPgn[]): Promise<ParsedPgn[]> {
    const existing = await db.main.game.findMany({
        where: { accountId },
        select: { url: true },
    });

    const existingUrls = new Set(existing.map((game) => game.url));

    return games.filter((game) => !existingUrls.has(game.url));
}

function warnSkippedGame(username: string, error: unknown): void {
    console.warn(`Skipping unparseable game for ${username}:`, error instanceof Error ? error.message : error);
}

async function insertGames(accountId: string, games: ParsedPgn[]): Promise<void> {
    for (let i = 0; i < games.length; i += INSERT_CHUNK_SIZE) {
        const chunk = games.slice(i, i + INSERT_CHUNK_SIZE);

        await db.main.game.createMany({
            data: chunk.map((game) => ({
                accountId,
                ...game,
            })),
            skipDuplicates: true,
        });
    }
}

async function fetchChessComArchive(archive: string, username: string, syncedAt: Date | null): Promise<ParsedPgn[]> {
    const games: ParsedPgn[] = [];
    const archiveRes = await fetch(archive, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

    if (!archiveRes.ok) {
        throw new Error(`Chess.com archive request failed with status ${archiveRes.status}: ${archive}`);
    }

    const archiveData = (await archiveRes.json()) as {
        games: { pgn: string }[];
    };

    for (const { pgn } of archiveData.games) {
        try {
            const { parsedPgn } = await parsePgn({
                username,
                pgn,
            });

            if (!syncedAt || parsedPgn.date.getTime() > syncedAt.getTime()) games.push(parsedPgn);
        } catch (error) {
            warnSkippedGame(username, error);
        }
    }

    return games;
}

async function syncChessComAccount(
    username: string,
    accountId: string,
    syncedAt: Date | null,
    reportProgress: ReportProgress,
): Promise<void> {
    const games: ParsedPgn[] = [];

    const res = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (res.status === 404) {
        throw new UnrecoverableError(`Chess.com user not found: ${username}`);
    }

    if (!res.ok) {
        throw new Error(`Chess.com archives request failed with status ${res.status}`);
    }

    const data = (await res.json()) as { archives: string[] };

    let archives: string[] = data.archives;

    if (syncedAt) {
        const minMonth = new Date(syncedAt.getFullYear(), syncedAt.getMonth(), 1);

        archives = data.archives.filter((a) => {
            const [yearStr, monthStr] = a.split("/").slice(-2).map(Number);
            const year = Number(yearStr);
            const month = Number(monthStr);
            const archiveMonth = new Date(year, month - 1);
            return archiveMonth >= minMonth;
        });
    }

    for (let i = 0; i < archives.length; i += ARCHIVE_CONCURRENCY) {
        const chunk = archives.slice(i, i + ARCHIVE_CONCURRENCY);
        const results = await Promise.all(chunk.map((archive) => fetchChessComArchive(archive, username, syncedAt)));

        games.push(...results.flat());

        const completed = Math.min(i + ARCHIVE_CONCURRENCY, archives.length);
        await reportProgress(archives.length ? (completed / archives.length) * 100 : 100);
    }

    const newGames = await filterNewGames(accountId, games);

    await insertGames(accountId, newGames);

    await db.main.chessAccount.update({
        where: {
            id: accountId,
        },
        data: {
            syncedAt: new Date(),
        },
    });
}

async function syncLichessAccount(
    username: string,
    accountId: string,
    syncedAt: Date | null,
    reportProgress: ReportProgress,
): Promise<void> {
    const games: ParsedPgn[] = [];
    let url = `https://lichess.org/api/games/user/${username}?sort=dateAsc`;

    if (syncedAt) {
        url += `&since=${syncedAt.getTime()}`;
    }

    const res = await fetch(url, {
        headers: {
            Accept: "application/x-chess-pgn",
        },
        signal: AbortSignal.timeout(LICHESS_FETCH_TIMEOUT_MS),
    });

    if (res.status === 404) {
        throw new UnrecoverableError(`Lichess user not found: ${username}`);
    }

    if (!res.ok) {
        throw new Error(`Lichess games request failed with status ${res.status}`);
    }

    const data = await res.text();
    const pgns = data
        .split(/\n{2,}(?=\[Event )/g)
        .map((s) => s.trim())
        .filter(Boolean);

    for (const [index, pgn] of pgns.entries()) {
        try {
            const { parsedPgn } = await parsePgn({
                username,
                pgn,
            });

            games.push(parsedPgn);
        } catch (error) {
            warnSkippedGame(username, error);
        }

        await reportProgress(pgns.length ? ((index + 1) / pgns.length) * 90 : 100);
    }

    const newGames = await filterNewGames(accountId, games);

    await insertGames(accountId, newGames);

    await db.main.chessAccount.update({
        where: {
            id: accountId,
        },
        data: {
            syncedAt: new Date(),
        },
    });
}
