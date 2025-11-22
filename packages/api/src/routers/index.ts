import { router } from "../index";
import { userRouter } from "./user";

export const appRouter = router({
    user: userRouter,
});

export type AppRouter = typeof appRouter;
