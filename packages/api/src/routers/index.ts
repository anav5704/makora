import { router } from "../index";
import { chessRouter } from "./chess";
import { userRouter } from "./user";

export const appRouter = router({
    user: userRouter,
    chess: chessRouter,
});

export type AppRouter = typeof appRouter;
