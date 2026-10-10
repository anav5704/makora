import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as ChessClient } from "../chess/generated/client";
import { PrismaClient as MainClient } from "../main/generated/client";

// Five processes construct these clients (web, api, openings, sync, analysis),
// so the pool size is per process and the total has to stay under the server's
// max_connections. A small pool is the safe direction: pg queues once exhausted
// rather than erroring, so a burst shows up as latency instead of dropped work.
const main: MainClient = new MainClient({
    adapter: new PrismaPg({
        connectionString: process.env.MAIN_DATABASE_URL,
        max: 5,
    }),
});

// chess_db holds only the read-only opening catalogue, so it needs even less.
const chess: ChessClient = new ChessClient({
    adapter: new PrismaPg({
        connectionString: process.env.CHESS_DATABASE_URL,
        max: 3,
    }),
});

export const db = {
    main,
    chess,
};

export * from "../main/generated/client";
