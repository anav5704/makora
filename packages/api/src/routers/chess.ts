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
                const res = await fetch(
                    `https://api.chess.com/pub/player/${username}/games/2025/11`,
                );

                if (res.ok) {
                    const data = await res.json();

                    for (const { pgn } of data.games) {
                        const { parsedPgn } = await parsePgn({ username, pgn });
                        games.push(parsedPgn);
                    }
                }
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

                    if (pgns.length > 0) {
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
