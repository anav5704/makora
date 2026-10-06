import { Color, db, GamePhase, Platform, Termination, TimeControl } from "@makora/db";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

const dashboardInput = z.object({
    range: z.enum(["week", "month", "3months", "6months", "year", "all"]).default("week"),
    platform: z.enum(Platform).optional(),
    color: z.enum(Color).optional(),
    timeControl: z.enum(TimeControl).optional(),
    termination: z.enum(Termination).optional(),
    gamePhase: z.enum(GamePhase).optional(),
    reviewed: z.boolean().optional(),
});

type DashboardInput = z.infer<typeof dashboardInput>;

const RANGE_MS: Record<Exclude<DashboardInput["range"], "all">, number> = {
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    "3months": 90 * 24 * 60 * 60 * 1000,
    "6months": 180 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
};

const BLUNDER_WINDROP = 20;

// Opening: moves 1-10, middlegame: 11-30, endgame: 31+.
const phaseOfPly = (ply: number): 0 | 1 | 2 => {
    if (ply <= 20) return 0;
    if (ply <= 60) return 1;
    return 2;
};

const buildWhere = (userId: string, from: Date | undefined, to: Date | undefined, input: DashboardInput) => ({
    account: {
        userId,
        ...(input.platform && { platform: input.platform }),
    },
    ...(input.color && { color: input.color }),
    ...(input.timeControl && { timeControl: input.timeControl }),
    ...(input.termination && { termination: input.termination }),
    ...(input.gamePhase && { gamePhase: input.gamePhase }),
    ...(input.reviewed !== undefined && { reviewed: input.reviewed }),
    ...((from || to) && {
        date: {
            ...(from && { gte: from }),
            ...(to && { lt: to }),
        },
    }),
});

interface Bucket {
    key: string;
    start: Date;
}

const buildBuckets = (from: Date, to: Date, range: DashboardInput["range"]): Bucket[] => {
    const stepMs =
        range === "week" || range === "month"
            ? 24 * 60 * 60 * 1000
            : range === "3months" || range === "6months"
              ? 7 * 24 * 60 * 60 * 1000
              : 30 * 24 * 60 * 60 * 1000;

    const buckets: Bucket[] = [];
    const cursor = new Date(from);

    while (cursor < to) {
        const key =
            stepMs >= 30 * 24 * 60 * 60 * 1000
                ? cursor.toISOString().slice(0, 7)
                : cursor.toISOString().split("T")[0] as string;
        buckets.push({ key, start: new Date(cursor) });
        cursor.setTime(cursor.getTime() + stepMs);
    }

    return buckets;
};

export const insightsRouter = router({
    getDashboard: protectedProcedure.input(dashboardInput).query(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        const now = new Date();

        const empty = {
            metrics: {
                totalLosses: 0,
                avgAccuracy: null as number | null,
                avgMoves: 0,
                blundersPerGame: null as number | null,
                worstCollapse: null as { gameId: string; winDrop: number } | null,
                blundersByPhase: null as number[] | null,
                accuracyByPhase: null as number[] | null,
            },
            overTime: [] as { date: string; losses: number; accuracy: number }[],
            openings: [] as { name: string; value: number }[],
            distributions: {
                timeControl: [] as { name: string; value: number }[],
                gamePhase: [] as { name: string; value: number }[],
                termination: [] as { name: string; value: number }[],
                dayOfWeek: [] as { name: string; value: number }[],
                color: [] as { name: string; value: number }[],
                platform: [] as { name: string; value: number }[],
            },
        };

        let from: Date | undefined;

        if (input.range === "all") {
            const earliest = await db.main.game.aggregate({
                where: buildWhere(userId, undefined, undefined, input),
                _min: { date: true },
            });

            if (!earliest._min.date) return empty;
            from = earliest._min.date;
        } else {
            from = new Date(now.getTime() - RANGE_MS[input.range]);
        }

        const where = buildWhere(userId, from, now, input);

        const [count, moves, accuracy, evaluations] = await Promise.all([
            db.main.game.aggregate({ where, _count: true }),
            db.main.game.aggregate({ where, _avg: { moveCount: true } }),
            db.main.evaluation.aggregate({ where: { game: where }, _avg: { accuracy: true } }),
            db.main.evaluation.findMany({
                where: { game: where },
                select: { gameId: true, results: true, game: { select: { color: true } } },
            }),
        ]);

        let blunders = 0;
        let worstCollapse: { gameId: string; winDrop: number } | null = null;

        const phaseBlunders = [0, 0, 0];
        const phaseAccuracySums = [0, 0, 0];
        const phaseAccuracyCounts = [0, 0, 0];

        for (const evaluation of evaluations) {
            const results = evaluation.results as Array<{ winDrop?: unknown; accuracy?: unknown }>;

            if (!Array.isArray(results)) continue;

            const color = evaluation.game.color;

            results.forEach((result, index) => {
                // White moves on even plies, black on odd.
                const mover = index % 2 === 0 ? "WHITE" : "BLACK";
                if (mover !== color) return;

                const phase = phaseOfPly(index + 1);

                if (typeof result.accuracy === "number") {
                    phaseAccuracySums[phase] += Math.min(result.accuracy, 100);
                    phaseAccuracyCounts[phase] += 1;
                }

                if (typeof result.winDrop !== "number") return;

                if (result.winDrop >= BLUNDER_WINDROP) {
                    blunders += 1;
                    phaseBlunders[phase] += 1;

                    if (!worstCollapse || result.winDrop > worstCollapse.winDrop) {
                        worstCollapse = { gameId: evaluation.gameId, winDrop: Number(result.winDrop.toFixed(2)) };
                    }
                }
            });
        }

        const average = (sums: number[], counts: number[]): number[] =>
            sums.map((sum, index) =>
                counts[index] > 0 ? Number((sum / (counts[index] as number)).toFixed(2)) : 0,
            );

        const rate = (counts: number[], games: number): number[] =>
            counts.map((count) => (games > 0 ? Number((count / games).toFixed(2)) : 0));

        const games = await db.main.game.findMany({
            where,
            select: {
                date: true,
                timeControl: true,
                gamePhase: true,
                termination: true,
                color: true,
                account: { select: { platform: true } },
                evaluation: { select: { accuracy: true } },
            },
            orderBy: { date: "asc" },
        });

        const buckets = buildBuckets(from as Date, now, input.range);
        const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]));
        const losses = new Array<number>(buckets.length).fill(0);
        const accuracySums = new Array<number>(buckets.length).fill(0);
        const accuracyCounts = new Array<number>(buckets.length).fill(0);

        const stepIsMonthly = input.range === "year" || input.range === "all";

        for (const game of games) {
            if (!game.date) continue;

            const key = stepIsMonthly
                ? game.date.toISOString().slice(0, 7)
                : (game.date.toISOString().split("T")[0] as string);
            const index = bucketIndex.get(key);

            if (index === undefined) continue;

            losses[index] += 1;

            if (game.evaluation) {
                accuracySums[index] += game.evaluation.accuracy;
                accuracyCounts[index] += 1;
            }
        }

        const overTime = buckets.map((bucket, index) => ({
            date: bucket.key,
            losses: losses[index] as number,
            accuracy:
                accuracyCounts[index] > 0
                    ? Number(((accuracySums[index] as number) / (accuracyCounts[index] as number)).toFixed(2))
                    : 0,
        }));

        const openingGroups = await db.main.game.groupBy({
            by: ["opening"],
            where,
            _count: { _all: true },
            orderBy: { _count: { opening: "desc" } },
            take: 5,
        });

        const aggregate = (items: string[]) => {
            const counts = new Map<string, number>();
            items.forEach((item) => {
                counts.set(item, (counts.get(item) || 0) + 1);
            });
            return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
        };

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

        return {
            metrics: {
                totalLosses: count._count,
                avgAccuracy: evaluations.length > 0 ? Number((accuracy._avg.accuracy ?? 0).toFixed(2)) : null,
                avgMoves: Math.round(moves._avg.moveCount ?? 0),
                blundersPerGame:
                    evaluations.length > 0 ? Number((blunders / evaluations.length).toFixed(2)) : null,
                worstCollapse,
                blundersByPhase:
                    evaluations.length > 0 ? rate(phaseBlunders, evaluations.length) : null,
                accuracyByPhase:
                    evaluations.length > 0 ? average(phaseAccuracySums, phaseAccuracyCounts) : null,
            },
            overTime,
            openings: openingGroups.map((group) => ({ name: group.opening, value: group._count._all })),
            distributions: {
                timeControl: aggregate(games.map((game) => game.timeControl)),
                gamePhase: aggregate(games.map((game) => game.gamePhase)),
                termination: aggregate(games.map((game) => game.termination)),
                dayOfWeek: aggregate(
                    games.map((game) => {
                        if (!game.date) return "Unknown";
                        return dayNames[new Date(game.date).getDay()] as string;
                    }),
                ),
                color: aggregate(games.map((game) => game.color)),
                platform: aggregate(games.map((game) => game.account.platform)),
            },
        };
    }),
});
