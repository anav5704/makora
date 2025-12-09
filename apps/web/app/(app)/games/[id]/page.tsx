"use client"

import { History } from "@/components/chess/history";
import { Title } from "@/components/ui/title";
import { api } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { use, useId } from "react";
import Chessboard2 from "@chrisoakman/chessboard2"

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: game } = useQuery(api.chess.getGame.queryOptions({
     id
  }))

  const boardId = useId()
  Chessboard2(boardId, 'start')

    return (
      <main className="flex">
      <header>
        <Title title="Analysis" />
      </header>
      <section className="grow">
        <div id={boardId}></div>
      </section>
      <History moves={game?.moves || []} />
      </main>
    )

}
