"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { ChessCom } from "@/components/chess/icons/chess-com";
import { LichessOrg } from "@/components/chess/icons/lichess-org";
import { isUnrecoverableJobError } from "@/lib/job-error";

interface SyncFailureJob {
    id: string;
    username: string | null;
    error: string | null;
}

interface SyncFailuresProps {
    jobs: SyncFailureJob[];
    retrying: boolean;
    onRetry: () => void;
}

interface SyncProgressJob {
    id: string;
    username: string | null;
    platform: string | null;
}

export const SyncProgress = ({ jobs }: { jobs: SyncProgressJob[] }) => {
    if (jobs.length === 0) return null;

    return (
        <div>
            {jobs.map((job) => (
                <p key={job.id} className="flex items-center gap-5 border-b border-zinc-800 p-5 text-white">
                    {job.platform === "LICHESS_ORG" ? <LichessOrg /> : <ChessCom />}
                    <LoaderCircle size={24} className="animate-spin" />
                    <span className="truncate">{job.username ?? "Account"}</span>
                </p>
            ))}
        </div>
    );
};

export const SyncFailures = ({ jobs, retrying, onRetry }: SyncFailuresProps) => {
    if (jobs.length === 0) return null;

    return (
        <div>
            {jobs.map((job) => {
                const username = job.username ?? "Account";
                const unrecoverable = isUnrecoverableJobError(job.error);
                const detail = unrecoverable ? "username not found" : (job.error ?? "Sync failed");

                return (
                    <div
                        key={job.id}
                        className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-5 text-sm">
                        <p className="text-rose-400">
                            {username}: {detail}
                        </p>
                        {unrecoverable ? (
                            <Link href="/settings" className="shrink-0 underline">
                                Fix username
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className="shrink-0 cursor-pointer underline disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={retrying}
                                onClick={onRetry}>
                                Retry
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
