import { Core } from "@/components/chess/board/core"
import type { Color } from "@lichess-org/chessground/types"
import { useCallback, useState } from "react";

interface FullBoardProps {
positions: string[],
orientation: Color
}

export const FullBoard = ({ positions, orientation }: FullBoardProps) => {
  const [moveIndex, setMoveIndex] = useState(0)
  const fen = positions[moveIndex];

  const goStart = useCallback(() => setMoveIndex(0), []);
  const goPrev = useCallback(() => setMoveIndex((prev) => prev - 1), []);
  const goNext = useCallback(() => setMoveIndex((prev) => prev + 1), []);
  const goEnd = useCallback(() => setMoveIndex(positions.length - 1), [positions.length]);

  const handleChangeFen = useCallback((newFen: string) => {
    const idx = positions.indexOf(newFen);
    if (idx >= 0) setMoveIndex(idx);
  }, [positions]);

   return (
     <div>
     <Core
     onChangeFen={handleChangeFen}
     orientation={orientation}
     fen={fen}
     />
     <div className="flex gap-2 items-center">
       <button type="button" onClick={goStart} title="Go to start">⏮</button>
       <button type="button" onClick={goPrev}  title="Previous">◀</button>
       <span className="text-xs px-2">{moveIndex}/{positions.length}</span>
       <button type="button" onClick={goNext} title="Next">▶</button>
       <button type="button" onClick={goEnd} title="Go to end">⏭</button>
     </div>
     </div>
   )
}
