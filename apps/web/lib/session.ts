import { auth } from "@makora/auth";
import { headers } from "next/headers";
import { cache } from "react";

export const getSession = cache(async () => {
    return await auth.api.getSession({
        headers: await headers(),
    });
});
