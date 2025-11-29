import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as MainClient } from "../main/generated/client";
import { PrismaClient as ChessClient } from "../chess/generated/client"

const main: MainClient = new MainClient({
    adapter:new PrismaPg({
        connectionString: process.env.MAKORA_DATABASE_URL,
    }) ,
});

const chess: ChessClient = new ChessClient({
    adapter: new PrismaPg({
      connectionString: process.env.CHESS_DATABASE_URL,
}),
});

export const db = {
    main,
    chess,
};

export * from "../main/generated/client";
