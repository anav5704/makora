import type { Dispatch, SetStateAction } from "react";

interface HistoryProps {
  moves: string[]
  moveIndex: number
  setMoveIndex: Dispatch<SetStateAction<number>>
}

export const History = ({ moves, moveIndex, setMoveIndex }: HistoryProps) => {
  // Group moves into white/black pairs
  const pairs: {
    moveNumber: number;
    white: string | undefined;
    whiteIndex: number;
    black: string | undefined;
    blackIndex: number;
  }[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteIndex: i,
      black: moves[i + 1],
      blackIndex: i + 1,
    });
  }

  return (
    <nav className="h-[calc(60vh)] overflow-scroll p-5 w-72">
      <div className="flex flex-col gap-1">
        {pairs.map(({ moveNumber, white, whiteIndex, black, blackIndex }) => {
          const whiteSelected = moveIndex === whiteIndex + 1;
          const blackSelected = moveIndex === blackIndex + 1;
          return (
            <div key={`move-${moveNumber}`} className="grid grid-cols-2 gap-2 items-center py-1">
              <button
                type="button"
                onClick={() => setMoveIndex(whiteIndex + 1)}
                className={`py-2 px-3 rounded-md text-left ${whiteSelected ? "bg-zinc-800" : "hover:bg-zinc-800 cursor-pointer"}`}
              >
                {white}
              </button>
              {typeof black !== "undefined" ? (
                <button
                  type="button"
                  onClick={() => setMoveIndex(blackIndex + 1)}
                  className={`py-2 px-3 rounded-md text-left ${blackSelected ? "bg-zinc-800" : "hover:bg-zinc-800 cursor-pointer"}`}
                >
                  {black}
                </button>
              ) : (
                <div />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  )
}
