"use client";

import { keepPreviousData, useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { GamesList } from "@/components/games/gamesList";
import { Search } from "@/components/games/search";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { api, queryClient } from "@/lib/trpc";
import { useModalStore } from "@/stores/modalStore";
import { Color, GamePhase, Platform, Termination, TimeControl } from "@makora/db";
import { useEffect, useState } from "react";
import { View } from "@/components/games/view";
import { Section } from "lucide-react";
// import { GamesGrid } from "@/components/games/gamesGrid";
export default function DashboardPage() {
    const { openModal } = useModalStore();

    const [search] = useQueryState("search");
    const [platform] = useQueryState("platform");
    const [termination] = useQueryState("termination");
    const [timeControl] = useQueryState("timeControl");
    const [gamePhase] = useQueryState("gamePhase");
    const [color] = useQueryState("color");
    const [reviewed] = useQueryState("reviewed");
    // const [view] = useQueryState("view")

    const { mutateAsync, isPending } = useMutation(
        api.chess.syncGames.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: api.chess.getGames.queryKey() });
            },
        }),
    );

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
                            <Button variant="outline" label="Filter" loading={false} onClick={() => openModal("filterGame")} />
                            {/*<View />*/}
                            <Button variant="outline" label="Sync" onClick={handleSync} loading={isPending} />
                        </section>

                        {/*{view === "list" && (*/}
                          <p className="p-5 text-sm uppercase font-bold grid grid-cols-8 border-none">
                              <span className="col-span-4">Opening</span>
                              <span className="col-span-1">Phase</span>
                              <span className="col-span-1">Termination</span>
                              <span className="col-span-1">Moves</span>
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
