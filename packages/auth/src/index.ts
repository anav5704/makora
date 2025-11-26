import { db } from "@makora/db";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth<BetterAuthOptions>({
    database: prismaAdapter(db.postgres, {
        provider: "postgresql",
    }),
    trustedOrigins: [process.env.CORS_ORIGIN || ""],
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            boarded: {
                type: "boolean",
                defaultValue: false,
            },
        },
    },
    plugins: [nextCookies()],
});

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;
