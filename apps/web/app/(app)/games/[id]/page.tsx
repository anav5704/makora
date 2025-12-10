"use client"

import { Board } from "@/components/chess/board";
import { History } from "@/components/chess/history";
import { Title } from "@/components/ui/title";
import { api } from "@/lib/trpc";
import { Color } from "@lichess-org/chessground/types";
import { useQuery } from "@tanstack/react-query";
import { use, useState } from "react";

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: game } = useQuery(api.chess.getGame.queryOptions({
     id
  }))

  const [fen, setFen] = useState("pppppppp/pppppppp/8/8/8/8/RBRBRBRB/QQQQQQQQ w KQkq - 0 1")

  const handleMove = () => {
      // compute new fen and setFen("")
  }

    return (
      <main className="flex">
      <header>
        <Title title="Analysis" />
      </header>
      <section className="grow">
        <Board
          fen={fen}
          orientation={game?.color.toLowerCase() as Color}
          onMove={handleMove}
          boardImage="board.png"
          onChangeFen={(newFen) => setFen(newFen)}
        />
      </section>
      <History moves={game?.moves || []} />
      </main>
    )
}
