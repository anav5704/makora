import { app } from "./app";

const port = Number(process.env.OPENINGS_PORT ?? 4001);

console.log(`[openings] listening on :${port}`);

export default {
    port,
    fetch: app.fetch,
};
