import { Evaluation } from "@makora/db";
import type { Dispatch, SetStateAction } from "react";

interface HistoryProps {
    moves: string[];
    moveIndex: number;
    setMoveIndex?: Dispatch<SetStateAction<number>>;
    onNavigate?: (index: number) => void;
    evalution?: Evaluation
}

export const History = ({ moves, moveIndex, setMoveIndex, onNavigate, evalution }: HistoryProps) => {
    const getAnnotation = (winDrop: number): string => {
        if (winDrop >= 20) return "??";
        if (winDrop >= 10) return "?";
        if (winDrop >= 5) return "?!";
        return "";
    };

    const getAnnotationColor = (annotation: string): string => {
        if (annotation === "??") return "text-red-400";
        if (annotation === "?") return "text-orange-400";
        if (annotation === "?!") return "text-yellow-400";
        return "";
    };

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
        <div className="grow overflow-scroll flex flex-col">
            {pairs.map(({ moveNumber, white, whiteIndex, black, blackIndex }) => {
                const whiteSelected = moveIndex === whiteIndex + 1;
                const blackSelected = moveIndex === blackIndex + 1;
                const whiteWinDrop = evalution?.results ? (evalution.results as any[])[whiteIndex]?.winDrop : undefined;
                const blackWinDrop = evalution?.results ? (evalution.results as any[])[blackIndex]?.winDrop : undefined;
                const whiteEval = evalution?.results ? (evalution.results as any[])[whiteIndex]?.postMoveEval : undefined;
                const blackEval = evalution?.results ? (evalution.results as any[])[blackIndex]?.postMoveEval : undefined;

                return (
                    <div key={`move-${moveNumber}`} className="grid grid-cols-[auto_1fr_1fr]">
                        <div className="text-left text-zinc-400 p-3">{moveNumber}.</div>
                        <button
                            type="button"
                            onClick={() => {
                                if (onNavigate) onNavigate(whiteIndex + 1);
                                else setMoveIndex?.(whiteIndex + 1);
                            }}
                            className={`p-3 ${whiteSelected && "text-white bg-zinc-800"} text-white cursor-pointer transition duration-100`}>
                            <div className="flex justify-between">
                                <span className={whiteWinDrop ? getAnnotationColor(getAnnotation(whiteWinDrop)) : ""}>{white}{whiteWinDrop ? getAnnotation(whiteWinDrop) : ""}</span>
                                <span>{whiteEval}</span>
                            </div>
                        </button>
                        {typeof black !== "undefined" ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (onNavigate) onNavigate(blackIndex + 1);
                                    else setMoveIndex?.(blackIndex + 1);
                                }}
                                className={`p-3 ${blackSelected && "text-white bg-zinc-800"} text-white cursor-pointer transition duration-100`}>
                                <div className="flex justify-between">
                                    <span className={blackWinDrop ? getAnnotationColor(getAnnotation(blackWinDrop)) : ""}>{black}{blackWinDrop ? getAnnotation(blackWinDrop) : ""}</span>
                                    <span>{blackEval}</span>
                                </div>
                            </button>
                        ) : (
                            <div />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
