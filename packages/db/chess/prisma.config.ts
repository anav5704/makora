import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({
    path: "../../../apps/web/.env",
});

const url = process.env.CHESS_DATABASE_URL;

export default defineConfig({
    schema: path.join("schema"),
    migrations: {
        seed: "pnpx tsx seed.ts",
    },
    ...(url ? { datasource: { url } } : {}),
});
