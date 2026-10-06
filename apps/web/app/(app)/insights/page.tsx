"use client";

import type { Color, GamePhase, Platform, Termination, TimeControl } from "@makora/db";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { AreaChart } from "@/components/charts/areaChart";
import { BarList } from "@/components/charts/barList";
import { DonutChart } from "@/components/charts/donutChat";
import { DateRange, type DateRangeValue } from "@/components/insights/dateRange";
import { Metrics } from "@/components/insights/metrics";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc";
import { useModalStore } from "@/stores/modalStore";

export default function InsightsPage() {
    const { openModal } = useModalStore();

    const [range] = useQueryState("range", {
        defaultValue: "week",
    });
    const [platform] = useQueryState("platform");
    const [color] = useQueryState("color");
    const [timeControl] = useQueryState("timeControl");
    const [termination] = useQueryState("termination");
    const [gamePhase] = useQueryState("gamePhase");
    const [reviewed] = useQueryState("reviewed");

    const { data: dashboard, isLoading } = useQuery(
        api.insights.getDashboard.queryOptions({
            range: range as DateRangeValue,
            platform: (platform as Platform) || undefined,
            color: (color as Color) || undefined,
            timeControl: (timeControl as TimeControl) || undefined,
            termination: (termination as Termination) || undefined,
            gamePhase: (gamePhase as GamePhase) || undefined,
            reviewed: reviewed === "true" ? true : reviewed === "false" ? false : undefined,
        }),
    );

    const metrics = dashboard?.metrics;
    const distributions = dashboard?.distributions;

    return (
        <main className="divide-y divide-zinc-800">
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <header className="z-10 sticky top-0 bg-zinc-900 border-b border-zinc-800">
                        <section className="grid grid-cols-5 gap-5 p-5">
                            <div className="col-start-4">
                                <Button
                                    className="border"
                                    variant="outline"
                                    label="Filter"
                                    loading={false}
                                    onClick={() => openModal("filterInsights")}
                                />
                            </div>
                            <DateRange />
                        </section>
                    </header>

                    <Metrics
                        totalLosses={metrics?.totalLosses || 0}
                        averageAccuracy={metrics?.avgAccuracy ?? null}
                        blundersPerGame={metrics?.blundersPerGame ?? null}
                        worstCollapse={metrics?.worstCollapse ?? null}
                    />

                    <AreaChart
                        title="Games Lost"
                        data={dashboard?.overTime ?? []}
                        xKey="date"
                        yKey="losses"
                        unit=" Losses"
                    />

                    <AreaChart
                        title="Average Accuracy"
                        data={dashboard?.overTime ?? []}
                        xKey="date"
                        yKey="accuracy"
                        unit="%"
                    />

                    <BarList
                        title="Top Openings"
                        data={dashboard?.openings ?? []}
                        getHref={(name) => `/games?search=${encodeURIComponent(name)}`}
                    />

                    <section className="grid grid-cols-3 divide-x divide-y divide-zinc-800">
                        <DonutChart
                            title="Time Control"
                            data={distributions?.timeControl ?? []}
                            getHref={(name) => `/games?timeControl=${name}`}
                        />
                        <DonutChart
                            title="Game Phase"
                            data={distributions?.gamePhase ?? []}
                            getHref={(name) => `/games?gamePhase=${name}`}
                        />
                        <DonutChart
                            title="Termination"
                            data={distributions?.termination ?? []}
                            getHref={(name) => `/games?termination=${name}`}
                        />
                        <DonutChart title="Day of Week" data={distributions?.dayOfWeek ?? []} />
                        <DonutChart
                            title="Color"
                            data={distributions?.color ?? []}
                            getHref={(name) => `/games?color=${name}`}
                        />
                        <DonutChart
                            title="Platform"
                            data={distributions?.platform ?? []}
                            getHref={(name) => `/games?platform=${name}`}
                        />
                    </section>
                </>
            )}
        </main>
    );
}
