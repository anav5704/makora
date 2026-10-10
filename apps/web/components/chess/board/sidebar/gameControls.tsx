"use client";

import type { Evaluation, Game } from "@makora/db";
import { useMutation } from "@tanstack/react-query";
import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";
import { Controls } from "@/components/chess/board/controls";
import { History } from "@/components/chess/board/history";
import { Details } from "@/components/chess/board/sidebar/details";
import { Button } from "@/components/ui/button";
import { useJobTracker } from "@/hooks/useJobTracker";
import { api, queryClient } from "@/lib/trpc";

interface GameControlsProps {
    game: Game & { evaluation: Evaluation };
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
  const { progressOf, settled } = useJobTracker();

  const analysisProgress = progressOf(
    (job) => job.type === "ANALYZE_GAME" && (job.payload as { gameId?: string } | null)?.gameId === game.id,
  );
  const isAnalyzing = analysisProgress !== null;

  const settledNonceRef = useRef(0);

  useEffect(() => {
    if (settled.nonce === settledNonceRef.current) return;
    settledNonceRef.current = settled.nonce;
    queryClient.invalidateQueries({ queryKey: api.chess.getGames.pathKey(), refetchType: "all" });
    queryClient.invalidateQueries({ queryKey: api.chess.getGame.pathKey(), refetchType: "all" });
  }, [settled]);

  const { mutateAsync, isPending } = useMutation(
    api.chess.analyzeGame.mutationOptions({
             onSuccess: ({ jobId }) => {
                if (jobId) {
                    queryClient.invalidateQueries({ queryKey: api.chess.getActiveJobs.pathKey() });
                    return;
                }
                queryClient.invalidateQueries({ queryKey: api.chess.getGames.pathKey(), refetchType: "all" });
                queryClient.invalidateQueries({ queryKey: api.chess.getGame.pathKey(), refetchType: "all" });
            },
      })
  )

  return (
      <>
          <Details game={game} />

          <Controls positions={positions} moveIndex={moveIndex} setMoveIndex={setMoveIndex} />

          {game.evaluation ? (
              <p className="p-5 text-center">Accuracy: {game.evaluation.accuracy}%</p>
            ) : isAnalyzing ? (
                <p className="p-5 text-center">
                    {`Analyzing... ${analysisProgress}%`}
                </p>
            ) : (
                <Button
                      label="Computer Analysis"
                      onClick={async () => mutateAsync({ gameId: game.id })}
                      className="rounded-none p-5!"
                      loading={isPending}
                      variant="outline"
                />
            )}

        <History
              moves={moves}
              moveIndex={moveIndex}
              evalution={game.evaluation}
              onNavigate={(i) => {
                  if (onNavigate) onNavigate(i);
                  else setMoveIndex?.(i);
              }}
          />
      </>
    );
};
