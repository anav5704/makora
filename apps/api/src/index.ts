import { app } from "./app";

const port = Number(process.env.API_PORT ?? 4000);

console.log(`[api] listening on :${port}`);

export default {
    port,
    fetch: app.fetch,
};
