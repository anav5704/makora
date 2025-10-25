import { createContext } from "@makora/api/context";
import { appRouter } from "@makora/api/routers/index";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

function handler(req: NextRequest) {
    return fetchRequestHandler({
        req,
        router: appRouter,
        endpoint: "/api/trpc",
        createContext: () => createContext(req),
    });
}
export { handler as GET, handler as POST };
