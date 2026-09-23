// TODO: implement database transactions
import { Color, db, GamePhase, JobStatus, Platform, Termination, TimeControl } from "@makora/db";
import { getAnalysisQueue, getSyncQueue, type SyncAccountJob } from "@makora/queue";
import { Chess } from "chess.js";
import { z } from "zod";
import { PAGE_SIZE } from "../../const";
import { protectedProcedure, router } from "../index";
import { failStaleJobs } from "../jobs/stale-jobs";

export const chessRouter = router({
    syncGames: protectedProcedure.mutation(async ({ ctx }) => {
        const userId = ctx.session.user.id;

        await failStaleJobs(userId);

        const accounts = await db.main.chessAccount.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                platform: true,
                username: true,
                syncedAt: true,
            },
        });

        const jobIds: string[] = [];

        for (const account of accounts) {
            const inFlight = await db.main.job.findFirst({
                where: {
                    userId,
                    type: "SYNC_ACCOUNT",
                    status: { in: [JobStatus.QUEUED, JobStatus.ACTIVE] },
                    payload: { path: ["account", "id"], equals: account.id },
                },
                select: { id: true },
            });

            if (inFlight) {
                jobIds.push(inFlight.id);
                continue;
            }

            const input: SyncAccountJob = {
                userId,
                account: {
                    id: account.id,
                    platform: account.platform,
                    username: account.username,
                    syncedAt: account.syncedAt?.toISOString() ?? null,
                },
            };

            const job = await db.main.job.create({
                data: {
                    type: "SYNC_ACCOUNT",
                    userId,
                    payload: input,
                },
            });

            await getSyncQueue().add("sync-account", input, { jobId: job.id });

            jobIds.push(job.id);
        }

        return { jobIds };
    }),
    getGame: protectedProcedure
        .input(
            z.object({
                id: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const game = await db.main.game.findUnique({
                where: {
                    id: input.id,
              },
              include: {
                evaluation: true
              }
            });

            if (!game) return;

            const chess = new Chess();
            const positions: string[] = [chess.fen()];

            for (const move of game.moves) {
                chess.move(move);
                positions.push(chess.fen());
            }

            return { game, positions };
        }),
    getGames: protectedProcedure
        .input(
            z.object({
                cursor: z.string().optional(),
                search: z.string().optional(),
                platform: z.enum(Platform).optional(),
                termination: z.enum(Termination).optional(),
                timeControl: z.enum(TimeControl).optional(),
                gamePhase: z.enum(GamePhase).optional(),
                color: z.enum(Color).optional(),
                reviewed: z.boolean().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { cursor, search, platform, termination, timeControl, gamePhase, color, reviewed } = input;

            const games = await db.main.game.findMany({
                where: {
                    account: {
                        userId: ctx.session.user.id,
                        ...(platform && { platform }),
                    },
                    ...(termination && { termination }),
                    ...(timeControl && { timeControl }),
                    ...(gamePhase && { gamePhase }),
                    ...(color && { color }),
                    ...(reviewed !== undefined && { reviewed }),
                    ...(search && {
                        AND: search.split(" ").map((subSearch) => ({
                            OR: [
                                {
                                    opening: {
                                        contains: subSearch,
                                        mode: "insensitive" as const,
                                    },
                                },
                                {
                                    opponent: {
                                        contains: subSearch,
                                        mode: "insensitive" as const,
                                    },
                                },
                            ],
                        })),
                    }),
                },
                include: {
                  evaluation: {
                    select: {
                      accuracy: true
                    }
                  },
                    account: {
                        select: {
                            platform: true,
                        },
                    },
                },
                take: PAGE_SIZE,
                ...(cursor && { skip: 1 }),
                ...(cursor && { cursor: {
                    id: cursor
                }}),
                orderBy: [
                    { date: "desc" },
                    { id: "desc" },
                ],
            });

            return {
              games,
              cursor: games.length === PAGE_SIZE ? games.at(-1)?.id : undefined
            };
        }),
  analyzeGame: protectedProcedure
    .input(
      z.object({
        gameId: z.string()
      })
    )
    .mutation(async ({ ctx, input: { gameId } }) => {
      const evaluation = await db.main.evaluation.findUnique({
        where: {
          gameId
        }
      })

      if (evaluation) return { jobId: null }

      const userId = ctx.session.user.id;

      await failStaleJobs(userId);

      const inFlight = await db.main.job.findFirst({
        where: {
          userId,
          type: "ANALYZE_GAME",
          status: { in: [JobStatus.QUEUED, JobStatus.ACTIVE] },
          payload: { path: ["gameId"], equals: gameId },
        },
        select: { id: true },
      });

      if (inFlight) return { jobId: inFlight.id };

      const job = await db.main.job.create({
        data: {
          type: "ANALYZE_GAME",
          userId,
          payload: { gameId },
        }
      })

      await getAnalysisQueue().add("analyze-game", { gameId }, { jobId: job.id })

      return { jobId: job.id }
    }),
    getJobStatus: protectedProcedure
    .input(
      z.object({
        jobId: z.string()
      })
    )
    .query(async ({ ctx, input }) => {
      return db.main.job.findFirst({
        where: {
          id: input.jobId,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
          type: true,
          status: true,
          progress: true,
          error: true,
          updatedAt: true,
        }
      })
    }),
    getJobsStatus: protectedProcedure
    .input(
      z.object({
        jobIds: z.array(z.string()).min(1).max(50)
      })
    )
    .query(async ({ ctx, input }) => {
      return db.main.job.findMany({
        where: {
          id: { in: input.jobIds },
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
          type: true,
          status: true,
          progress: true,
          error: true,
          updatedAt: true,
        }
      })
    }),
    updateNotes: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        notes: z.string()
      })
    )
    .mutation(async ({ input }) => {
      await db.main.game.update({
        where: {
          id: input.gameId,
        },
        data: {
          notes: input.notes
        }
        })
    })
});
