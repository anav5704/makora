import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
})

const db: PrismaClient = new PrismaClient({ adapter });

export * from "../prisma/generated/client";

export { db };
