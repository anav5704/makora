"use client";

import type { Game } from "@makora/db";
import type { Dispatch, SetStateAction } from "react";
import { Controls } from "@/components/chess/board/controls";
import { History } from "@/components/chess/board/history";
import { Details } from "@/components/chess/board/sidebar/details";

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
  return (
      <>
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
      </>

    );
};
