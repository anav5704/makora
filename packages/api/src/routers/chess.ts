import { db } from "@makora/db";
import { publicProcedure, router } from "../index";

export const chessRouter = router({
    opeings: publicProcedure.query(async () => {
        const openings = await db.chess.opening.findMany();

        return openings;
    }),
});
