import { Hono } from "hono";
import { logger } from "hono/logger";
import { classify, loadOpenings } from "./openings";

const openings = await loadOpenings();
console.log(`[openings] loaded ${openings.size} positions`);

const app = new Hono();

app.use(logger());

app.get("/health", (c) => {
    return c.json({ ok: true, positions: openings.size });
});

app.post("/classify", async (c) => {
    const body = (await c.req.json().catch(() => null)) as { pgn?: unknown } | null;

    if (!body || typeof body.pgn !== "string") {
        return c.json({ error: "Expected JSON body { pgn: string }" }, 400);
    }

    try {
        return c.json(classify(openings, body.pgn));
    } catch {
        return c.json({ error: "Unparseable PGN" }, 422);
    }
});

export { app };
