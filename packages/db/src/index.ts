import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as PostgreClient } from "../postgres/generated/client";
import { PrismaClient as SqliteClient } from "../sqlite/generated/client";

const postgresAdapter = new PrismaPg({
    connectionString: process.env.POSTGRES_DATABASE_URL,
});

const postgresDb: PostgreClient = new PostgreClient({
  adapter: postgresAdapter,
});

const sqliteAdapter = new PrismaBetterSqlite3({
    url: process.env.SQLITE_DATABASE_URL,
});

const sqliteDb: SqliteClient = new SqliteClient({
    adapter: sqliteAdapter,
});

export const db = {
    postgres: postgresDb,
    sqlite: sqliteDb,
};

export * from "../postgres/generated/client";
