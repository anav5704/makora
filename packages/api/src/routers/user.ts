import { db, Platform } from "@makora/db";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const userRouter = router({
    onboard: protectedProcedure
        .input(
            z.object({
                platform: z.enum([Platform.CHESS_COM, Platform.LICHESS_ORG]),
                username: z.string().min(2),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id;

            await db.main.chessAccount.create({
                data: {
                    platform: input.platform,
                    username: input.username,
                    userId,
                },
            });

            await db.main.user.update({
                data: {
                    boarded: true,
                },
                where: {
                    id: userId,
                },
            });
        }),
  getAccounts: protectedProcedure
    .query(async ({ ctx }) => {
      const accounts = await db.main.chessAccount.findMany({
          where: {
              userId: ctx.session.user.id
          },
          include: {
              _count: {
                  select: {
                      games: true
                  }
              }
          }
      })

      return accounts
    }),
  addAccount: protectedProcedure
    .input(
      z.object({
        platform: z.enum([Platform.CHESS_COM, Platform.LICHESS_ORG]),
        username: z.string().min(2),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      await db.main.chessAccount.create({
        data: {
          platform: input.platform,
          username: input.username,
          userId,
        },
      });
    }),
});
