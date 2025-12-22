import { db } from "@makora/db";
import { protectedProcedure, router } from "../index";

export const insightsRouter = router({
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
        const games = await db.main.game.findMany({
          where: {
            account: {
              userId: ctx.session.user.id
            }
          },
          include: {
            evaluation: true
          }
        })

        const totalLosses = games.length

        const reviewedLosses = games.filter((game) => game.reviewed).length

        const totalMoves = games.reduce((sum, game) => sum + game.moveCount, 0)
        const averageMoves = games.length > 0
          ? Number((totalMoves / games.length).toFixed(0))
          : 0

        const gamesWithEvaluation = games.filter((game) => game.evaluation !== null)
        const totalAccuracy = gamesWithEvaluation.reduce((sum, game) => sum + (game.evaluation?.accuracy || 0), 0)
        const averageAccuracy = gamesWithEvaluation.length > 0
          ? Number((totalAccuracy / gamesWithEvaluation.length).toFixed(2))
          : 0

        return { totalLosses, reviewedLosses, averageMoves, averageAccuracy }
    })
});
