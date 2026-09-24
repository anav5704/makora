import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as ChessClient } from "../chess/generated/client";
import { PrismaClient as MainClient } from "../main/generated/client";

const main: MainClient = new MainClient({
    adapter: new PrismaPg({
        connectionString: process.env.MAIN_DATABASE_URL,
        max: 20,
    }),
});

const chess: ChessClient = new ChessClient({
    adapter: new PrismaPg({
        connectionString: process.env.CHESS_DATABASE_URL,
        max: 15,
    }),
});

export const db = {
    main,
    chess,
};

export * from "../main/generated/client";
