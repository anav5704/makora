"use client"

import { Metrics } from "@/components/insights/metrics";
import { Loader } from "@/components/loader";
import { api } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export default function InsightsPage() {
  const { data: metrics, isLoading } = useQuery(api.insights.getMetrics.queryOptions())

    return (
      <main className="h-full divide-y divide-zinc-800">
        {isLoading ? (
          <Loader />
        ) : (
          <>

        <Metrics
        totalLosses={metrics?.totalLosses || 0}
        reviewedLosses={metrics?.reviewedLosses || 0}
        averageMoves={metrics?.averageMoves || 0}
        averageAccuracy={metrics?.averageAccuracy || 0}
        />

        <section>

        </section>
          </>
        )}

      </main>
    );
}
