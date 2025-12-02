"use client";

import { useQuery } from "@tanstack/react-query";
import { Title } from "@/components/ui/title";
import { api } from "@/lib/trpc";

export default function DashboardPage() {
    const { data: games } = useQuery(api.chess.sync.queryOptions());

    return (
        <main>
            <Title title="Dashboard" />
            <ul>
                {games?.map((game, i) => (
                    <li key={i} className="block">
                        {game.opening}
                    </li>
                ))}
            </ul>
        </main>
    );
}
