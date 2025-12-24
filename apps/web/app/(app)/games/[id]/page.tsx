"use client"

import { FullBoard } from "@/components/chess/board/fullBoard";
import { Sidebar } from "@/components/chess/board/sidebar";
import { api } from "@/lib/trpc";
import type { Color } from "@lichess-org/chessground/types";
import { useQuery } from "@tanstack/react-query";
import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader } from "@/components/loader";

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const {  data: { game, positions } = {}, isLoading } = useQuery(api.chess.getGame.queryOptions({
     id
  }))

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // lift the current move index to the page so other components (History) can adjust it
  const [moveIndex, setMoveIndex] = useState<number>(0);
  const positionsRef = useRef<string[]>(positions || []);

  // initialize or reset move index when positions or URL search params change
  useEffect(() => {
    const mp = searchParams.get("move");
    if (mp !== null) {
      const parsed = parseInt(mp, 10);
      if (!Number.isNaN(parsed)) {
        setMoveIndex(parsed);
      } else {
        setMoveIndex(0);
      }
    } else {
      setMoveIndex(0);
    }
    positionsRef.current = positions || [];
  }, [positions, searchParams]);

  const gotoMove = useCallback((index: number) => {
    setMoveIndex(index);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("move", String(index));
    router.push(`${pathname}?${params.toString()}` as any);
  }, [router, pathname, searchParams]);

  // keep the index in sync when the board's FEN changes (e.g., piece movement)
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
    )
}
