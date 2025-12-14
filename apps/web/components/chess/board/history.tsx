import type { Dispatch, SetStateAction } from "react";

interface HistoryProps {
  moves: string[]
  moveIndex: number
  setMoveIndex?: Dispatch<SetStateAction<number>>
  onNavigate?: (index: number) => void
}

export const History = ({ moves, moveIndex, setMoveIndex, onNavigate }: HistoryProps) => {
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
    <nav className="grow overflow-scroll p-5 w-72">
      <div className="flex flex-col gap-5">
        {pairs.map(({ moveNumber, white, whiteIndex, black, blackIndex }) => {
          const whiteSelected = moveIndex === whiteIndex + 1;
          const blackSelected = moveIndex === blackIndex + 1;
          return (
            <div key={`move-${moveNumber}`} className="grid grid-cols-5">
              <div className="text-left text-zinc-500">{moveNumber}.</div>
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate(whiteIndex + 1);
                  else setMoveIndex?.(whiteIndex + 1);
                }}
                className={`text-left ${whiteSelected ? "text-white" : "hover:text-white text-zinc-400"} cursor-pointer col-span-2`}
              >
                {white}
              </button>
              {typeof black !== "undefined" ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) onNavigate(blackIndex + 1);
                    else setMoveIndex?.(blackIndex + 1);
                  }}
                  className={`text-left ${blackSelected ? "text-white" : "hover:text-white text-zinc-400"} cursor-pointer col-span-2`}
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
