"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { GamesTable } from "@/components/chess/gamesTable";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/title";
import { api } from "@/lib/trpc";

export default function DashboardPage() {
    const { mutateAsync, isPending: isMutating } = useMutation(api.chess.sync.mutationOptions());

    const handleSync = async () => mutateAsync();

    return (
        <main>
            <header className="sticky top-0 bg-zinc-900 border-b border-zinc-800">
                <Title title="Games" />

                <section className="p-5 border-b border-zinc-800">
                    <Button label="Sync" onClick={handleSync} loading={isMutating} />
                </section>

                <p className="p-5 text-sm uppercase font-bold grid grid-cols-8 border-none">
                    <span className="col-span-4">Opening</span>
                    <span className="col-span-1">Phase</span>
                    <span className="col-span-1">Termination</span>
                    <span className="col-span-1">Moves</span>
                    <span className="col-span-1">Played</span>
                </p>
            </header>
            <GamesTable />
        </main>
    );
}
