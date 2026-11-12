"use client";

import type { Color, GamePhase, Platform, Termination, TimeControl } from "@makora/db";
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useRef } from "react";
import { GamesList } from "@/components/games/gamesList";
import { Search } from "@/components/games/search";
import { SyncFailures, SyncProgress } from "@/components/jobs/sync-failures";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useJobTracker } from "@/hooks/useJobTracker";
import { api, queryClient } from "@/lib/trpc";
import { useModalStore } from "@/stores/modalStore";
// import { View } from "@/components/games/view";
// import { GamesGrid } from "@/components/games/gamesGrid";
export default function GamesPage() {
    const { openModal } = useModalStore();

    const [search] = useQueryState("search");
    const [platform] = useQueryState("platform");
    const [termination] = useQueryState("termination");
    const [timeControl] = useQueryState("timeControl");
    const [gamePhase] = useQueryState("gamePhase");
    const [color] = useQueryState("color");
    const [reviewed] = useQueryState("reviewed");
    // const [view] = useQueryState("view")

    const { jobs, settled } = useJobTracker();
    const { data: failedJobs } = useQuery(api.chess.getFailedJobs.queryOptions());

    const syncJobs = jobs.filter((job) => job.type === "SYNC_ACCOUNT");
    const isSyncing = syncJobs.length > 0;
    const syncFailures = (failedJobs ?? []).filter((job) => job.type === "SYNC_ACCOUNT");

    const settledNonceRef = useRef(0);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (settled.nonce === settledNonceRef.current) return;
        settledNonceRef.current = settled.nonce;
        queryClient.invalidateQueries({ queryKey: api.chess.getGames.pathKey(), refetchType: "all" });
    }, [settled]);

    const { mutateAsync, isPending } = useMutation(
        api.chess.syncGames.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: api.chess.getActiveJobs.pathKey() });
                queryClient.invalidateQueries({ queryKey: api.chess.getFailedJobs.pathKey() });
            },
        }),
    );

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
        api.chess.getGames.infiniteQueryOptions(
            {
                search: search || undefined,
                platform: (platform as Platform) || undefined,
                termination: (termination as Termination) || undefined,
                timeControl: (timeControl as TimeControl) || undefined,
                gamePhase: (gamePhase as GamePhase) || undefined,
                color: (color as Color) || undefined,
                reviewed: reviewed === "true" ? true : reviewed === "false" ? false : undefined,
            },
            {
                getNextPageParam: (lastPage) => lastPage.cursor,
                placeholderData: keepPreviousData,
            },
        ),
    );

    const pages = (data as unknown as { pages: Array<{ games: unknown[] }> } | undefined)?.pages ?? [];
    const games = pages.flatMap((page) => page.games);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || !hasNextPage) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting && !isFetchingNextPage) {
                void fetchNextPage();
            }
        });

        observer.observe(node);
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const handleSync = async () => {
        try {
            await mutateAsync();
        } catch {
            return;
        }
    };

    return (
        <main>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <header className="z-10 sticky top-0 bg-zinc-900 border-b border-zinc-800">
                        <section className="grid grid-cols-5 gap-5 p-5 border-b border-zinc-800">
                            <Search />
                            <Button
                                className="border"
                                variant="outline"
                                label="Filter"
                                loading={false}
                                onClick={() => openModal("filterGame")}
                            />
                            {/*<View />*/}
                            <Button
                                className="border"
                                variant="outline"
                                label="Sync"
                                onClick={handleSync}
                                loading={isPending}
                                tracking={isSyncing}
                            />
                        </section>

                        <SyncProgress jobs={syncJobs} />
                        <SyncFailures
                            jobs={syncFailures}
                            retrying={isPending || isSyncing}
                            onRetry={() => void handleSync()}
                        />

                        {/*{view === "list" && (*/}
                        <p className="p-5 text-sm uppercase font-bold grid grid-cols-8 border-none">
                            <span className="col-span-4">Opening</span>
                            <span className="col-span-1">Accuracy</span>
                            <span className="col-span-1">Phase</span>
                            <span className="col-span-1">Termination</span>
                            <span className="col-span-1">Played</span>
                        </p>
                        {/*)}*/}
                    </header>

                    {/*{view === "list" ? (
                      // @ts-expect-error
                        <GamesList games={games} />
                    ) : (
                      // @ts-expect-error
                      <GamesGrid games={games} />
                    )}*/}

                    {/*@ts-expect-error*/}
                    <GamesList games={games} />

                    {hasNextPage ? <div ref={sentinelRef} className="h-px" /> : null}
                    {isFetchingNextPage ? (
                        <div className="grid place-content-center py-5">
                            <LoaderCircle size={24} className="animate-spin" />
                        </div>
                    ) : null}
                </>
            )}
        </main>
    );
}
