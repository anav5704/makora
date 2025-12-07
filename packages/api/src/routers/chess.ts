// TODO: implement database transactions
import { db, Platform } from "@makora/db";
import { type ParsedPgn, parsePgn } from "../../lib/chess";
import { protectedProcedure, publicProcedure, router } from "../index";

export const chessRouter = router({
    sync: protectedProcedure.mutation(async ({ ctx }) => {
        const syncStart = new Date();
        const accounts = await db.main.chessAccount.findMany({
            where: {
                userId: ctx.session.user.id,
            },
            select: {
                id: true,
                platform: true,
                username: true,
                syncedAt: true,
            },
        });

        for (const { id, username, platform, syncedAt } of accounts) {
            if (platform === Platform.CHESS_COM) {
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

                for (const archive of archives) {
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
                }

                await db.main.game.createMany({
                    data: games.map((game) => ({
                        accountId: id,
                        ...game,
                    })),
                });

                await db.main.chessAccount.update({
                    where: {
                        id,
                    },
                    data: {
                        syncedAt: syncStart,
                    },
                });

                console.log(games);
            }

            if (platform === Platform.LICHESS_ORG) {
                const games: ParsedPgn[] = [];
                let url = `https://lichess.org/api/games/user/${username}?max=2&sort=dateAsc`;

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
                        for (const pgn of pgns) {
                            const { parsedPgn } = await parsePgn({
                                username,
                                pgn,
                            });

                            games.push(parsedPgn);
                        }

                        await db.main.game.createMany({
                            data: games.map((game) => ({
                                accountId: id,
                                ...game,
                            })),
                        });

                        await db.main.chessAccount.update({
                            where: {
                                id,
                            },
                            data: {
                                syncedAt: syncStart,
                            },
                        });
                    }
                }
            }
        }
    }),
    games: protectedProcedure.query(async ({ ctx }) => {
        const games = await db.main.game.findMany({
            where: {
                account: {
                    userId: ctx.session.user.id,
                },
            },
            orderBy: {
                date: "desc",
            },
        });

        return games;
    }),
    openings: publicProcedure.query(async () => {
        const openings = await db.chess.opening.findMany();

        return openings;
    }),
});
