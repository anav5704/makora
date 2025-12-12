import { Core } from "@/components/chess/board/core"
import type { Color } from "@lichess-org/chessground/types"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

interface FullBoardProps {
  positions: string[],
  orientation: Color,
  moveIndex: number,
  setMoveIndex: Dispatch<SetStateAction<number>>,
  onChangeFen?: (fen: string) => void,
}

export const FullBoard = ({ positions, orientation, moveIndex, setMoveIndex, onChangeFen }: FullBoardProps) => {
  const fen = positions[moveIndex];

  const goStart = useCallback(() => setMoveIndex(0), [setMoveIndex]);
  const goPrev = useCallback(() => setMoveIndex((prev: number) => Math.max(0, prev - 1)), [setMoveIndex]);
  const goNext = useCallback(() => setMoveIndex((prev: number) => Math.min(positions.length - 1, prev + 1)), [setMoveIndex, positions.length]);
  const goEnd = useCallback(() => setMoveIndex(positions.length - 1), [setMoveIndex, positions.length]);

   return (
     <div className="grow grid place-content-center">
     <Core
       onChangeFen={onChangeFen}
       orientation={orientation}
       fen={fen}
     />
     <div className="w-1/2 mx-auto flex bg-zinc-800 border border-zinc-700 rounded-md mt-5">
       <button className="w-1/4 cursor-pointer p-3" type="button" onClick={goStart} title="Go to start">
           <ChevronsLeft className="mx-auto" size={24} />
       </button>
       <button className="w-1/4 cursor-pointer p-3" type="button" onClick={goPrev}  title="Previous">
         <ChevronLeft className="mx-auto" size={24} />
       </button>
       <button className="w-1/4 cursor-pointer p-3" type="button" onClick={goNext} title="Next">
         <ChevronRight className="mx-auto" size={24} />
       </button>
       <button className="w-1/4 cursor-pointer p-3" type="button" onClick={goEnd} title="Go to end">
         <ChevronsRight className="mx-auto" size={24} />
        </button>
     </div>
     </div>
   )
}
