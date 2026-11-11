"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, queryClient } from "@/lib/trpc";

// A hand-written shape, not the inferred router output. Next's production
// typecheck treats that inferred output as infinitely deep once it is mapped.
export interface TrackedJob {
    id: string;
    type: string;
    progress: number;
    payload: unknown;
}

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

    const jobs = useMemo(() => (activeJobs ?? []) as unknown as TrackedJob[], [activeJobs]);

    const previousIdsRef = useRef<Set<string> | null>(null);
    const [settled, setSettled] = useState<SettledJobs>({ ids: [], nonce: 0 });

    useEffect(() => {
        const currentIds = new Set(jobs.map((job) => job.id));
        const previousIds = previousIdsRef.current;
        previousIdsRef.current = currentIds;

        if (previousIds === null) return;

        const idsChanged =
            previousIds.size !== currentIds.size ||
            [...currentIds].some((id) => !previousIds.has(id)) ||
            [...previousIds].some((id) => !currentIds.has(id));

        if (!idsChanged) return;

        queryClient.invalidateQueries({ queryKey: api.chess.getFailedJobs.pathKey() });

        if (previousIds.size === 0) return;

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
