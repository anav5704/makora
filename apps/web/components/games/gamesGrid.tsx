"use client";

import type { Game, Platform } from "@makora/db";
import Link from "next/link";
import { MiniBoard } from "@/components/chess/board/miniBoard";
import { Color } from "@lichess-org/chessground/types";

interface GamesGridProps {
    games: (Game & { account: { platform: Platform } })[];
}

export const GamesGrid = ({ games }: GamesGridProps) => {

    return (
        <section className="grid grid-cols-4 divide-x divide-y divide-zinc-700">
            {games?.map(
                ({
                    id,
                    reviewed,
                    timeControl,
                    opening,
                    moves,
                    account: { platform },
                    gamePhase,
                    termination,
                    moveCount,
                    color,
                    date,
                }) => {
                    return (
                        <Link className="p-5" key={id} href={{ pathname: `/games/${id}` }}>
                          <MiniBoard moves={moves} orientation={color.toLowerCase() as Color} />
                        </Link>
                    );
                },
            )}
        </section>
    );
};
