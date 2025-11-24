import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const db: PrismaClient = new PrismaClient({ adapter });

export * from "../prisma/generated/client";

export { db };
