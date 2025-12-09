// TODO: add platform column
// TODO: add loading state
"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { api } from "@/lib/trpc";
import { getTimeControl } from "@/utils/getTimeControl";

export const GamesTable = () => {
    const { data: games } = useQuery(api.chess.getGames.queryOptions());
    const relativeDate = (date: Date) => formatDistanceToNow(new Date(date), { addSuffix: true }).replace("about", "");
    const normalize = (str: string) =>
        str
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");

    return (
        <section>
            {games?.map(({ id, timeControl, opening, gamePhase, termination, moveCount, date }) => {
                // @ts-expect-error
                const { icon: Icon, title } = getTimeControl(timeControl);

                return (
                    <Link key={id} href={{ pathname: `/games/${id}` }}>
                        <p className="grid grid-cols-8 p-5 border-b border-zinc-800">
                            <span className="col-span-4">
                                <span title={title} className="flex items-center gap-5">
                                    <Icon size={24} />
                                    <span className="truncate">{opening}</span>
                                </span>
                            </span>
                            <span className="col-span-1">{normalize(gamePhase)}</span>
                            <span className="col-span-1">{normalize(termination)}</span>
                            <span className="col-span-1">{moveCount}</span>
                            <span className="col-span-1">{relativeDate(new Date(date))}</span>
                        </p>
                    </Link>
                );
            })}
        </section>
    );
};
