import type { Color } from "@lichess-org/chessground/types";
import { Core } from "@/components/chess/board/core";
import { Chess } from "chess.js";

interface MiniBoardProps {
    moves: string[];
    orientation: Color;
}

export const MiniBoard = ({ moves, orientation }: MiniBoardProps) => {
  const board = new Chess()
  moves.map((move) => board.move(move))
  const fen = board.fen()

    return (
        <div className="grow h-full grid place-content-center">
          <Core size={350} onChangeFen={() => {}} orientation={orientation} fen={fen} />
        </div>
    );
};
