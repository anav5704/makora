import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as PostgreClient } from "../postgres/generated/client";
import { PrismaClient as LibSqlClient } from "../libsql/generated/client";

const postgres: PostgreClient = new PostgreClient({
    adapter:new PrismaPg({
        connectionString: process.env.DATABASE_URL,
    }) ,
});

const libsql: LibSqlClient = new LibSqlClient({
    adapter: new PrismaLibSql({
    url: "file:../libsql/openings.db",
}),
});

export const db = {
    postgres,
    libsql,
};

export * from "../postgres/generated/client";
