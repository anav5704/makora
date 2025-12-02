import { db, Platform } from "@makora/db";
import { type ParsedPgn, parsePgn } from "../../lib/chess";
import { publicProcedure, router } from "../index";

export const chessRouter = router({
    sync: publicProcedure.query(async ({ ctx }) => {
        const accounts = await db.main.chessAccount.findMany({
            where: {
                userId: ctx.session?.user.id,
            },
            select: {
                platform: true,
                username: true,
            },
        });

        const games: ParsedPgn[] = [];

        for (const { username, platform } of accounts) {
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
                const res = await fetch(
                    `https://lichess.org/api/games/user/${username}?max=3&moves=true`,
                    {
                        headers: {
                            Accept: "application/x-chess-pgn",
                        },
                    },
                );

                if (res.ok) {
                    const data = await res.text();
                    const pgns = data.trim().split(/\n{2,}(?=\[Event )/g);

                    for (const pgn of pgns) {
                        const { parsedPgn } = await parsePgn({ username, pgn });
                        games.push(parsedPgn);
                    }
                }
            }
        }

        return games;
    }),
    openings: publicProcedure.query(async () => {
        const openings = await db.chess.opening.findMany();

        return openings;
    }),
});
