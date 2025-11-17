import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({
    path: "../../apps/web/.env",
});

export default defineConfig({
    schema: path.join("prisma", "schema"),
});
