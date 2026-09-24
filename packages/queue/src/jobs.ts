import { z } from "zod";

const platformSchema = z.enum(["CHESS_COM", "LICHESS_ORG"]);

export const syncAccountJobSchema = z.object({
    userId: z.string().min(1),
    account: z.object({
        id: z.string().min(1),
        platform: platformSchema,
        username: z.string().min(1),
        syncedAt: z.iso.datetime().nullable(),
    }),
});

export const analyzeGameJobSchema = z.object({
    gameId: z.string().min(1),
});

export type SyncAccountJob = z.infer<typeof syncAccountJobSchema>;
export type AnalyzeGameJob = z.infer<typeof analyzeGameJobSchema>;
