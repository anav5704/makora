import { db, JobStatus, Platform } from "@makora/db";
import type { SyncAccountJob } from "@makora/queue";
import { type ParsedPgn, parsePgn } from "../../lib/parsePgn";
import { createProgressReporter, type ProgressCallback } from "./job-progress";

type ReportProgress = (percentage: number) => Promise<void>;

const serializeError = (error: unknown): string => {
    return error instanceof Error ? error.message : "Unknown error";
};

export async function syncAccount(input: SyncAccountJob, jobId: string, onProgress?: ProgressCallback): Promise<void> {
    const reportProgress = createProgressReporter(jobId, onProgress);
    const { account } = input;
    const syncedAt = account.syncedAt ? new Date(account.syncedAt) : null;
    const syncStart = new Date();

    await db.main.job.update({
        where: { id: jobId },
        data: { status: JobStatus.ACTIVE },
    });

    try {
        if (account.platform === Platform.CHESS_COM) {
            await syncChessComAccount(account.username, account.id, syncedAt, syncStart, reportProgress);
        }

        if (account.platform === Platform.LICHESS_ORG) {
            await syncLichessAccount(account.username, account.id, syncedAt, syncStart, reportProgress);
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

async function syncChessComAccount(
    username: string,
    accountId: string,
    syncedAt: Date | null,
    syncStart: Date,
    reportProgress: ReportProgress,
): Promise<void> {
    const games: ParsedPgn[] = [];
    let archives: string[] = [];

    const res = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);

    if (res.ok) {
        const data = (await res.json()) as { archives: string[] };

        if (syncedAt) {
            const minMonth = new Date(syncedAt.getFullYear(), syncedAt.getMonth(), 1);

            const newArchivces = data.archives.filter((a) => {
                const [yearStr, monthStr] = a.split("/").slice(-2).map(Number);
                const year = Number(yearStr);
                const month = Number(monthStr);
                const archiveMonth = new Date(year, month - 1);
                return archiveMonth >= minMonth;
            });

            archives = newArchivces;
        } else {
            archives = data.archives;
        }
    }

    for (const [index, archive] of archives.entries()) {
        const res = await fetch(archive);

        if (res.ok) {
            const data = (await res.json()) as {
                games: { pgn: string }[];
            };

            if (data.games.length) {
                for (const { pgn } of data.games) {
                    const { parsedPgn } = await parsePgn({
                        username,
                        pgn,
                    });

                    // @ts-expect-error
                    if (parsedPgn.date?.getTime() > syncedAt?.getTime()) games.push(parsedPgn);
                }
            }
        }

        await reportProgress(archives.length ? ((index + 1) / archives.length) * 100 : 100);
    }

    for (const game of games) {
        await db.main.game.create({
            data: {
                accountId,
                ...game,
            },
        });
    }

    await db.main.chessAccount.update({
        where: {
            id: accountId,
        },
        data: {
            syncedAt: syncStart,
        },
    });
}

async function syncLichessAccount(
    username: string,
    accountId: string,
    syncedAt: Date | null,
    syncStart: Date,
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
    });

    if (res.ok) {
        const data = await res.text();
        const pgns = data
            .split(/\n{2,}(?=\[Event )/g)
            .map((s) => s.trim())
            .filter(Boolean);

        if (pgns.length) {
            for (const [index, pgn] of pgns.entries()) {
                const { parsedPgn } = await parsePgn({
                    username,
                    pgn,
                });

                games.push(parsedPgn);
                await reportProgress(((index + 1) / pgns.length) * 90);
            }

            for (const game of games) {
                await db.main.game.create({
                    data: {
                        accountId,
                        ...game,
                    },
                });
            }

            await db.main.chessAccount.update({
                where: {
                    id: accountId,
                },
                data: {
                    syncedAt: syncStart,
                },
            });
        }
    }
}
