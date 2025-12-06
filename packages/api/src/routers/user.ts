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
            const now = new Date();
            // set syncedAt to start of previous month
            const syncedAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0));

            await db.main.chessAccount.create({
                data: {
                    platform: input.platform,
                    username: input.username,
                    syncedAt,
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
});
