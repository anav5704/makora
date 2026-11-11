"use client";

import Link from "next/link";
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

export const SyncFailures = ({ jobs, retrying, onRetry }: SyncFailuresProps) => {
    if (jobs.length === 0) return null;

    return (
        <div className="border-b border-zinc-800">
            {jobs.map((job) => {
                const username = job.username ?? "Account";
                const unrecoverable = isUnrecoverableJobError(job.error);
                const detail = unrecoverable ? "username not found" : (job.error ?? "Sync failed");

                return (
                    <div key={job.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
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
