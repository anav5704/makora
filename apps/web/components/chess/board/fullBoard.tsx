import type { Color } from "@lichess-org/chessground/types";
import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";
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

    const handleWheel = useCallback(
        (e: React.WheelEvent<HTMLDivElement>) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                setMoveIndex((prev) => Math.min(prev + 1, positions.length - 1));
            } else if (e.deltaY < 0) {
                setMoveIndex((prev) => Math.max(prev - 1, 0));
            }
        },
        [positions.length, setMoveIndex],
    );

    return (
        <div className="grow h-full grid place-content-center">
            <Core size={700} onChangeFen={onChangeFen} orientation={orientation} fen={fen} onWheel={handleWheel} />
        </div>
    );
};
