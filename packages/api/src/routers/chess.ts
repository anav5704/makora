import { db, Platform } from "@makora/db";
import { publicProcedure, router } from "../index";
import { parsePgn, type ParsedPgn } from "../../lib/chess";

export const chessRouter = router({
  sync: publicProcedure.query(async ({ ctx }) => {
        const accounts = await db.main.chessAccount.findMany({
          where: {
            userId: ctx.session?.user.id
          },
          select: {
            platform: true,
            username: true
          }
        })

        let games: ParsedPgn[] = []

        for (const { username, platform } of accounts) {
          if(platform === Platform.CHESS_COM) {
            // fetch games from chess.com api
          }

          if(platform === Platform.LICHESS_ORG) {
            const res = await fetch(`https://lichess.org/api/games/user/${username}?max=3&moves=true`, {
              headers: {
                Accept: 'application/x-chess-pgn',
              }
            })

            if(res.ok) {
              const data = await res.text()
              console.log(data)
              const pgns = data.trim().split(/\n{2,}(?=\[Event )/g)

              for(const pgn of pgns) {
                const { parsedPgn } = await parsePgn({ username, pgn })
                games.push(parsedPgn)
              }
            }
          }
        }

        return games
  }),
    openings: publicProcedure.query(async () => {
        const openings = await db.chess.opening.findMany();

        return openings;
    }),
});
