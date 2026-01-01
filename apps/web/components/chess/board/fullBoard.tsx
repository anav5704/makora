import type { Color } from "@lichess-org/chessground/types";
import type { Dispatch, SetStateAction } from "react";
import { Core } from "@/components/chess/board/core";

interface FullBoardProps {
    positions: string[];
    orientation: Color;
    moveIndex: number;
    setMoveIndex: Dispatch<SetStateAction<number>>;
    onChangeFen?: (fen: string) => void;
}

export const FullBoard = ({ positions, orientation, moveIndex, setMoveIndex, onChangeFen }: FullBoardProps) => {
    const fen = positions[moveIndex];

    return (
        <div className="grow h-full grid place-content-center">
            <Core onChangeFen={onChangeFen} orientation={orientation} fen={fen} />
        </div>
    );
};
