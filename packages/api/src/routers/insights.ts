import { db } from "@makora/db";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

const dateRangeSchema = z.object({
    range: z.enum(["week", "month", "3months", "6months", "year", "all"]).default("week"),
});

const getDateFilter = (range: string): Date | undefined => {
    const now = new Date();

    switch (range) {
        case "week":
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "month":
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case "3months":
            return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case "6months":
            return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        case "year":
            return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        case "all":
        default:
            return undefined;
    }
};

export const insightsRouter = router({
    getMetrics: protectedProcedure.input(dateRangeSchema).query(async ({ ctx, input }) => {
        const dateFilter = getDateFilter(input.range);

        const games = await db.main.game.findMany({
            where: {
                account: {
                    userId: ctx.session.user.id,
                },
                ...(dateFilter && {
                    date: {
                        gte: dateFilter,
                    },
                }),
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
    getOverTime: protectedProcedure.input(dateRangeSchema).query(async ({ ctx, input }) => {
        const dateFilter = getDateFilter(input.range);

        const games = await db.main.game.findMany({
            where: {
                account: {
                    userId: ctx.session.user.id,
                },
                ...(dateFilter && {
                    date: {
                        gte: dateFilter,
                    },
                }),
            },
            include: {
                evaluation: true,
            },
            orderBy: {
                date: "asc",
            },
        });

        // Group games by day
        const gamesByDay = new Map<string, typeof games>();

        games.forEach((game) => {
            const date = new Date(game.date);
            const dayKey = date.toISOString().split("T")[0] as string;

            if (!gamesByDay.has(dayKey)) {
                gamesByDay.set(dayKey, []);
            }
            const dayGames = gamesByDay.get(dayKey);
            if (dayGames) {
                dayGames.push(game);
            }
        });

        // Calculate losses and average accuracy per day
        const data = Array.from(gamesByDay.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dayKey, dayGames]) => {
                const gamesWithEvaluation = dayGames.filter((game) => game.evaluation !== null);
                const totalAccuracy = gamesWithEvaluation.reduce(
                    (sum, game) => sum + (game.evaluation?.accuracy || 0),
                    0,
                );
                const averageAccuracy =
                    gamesWithEvaluation.length > 0
                        ? Number((totalAccuracy / gamesWithEvaluation.length).toFixed(2))
                        : 0;

                return {
                    date: dayKey,
                    losses: dayGames.length,
                    accuracy: averageAccuracy,
                };
            });

        return data;
    }),
    getComparison: protectedProcedure.input(dateRangeSchema).query(async ({ ctx, input }) => {
        const dateFilter = getDateFilter(input.range);

        const games = await db.main.game.findMany({
            where: {
                account: {
                    userId: ctx.session.user.id,
                },
                ...(dateFilter && {
                    date: {
                        gte: dateFilter,
                    },
                }),
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
    getDistribution: protectedProcedure.input(dateRangeSchema).query(async ({ ctx, input }) => {
        const dateFilter = getDateFilter(input.range);

        const games = await db.main.game.findMany({
            where: {
                account: {
                    userId: ctx.session.user.id,
                },
                ...(dateFilter && {
                    date: {
                        gte: dateFilter,
                    },
                }),
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
