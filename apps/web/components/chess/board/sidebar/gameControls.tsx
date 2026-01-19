"use client";

import type { Game } from "@makora/db";
import type { Dispatch, SetStateAction } from "react";
import { Controls } from "@/components/chess/board/controls";
import { History } from "@/components/chess/board/history";
import { Details } from "@/components/chess/board/sidebar/details";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

interface GameControlsProps {
    game: Game;
    positions?: string[];
    moves?: string[];
    moveIndex?: number;
    setMoveIndex?: Dispatch<SetStateAction<number>>;
    onNavigate?: (index: number) => void;
}

export const GameControls = ({
    game,
    positions = [],
    moves = [],
    moveIndex = 0,
    setMoveIndex,
    onNavigate,
}: GameControlsProps) => {
  const { mutateAsync, isPending } = useMutation(api.chess.analyzeGame.mutationOptions())

  return (
      <>
          <Details game={game} />

          <Controls positions={positions} moveIndex={moveIndex} setMoveIndex={setMoveIndex} />

          <Button
              label="Computer Analysis"
              onClick={async () => mutateAsync({ gameId: game.id })}
              className="rounded-none p-5!"
              loading={isPending}
              variant="outline"
        />

        <History
              moves={moves}
              moveIndex={moveIndex}
              onNavigate={(i) => {
                  if (onNavigate) onNavigate(i);
                  else setMoveIndex?.(i);
              }}
          />
      </>
    );
};
