import { db, Platform } from "@makora/db";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const userRouter = router({
    onboard: protectedProcedure
        .input(
            z.object({
                platform: z.enum([Platform.CHESS_COM, Platform.LICHESS_ORG]),
                username: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            await db.chessAccount.create({
                data: {
                    platform: input.platform,
                    username: input.username,
                    userId: ctx.session.user.id,
                },
            });
        }),
});
