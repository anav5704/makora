"use client"

import { FullBoard } from "@/components/chess/board/fullBoard";
import { History } from "@/components/chess/board/history";
import { Title } from "@/components/ui/title";
import { api } from "@/lib/trpc";
import type { Color } from "@lichess-org/chessground/types";
import { useQuery } from "@tanstack/react-query";
import { use, useState, useEffect, useRef } from "react";

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const {  data: { game, positions } = {}} = useQuery(api.chess.getGame.queryOptions({
     id
  }))

  // lift the current move index to the page so other components (History) can adjust it
  const [moveIndex, setMoveIndex] = useState<number>(0);
  const positionsRef = useRef<string[]>(positions || []);

  // reset move index when positions change (e.g., loading a new game) and update ref
  useEffect(() => {
    setMoveIndex(0);
    positionsRef.current = positions || [];
  }, [positions]);

  // keep the index in sync when the board's FEN changes (e.g., piece movement)
  function handleChangeFen(newFen: string) {
    if (!positionsRef.current) return;
    const idx = positionsRef.current.indexOf(newFen);
    if (idx >= 0) setMoveIndex(idx);
  }

    return (
      <main>
      <header>
        <Title title="Analysis" />
      </header>
      <section className="flex">
        <FullBoard
          positions={positions || []}
          orientation={game?.color.toLowerCase() as Color}
          moveIndex={moveIndex}
          setMoveIndex={setMoveIndex}
          onChangeFen={handleChangeFen}
        />
        <History
          moves={game?.moves || []}
          moveIndex={moveIndex}
          setMoveIndex={setMoveIndex}
        />
      </section>
      </main>
    )
}
