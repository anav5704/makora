import { db } from "@makora/db";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth<BetterAuthOptions>({
    database: prismaAdapter(db.main, {
        provider: "postgresql",
    }),
    trustedOrigins: (process.env.CORS_ORIGIN ?? "").split(",").filter(Boolean),
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
});

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;
