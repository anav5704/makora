"use client";

import type { Game } from "@makora/db";
import type { Dispatch, SetStateAction } from "react";
import { Controls } from "@/components/chess/board/controls";
import { History } from "@/components/chess/board/history";
import { Details } from "./details";

interface GameDetailsProps {
    game: Game;
    positions?: string[];
    moves?: string[];
    moveIndex?: number;
    setMoveIndex?: Dispatch<SetStateAction<number>>;
    onNavigate?: (index: number) => void;
}

export const Sidebar = ({
    game,
    positions = [],
    moves = [],
    moveIndex = 0,
    setMoveIndex,
    onNavigate,
}: GameDetailsProps) => {
    return (
        <aside className=" flex flex-col justify-end divide-y divide-zinc-800 max-h-screen overflow-scroll w-72 border-l border-zinc-800">
            <Details game={game} />

            <Controls positions={positions} moveIndex={moveIndex} setMoveIndex={setMoveIndex} />

            <History
                moves={moves}
                moveIndex={moveIndex}
                onNavigate={(i) => {
                    if (onNavigate) onNavigate(i);
                    else setMoveIndex?.(i);
                }}
            />
        </aside>
    );
};
