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
    }),
    getOverTime: protectedProcedure.query(async ({ ctx }) => {
        const games = await db.main.game.findMany({
          where: {
            account: {
              userId: ctx.session.user.id
            }
          },
          include: {
            evaluation: true
          },
          orderBy: {
            date: 'asc'
          }
        })

        // Group games by week
        const gamesByWeek = new Map<string, typeof games>()

        games.forEach((game) => {
          const date = new Date(game.date)
          // Get the start of the week (Sunday)
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          weekStart.setHours(0, 0, 0, 0)

          const weekKey = weekStart.toISOString().split('T')[0]

          if (!gamesByWeek.has(weekKey)) {
            gamesByWeek.set(weekKey, [])
          }
          gamesByWeek.get(weekKey)!.push(game)
        })

        // Calculate cumulative losses and average accuracy per week
        let cumulativeLosses = 0
        const data = Array.from(gamesByWeek.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([weekKey, weekGames]) => {
            cumulativeLosses += weekGames.length

            const gamesWithEvaluation = weekGames.filter((game) => game.evaluation !== null)
            const totalAccuracy = gamesWithEvaluation.reduce((sum, game) => sum + (game.evaluation?.accuracy || 0), 0)
            const averageAccuracy = gamesWithEvaluation.length > 0
              ? Number((totalAccuracy / gamesWithEvaluation.length).toFixed(2))
              : 0

            return {
              date: weekKey,
              losses: cumulativeLosses,
              accuracy: averageAccuracy
            }
          })

        return data
    })
});
