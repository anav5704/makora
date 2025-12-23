"use client"

import { AreaChart } from "@/components/charts/areaChart";
import { Metrics } from "@/components/insights/metrics";
import { Loader } from "@/components/loader";
import { api } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export default function InsightsPage() {
  const { data: metrics, isLoading: metricsLoading } = useQuery(api.insights.getMetrics.queryOptions())
  const { data: overTimeData, isLoading: overTimeLoading } = useQuery(api.insights.getOverTime.queryOptions())

  const isLoading = metricsLoading || overTimeLoading

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

          <AreaChart
            title="Games Lost"
            data={overTimeData || []}
            xKey="date"
            yKey="losses"
            unit=" Losses"
          />

          <AreaChart
            title="Average Accuracy"
            data={overTimeData || []}
            xKey="date"
            yKey="accuracy"
            unit="%"
          />

          <div />
          </>
        )}

      </main>
    );
}
