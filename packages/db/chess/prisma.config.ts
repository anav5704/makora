import path from "node:path";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

dotenv.config({
    path: "../../../apps/web/.env",
});

export default defineConfig({
    schema: path.join("schema"),
    migrations: {
        seed: "pnpx tsx seed.ts",
    },
    datasource: {
      url: env("CHESS_DATABASE_URL"),
    },
});
