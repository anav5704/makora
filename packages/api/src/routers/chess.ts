import { db, Platform } from "@makora/db";
import { type ParsedPgn, parsePgn } from "../../lib/chess";
import { publicProcedure, router } from "../index";

export const chessRouter = router({
    sync: publicProcedure.mutation(async ({ ctx }) => {
        const accounts = await db.main.chessAccount.findMany({
            where: {
                userId: ctx.session?.user.id,
            },
            select: {
                id: true,
                platform: true,
                username: true,
                syncedAt: true,
            },
        });

        const games: ParsedPgn[] = [];

        for (const { id, username, platform, syncedAt } of accounts) {
            if (platform === Platform.CHESS_COM) {
                let archives: string[] = [];

                const res = await fetch(
                    `https://api.chess.com/pub/player/${username}/games/archives`,
                );

                if (res.ok) {
                    const data = (await res.json()) as { archives: string[] };

                    if (syncedAt) {
                        const minMonth = new Date(
                            syncedAt.getFullYear(),
                            syncedAt.getMonth(),
                            1,
                        );

                        const newArchivces = data.archives.filter((a) => {
                            const [yearStr, monthStr] = a
                                .split("/")
                                .slice(-2)
                                .map(Number);
                            const year = Number(yearStr);
                            const month = Number(monthStr);
                            const archiveMonth = new Date(year, month - 1);
                            return archiveMonth >= minMonth;
                        });

                        //@ts-expect-error
                        archives = newArchivces.slice(0, 1);
                    } else {
                        archives = data.archives.slice(0, 1);
                    }
                }

                for (const archive of archives) {
                    const res = await fetch(archive);

                    if (res.ok) {
                        const data = (await res.json()) as {
                            games: { pgn: string }[];
                        };

                        if (data.games.length) {
                            let counter = 0;
                            for (const { pgn } of data.games) {
                                if (counter === 2) break;

                                const { parsedPgn } = await parsePgn({
                                    username,
                                    pgn,
                                });

                                console.log("DATE", parsedPgn.date);

                                if (
                                    parsedPgn.date?.getTime() >
                                    syncedAt?.getTime()
                                ) {
                                    games.push(parsedPgn);
                                    counter++;
                                }
                            }
                        }
                    }
                }

                await db.main.chessAccount.update({
                    where: {
                        id,
                    },
                    data: {
                        syncedAt: games.at(-1)?.date,
                    },
                });
            }

            if (platform === Platform.LICHESS_ORG) {
                let url = `https://lichess.org/api/games/user/${username}?max=2&sort=dateAsc`;

                if (syncedAt) {
                    url += `&since=${syncedAt.getTime() + 1000}`;
                }

                const res = await fetch(url, {
                    headers: {
                        Accept: "application/x-chess-pgn",
                    },
                });

                if (res.ok) {
                    const data = await res.text();
                    const pgns = data.trim().split(/\n{2,}(?=\[Event )/g);

                    if (pgns.length) {
                        for (const pgn of pgns) {
                            const { parsedPgn } = await parsePgn({
                                username,
                                pgn,
                            });

                            games.push(parsedPgn);
                        }

                        await db.main.chessAccount.update({
                            where: {
                                id,
                            },
                            data: {
                                syncedAt: games.at(-1)?.date,
                            },
                        });
                    }
                }
            }
        }

        console.log(games);
    }),
    openings: publicProcedure.query(async () => {
        const openings = await db.chess.opening.findMany();

        return openings;
    }),
});
