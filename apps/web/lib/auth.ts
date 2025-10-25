import type { auth } from "@makora/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
    plugins: [inferAdditionalFields<typeof auth>()],
});

export { authClient };
