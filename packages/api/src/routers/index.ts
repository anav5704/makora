import { router } from "../index";
import { chessRouter } from "./chess";
import { insightsRouter } from "./insights";
import { userRouter } from "./user";

export const appRouter = router({
    user: userRouter,
    chess: chessRouter,
    insights: insightsRouter,
});

export type AppRouter = typeof appRouter;
