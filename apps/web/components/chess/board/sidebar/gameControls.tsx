"use client";

import type { Evaluation, Game } from "@makora/db";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { Controls } from "@/components/chess/board/controls";
import { History } from "@/components/chess/board/history";
import { Details } from "@/components/chess/board/sidebar/details";
import { Button } from "@/components/ui/button";
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
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation(
    api.chess.analyzeGame.mutationOptions({
             onSuccess: ({ jobId }) => {
                if (!jobId) {
                    queryClient.invalidateQueries({ queryKey: api.chess.getGames.queryKey() });
                    queryClient.invalidateQueries({ queryKey: api.chess.getGame.queryKey() });
                    return;
                }
                setAnalysisJobId(jobId);
            },
      })
  )

  const { data: analysisJob } = useQuery(
    api.chess.getJobStatus.queryOptions(
        { jobId: analysisJobId ?? "" },
        {
            enabled: !!analysisJobId,
            refetchInterval: (query) => {
                const job = query.state.data;
                if (!job) return 2000;
                return job.status === "COMPLETED" || job.status === "FAILED" ? false : 2000;
            },
        },
    )
  )

  useEffect(() => {
    if (!analysisJob) return;

    if (analysisJob.status === "COMPLETED" || analysisJob.status === "FAILED") {
        queryClient.invalidateQueries({ queryKey: api.chess.getGames.queryKey() });
        queryClient.invalidateQueries({ queryKey: api.chess.getGame.queryKey() });
        setAnalysisJobId(null);
    }
  }, [analysisJob]);

  return (
      <>
          <Details game={game} />

          <Controls positions={positions} moveIndex={moveIndex} setMoveIndex={setMoveIndex} />

          {game.evaluation ? (
              <p className="p-5 text-center">Accuracy: {game.evaluation.accuracy}%</p>
            ) : analysisJobId ? (
                <p className="p-5 text-center">
                    {analysisJob?.status === "QUEUED" ? "Queued..." : `Analyzing... ${analysisJob?.progress ?? 0}%`}
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
