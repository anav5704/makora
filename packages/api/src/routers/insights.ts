import { db } from "@makora/db";
import { protectedProcedure, router } from "../index";

export const insightsRouter = router({
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
        const games = await db.main.game.findMany({
            where: {
                account: {
                    userId: ctx.session.user.id,
                },
            },
            include: {
                evaluation: true,
            },
        });

        const totalLosses = games.length;

        const reviewedLosses = games.filter((game) => game.reviewed).length;

        const totalMoves = games.reduce((sum, game) => sum + game.moveCount, 0);
        const averageMoves = games.length > 0 ? Number((totalMoves / games.length).toFixed(0)) : 0;

        const gamesWithEvaluation = games.filter((game) => game.evaluation !== null);
        const totalAccuracy = gamesWithEvaluation.reduce((sum, game) => sum + (game.evaluation?.accuracy || 0), 0);
        const averageAccuracy =
            gamesWithEvaluation.length > 0 ? Number((totalAccuracy / gamesWithEvaluation.length).toFixed(2)) : 0;

        return { totalLosses, reviewedLosses, averageMoves, averageAccuracy };
    }),
    getOverTime: protectedProcedure.query(async ({ ctx }) => {
        const games = await db.main.game.findMany({
            where: {
                account: {
                    userId: ctx.session.user.id,
                },
            },
            include: {
                evaluation: true,
            },
            orderBy: {
                date: "asc",
            },
        });

        // Group games by week
        const gamesByWeek = new Map<string, typeof games>();

        games.forEach((game) => {
            const date = new Date(game.date);
            // Get the start of the week (Sunday)
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            weekStart.setHours(0, 0, 0, 0);

            const weekKey = weekStart.toISOString().split("T")[0] as string;

            if (!gamesByWeek.has(weekKey)) {
                gamesByWeek.set(weekKey, []);
            }
            const weekGames = gamesByWeek.get(weekKey);
            if (weekGames) {
                weekGames.push(game);
            }
        });

        // Calculate cumulative losses and average accuracy per week
        let cumulativeLosses = 0;
        const data = Array.from(gamesByWeek.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([weekKey, weekGames]) => {
                cumulativeLosses += weekGames.length;

                const gamesWithEvaluation = weekGames.filter((game) => game.evaluation !== null);
                const totalAccuracy = gamesWithEvaluation.reduce(
                    (sum, game) => sum + (game.evaluation?.accuracy || 0),
                    0,
                );
                const averageAccuracy =
                    gamesWithEvaluation.length > 0
                        ? Number((totalAccuracy / gamesWithEvaluation.length).toFixed(2))
                        : 0;

                return {
                    date: weekKey,
                    losses: cumulativeLosses,
                    accuracy: averageAccuracy,
                };
            });

        return data;
    }),
    getComparison: protectedProcedure.query(async ({ ctx }) => {
        const games = await db.main.game.findMany({
            where: {
                account: {
                    userId: ctx.session.user.id,
                },
            },
            select: {
                opening: true,
            },
        });

        // Aggregate losses by opening
        const openingCounts = new Map<string, number>();

        games.forEach((game) => {
            const opening = game.opening;
            openingCounts.set(opening, (openingCounts.get(opening) || 0) + 1);
        });

        // Sort by count and get top 5
        const topOpenings = Array.from(openingCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({
                name,
                value,
            }));

        return topOpenings;
    }),
    getDistribution: protectedProcedure.query(async ({ ctx }) => {
        const games = await db.main.game.findMany({
            where: {
                account: {
                    userId: ctx.session.user.id,
                },
            },
            select: {
                timeControl: true,
                gamePhase: true,
                termination: true,
                date: true,
                color: true,
                account: {
                    select: {
                        platform: true,
                    },
                },
            },
        });

        // Helper function to aggregate counts
        const aggregate = (items: string[]) => {
            const counts = new Map<string, number>();
            items.forEach((item) => {
                counts.set(item, (counts.get(item) || 0) + 1);
            });
            return Array.from(counts.entries()).map(([name, value]) => ({
                name,
                value,
            }));
        };

        // Day of week names
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

        // Aggregate each distribution
        const timeControl = aggregate(games.map((g) => g.timeControl));
        const gamePhase = aggregate(games.map((g) => g.gamePhase));
        const termination = aggregate(games.map((g) => g.termination));
        const dayOfWeek = aggregate(games.map((g) => dayNames[new Date(g.date).getDay()] as string));
        const color = aggregate(games.map((g) => g.color));
        const platform = aggregate(games.map((g) => g.account.platform));

        return {
            timeControl,
            gamePhase,
            termination,
            dayOfWeek,
            color,
            platform,
        };
    }),
});
