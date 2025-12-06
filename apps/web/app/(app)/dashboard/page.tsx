"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Title } from "@/components/ui/title";
import { api } from "@/lib/trpc";

export default function DashboardPage() {
    const { mutateAsync, isPending } = useMutation(api.chess.sync.mutationOptions());
    const handleSync = async () => mutateAsync();

    return (
        <main>
            <Title title="Dashboard" />
            <Button label="Sync" onClick={handleSync} loading={isPending} />
            {/*<ul>
                {games?.map((game, i) => (
                    <li key={i} className="block">
                        {game.opening}
                    </li>
                ))}
            </ul>*/}
        </main>
    );
}
