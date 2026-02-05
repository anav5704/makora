import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@makora/api/routers/index";
import { auth } from "@makora/auth";

const app = new Hono().basePath("/api");

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

app.on(["GET", "POST"], "/auth/*", (c) => {
    return auth.handler(c.req.raw);
});

const handler = (req: Request) => app.fetch(req);

export { handler as GET, handler as POST };
