import { router } from "../index";
import { chessRouter } from "./chess";
import { userRouter } from "./user";
import { insightsRouter } from "./insights";

export const appRouter = router({
    user: userRouter,
    chess: chessRouter,
    insights: insightsRouter
});

export type AppRouter = typeof appRouter;
