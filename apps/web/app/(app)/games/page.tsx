"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { GamesTable } from "@/components/chess/gamesTable";
import { Search } from "@/components/games/search";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { api, queryClient } from "@/lib/trpc";

export default function DashboardPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("search") ?? undefined;

    const { mutateAsync, isPending } = useMutation(
        api.chess.syncGames.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: api.chess.getGames.queryKey() });
            },
        }),
    );

    const { data: games, isLoading } = useQuery(
        api.chess.getGames.queryOptions({
            search: query,
        }),
    );

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
