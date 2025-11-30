"use client";

import { useQuery } from "@tanstack/react-query";
import { Title } from "@/components/ui/title";
import { api } from "@/lib/trpc";

export default function DashboardPage() {
    const { data: openings } = useQuery(api.chess.opeings.queryOptions());

    return (
        <main>
            <Title title="Dashboard" />
            <ul>
                {openings?.map((opening) => (
                    <li className="mb-5" key={opening.id}>
                        {opening.eco + opening.name + opening.pgn}
                    </li>
                ))}
            </ul>
        </main>
    );
}
