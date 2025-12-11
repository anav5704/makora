"use client"

import { FullBoard } from "@/components/chess/board/fullBoard";
import { History } from "@/components/chess/board/history";
import { Title } from "@/components/ui/title";
import { api } from "@/lib/trpc";
import { Color } from "@lichess-org/chessground/types";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const {  data: { game, positions } = {}} = useQuery(api.chess.getGame.queryOptions({
     id
  }))

    return (
      <main className="flex">
      <header>
        <Title title="Analysis" />
      </header>
      <section className="grow">
        <FullBoard
          positions={positions || []}
          orientation={game?.color.toLowerCase() as Color}
        />
      </section>
      <History moves={game?.moves || []} />
      </main>
    )
}
