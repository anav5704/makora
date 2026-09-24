"use client";

import type { Color, GamePhase, Platform, Termination, TimeControl } from "@makora/db";
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { GamesList } from "@/components/games/gamesList";
import { Search } from "@/components/games/search";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
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

    const [syncJobIds, setSyncJobIds] = useState<string[] | null>(null);

    const { mutateAsync, isPending } = useMutation(
        api.chess.syncGames.mutationOptions({
            onSuccess: ({ jobIds }) => {
                if (jobIds.length === 0) {
                    queryClient.invalidateQueries({ queryKey: api.chess.getGames.queryKey() });
                    return;
                }
                setSyncJobIds(jobIds);
            },
        }),
    );

    const { data: syncJobs } = useQuery(
        api.chess.getJobsStatus.queryOptions(
            { jobIds: syncJobIds ?? [] },
            {
                enabled: !!syncJobIds && syncJobIds.length > 0,
                refetchInterval: (query) => {
                    const jobs = query.state.data ?? [];
                    if (jobs.length === 0) return 2000;
                    const done = jobs.every((job) => job.status === "COMPLETED" || job.status === "FAILED");
                    return done ? false : 2000;
                },
            },
        ),
    );

    useEffect(() => {
        if (!syncJobIds || syncJobIds.length === 0 || !syncJobs || syncJobs.length === 0) return;

        const done = syncJobs.every((job) => job.status === "COMPLETED" || job.status === "FAILED");

        if (done) {
            queryClient.invalidateQueries({ queryKey: api.chess.getGames.queryKey() });
            setSyncJobIds(null);
        }
    }, [syncJobs, syncJobIds]);

    const syncedCount = (syncJobs ?? []).filter(
        (job) => job.status === "COMPLETED" || job.status === "FAILED",
    ).length;
    const syncTotal = syncJobIds?.length ?? 0;
    const isSyncing = syncJobIds !== null;

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery(
        api.chess.getGames.infiniteQueryOptions({
            search: search || undefined,
            platform: platform as Platform || undefined,
            termination: termination as Termination || undefined,
            timeControl: timeControl as TimeControl || undefined,
            gamePhase: gamePhase as GamePhase || undefined,
            color: color as Color || undefined,
            reviewed: reviewed === "true" ? true : reviewed === "false" ? false : undefined,
        },
        {
          getNextPageParam: (lastPage) => lastPage.cursor,
          placeholderData: keepPreviousData,
        }
      )
    );

    const games = data?.pages.flatMap((page) => page.games) ?? []

    const handleSync = async () => mutateAsync();

    return (
        <main>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <header className="z-10 sticky top-0 bg-zinc-900 border-b border-zinc-800">
                        <section className="grid grid-cols-5 gap-5 p-5 border-b border-zinc-800">
                            <Search />
                            <Button className="border" variant="outline" label="Filter" loading={false} onClick={() => openModal("filterGame")} />
                            {/*<View />*/}
                            <Button className="border" variant="outline" label={isSyncing ? `Syncing ${syncedCount}/${syncTotal}` : "Sync"} onClick={handleSync} loading={isPending || isSyncing} />
                        </section>

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

                    {hasNextPage && (
                    <section className="w-1/5 mx-auto m-7.5">
                        <Button
                            variant="outline"
                            className="border"
                            label="Load More"
                            onClick={() => fetchNextPage()}
                            loading={isFetchingNextPage}
                        />
                    </section>
                    )}
                </>
            )}
        </main>
    );
}
