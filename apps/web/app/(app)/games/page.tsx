"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { GamesTable } from "@/components/chess/gamesTable";
import { Search } from "@/components/games/search";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { api, queryClient } from "@/lib/trpc";
import { useModalStore } from "@/stores/modalStore";
import { Color, GamePhase, Platform, Termination, TimeControl } from "@makora/db";
export default function DashboardPage() {
    const { openModal } = useModalStore();

    const [search] = useQueryState("search");
    const [platform] = useQueryState("platform");
    const [termination] = useQueryState("termination");
    const [timeControl] = useQueryState("timeControl");
    const [gamePhase] = useQueryState("gamePhase");
    const [color] = useQueryState("color");
    const [reviewed] = useQueryState("reviewed");

    const { mutateAsync, isPending } = useMutation(
        api.chess.syncGames.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: api.chess.getGames.queryKey() });
            },
        }),
    );

    const { data: games, isLoading } = useQuery({
        ...api.chess.getGames.queryOptions({
            search: search || undefined,
            platform: platform as Platform || undefined,
            termination: termination as Termination || undefined,
            timeControl: timeControl as TimeControl || undefined,
            gamePhase: gamePhase as GamePhase || undefined,
            color: color as Color || undefined,
            reviewed: reviewed === "true" ? true : reviewed === "false" ? false : undefined,
        }),
        placeholderData: keepPreviousData,
    });

    const handleSync = async () => mutateAsync();

    return (
        <main>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <header className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
                        <section className="grid grid-cols-4 gap-5 p-5 border-b border-zinc-800">
                            <Search />
                            <Button label="Filter" loading={false} onClick={() => openModal("filterGame")} />
                            <Button label="Sync" onClick={handleSync} loading={isPending} />
                        </section>

                        <p className="p-5 text-sm uppercase font-bold grid grid-cols-8 border-none">
                            <span className="col-span-4">Opening</span>
                            <span className="col-span-1">Phase</span>
                            <span className="col-span-1">Termination</span>
                            <span className="col-span-1">Moves</span>
                            <span className="col-span-1">Played</span>
                        </p>
                    </header>

                    {/*@ts-expect-error*/}
                    <GamesTable games={games || []} />
                </>
            )}
        </main>
    );
}
