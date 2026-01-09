"use client";

import type { Color } from "@lichess-org/chessground/types";
import { useQuery } from "@tanstack/react-query";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { FullBoard } from "@/components/chess/board/fullBoard";
import { Sidebar } from "@/components/chess/board/sidebar";
import { Loader } from "@/components/loader";
import { api } from "@/lib/trpc";
import { useQueryState } from "nuqs";

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: { game, positions } = {}, isLoading } = useQuery(
        api.chess.getGame.queryOptions({
            id,
        }),
    );

    const [move, setMove] = useQueryState("move");
   const [moveIndex, setMoveIndex] = useState<number>(0);
    const positionsRef = useRef<string[]>(positions || []);

    useEffect(() => {
        if (move !== null) {
          const parsed = parseInt(move, 10);
            if (!Number.isNaN(parsed)) {
                setMoveIndex(parsed);
            } else {
                setMoveIndex(0);
            }
        } else {
            setMoveIndex(0);
        }
        positionsRef.current = positions || [];
    }, [positions, move]);

    const gotoMove = useCallback(
        (index: number) => {
            setMoveIndex(index);
            setMove(String(index));
        },
        [setMove],
    );

    function handleChangeFen(newFen: string) {
        if (!positionsRef.current) return;
        const idx = positionsRef.current.indexOf(newFen);
        if (idx >= 0) gotoMove(idx);
    }

    return (
        <main className="flex h-full">
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <FullBoard
                        positions={positions || []}
                        orientation={(game?.color?.toLowerCase() || "white") as Color}
                        moveIndex={moveIndex}
                        setMoveIndex={setMoveIndex}
                        onChangeFen={handleChangeFen}
                    />
                    <Sidebar
                        // @ts-expect-error
                        game={game}
                        positions={positions || []}
                        moves={game?.moves || []}
                        moveIndex={moveIndex}
                        setMoveIndex={setMoveIndex}
                        onNavigate={gotoMove}
                    />
                </>
            )}
        </main>
    );
}
