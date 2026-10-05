import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@makora/api/routers/index";
import { auth } from "@makora/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());

app.use(
    cors({
        origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(","),
        allowHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
        allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        exposeHeaders: ["Set-Cookie"],
        credentials: true,
    })
);

app.get("/health", (c) => {
    return c.json({ ok: true });
});

app.use(
    "/trpc/*",
    trpcServer({
        router: appRouter,
        createContext: async (_opts, c) => {
            const session = await auth.api.getSession({
                headers: c.req.raw.headers,
            });
            return { session };
        },
    })
);

app.all("/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
});

export { app };
