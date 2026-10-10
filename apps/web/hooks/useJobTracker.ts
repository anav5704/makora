"use client";

import type { AppRouter } from "@makora/api/routers/index";
import { useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/trpc";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type TrackedJob = RouterOutputs["chess"]["getActiveJobs"][number];

const ACTIVE_POLL_INTERVAL_MS = 2000;
const IDLE_POLL_INTERVAL_MS = 5000;

export interface SettledJobs {
    ids: string[];
    nonce: number;
}

export function useJobTracker() {
    const { data: activeJobs } = useQuery(
        api.chess.getActiveJobs.queryOptions(undefined, {
            refetchInterval: (query) =>
                (query.state.data?.length ?? 0) > 0 ? ACTIVE_POLL_INTERVAL_MS : IDLE_POLL_INTERVAL_MS,
        }),
    );

    const jobs = useMemo(() => activeJobs ?? [], [activeJobs]);

    const previousIdsRef = useRef<Set<string> | null>(null);
    const [settled, setSettled] = useState<SettledJobs>({ ids: [], nonce: 0 });

    useEffect(() => {
        const currentIds = new Set(jobs.map((job) => job.id));
        const previousIds = previousIdsRef.current;
        previousIdsRef.current = currentIds;

        if (previousIds === null || previousIds.size === 0) return;

        const settledIds = [...previousIds].filter((id) => !currentIds.has(id));
        if (settledIds.length === 0) return;

        setSettled((previous) => ({ ids: settledIds, nonce: previous.nonce + 1 }));
    }, [jobs]);

    const progressOf = useCallback(
        (match: (job: TrackedJob) => boolean): number | null => {
            const matching = jobs.filter(match);

            if (matching.length === 0) return null;

            const total = matching.reduce((sum, job) => sum + job.progress, 0);
            return Math.round(total / matching.length);
        },
        [jobs],
    );

    return { jobs, settled, isTracking: jobs.length > 0, progressOf };
}
