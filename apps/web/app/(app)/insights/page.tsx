"use client"

import { AreaChart } from "@/components/charts/areaChart";
import { BarList } from "@/components/charts/barList";
import { DonutChart } from "@/components/charts/donutChat";
import { Metrics } from "@/components/insights/metrics";
import { Loader } from "@/components/loader";
import { api } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export default function InsightsPage() {
  const { data: metrics, isLoading: metricsLoading } = useQuery(api.insights.getMetrics.queryOptions())
  const { data: overTimeData, isLoading: overTimeLoading } = useQuery(api.insights.getOverTime.queryOptions())
  const { data: comparisonData, isLoading: comparisonLoading } = useQuery(api.insights.getComparison.queryOptions())
  const { data: distributionData, isLoading: distributionLoading } = useQuery(api.insights.getDistribution.queryOptions())

  const isLoading = metricsLoading || overTimeLoading || comparisonLoading || distributionLoading

    return (
      <main className="h-full divide-y divide-x divide-zinc-800">
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
            data={overTimeData ?? []}
            xKey="date"
            yKey="losses"
            unit=" Losses"
          />

          <AreaChart
            title="Average Accuracy"
            data={overTimeData ?? []}
            xKey="date"
            yKey="accuracy"
            unit="%"
          />

          <BarList
            title="Top Openings"
            data={comparisonData ?? []}
          />

          <section className="grid grid-cols-3 divide-x divide-y divide-zinc-800">


          <DonutChart
            title="Time Control"
            data={distributionData?.timeControl ?? []}
          />
          <DonutChart
            title="Game Phase"
            data={distributionData?.gamePhase ?? []}
          />
          <DonutChart
            title="Termination"
            data={distributionData?.termination ?? []}
          />
          <DonutChart
            title="Day of Week"
            data={distributionData?.dayOfWeek ?? []}
          />
          <DonutChart
            title="Color"
            data={distributionData?.color ?? []}
          />
          <DonutChart
            title="Platform"
            data={distributionData?.platform ?? []}
          />
                 </section>
          </>
        )}

      </main>
    );
}
