import { MetircCard } from "./metricCard";

interface MetricsProps {
    totalLosses: number;
    reviewedLosses: number;
    averageMoves: number;
    averageAccuracy: number;
}

export const Metrics = ({ totalLosses, reviewedLosses, averageMoves, averageAccuracy }: MetricsProps) => {
    return (
        <section className="grid grid-cols-4 divide-x divide-zinc-800">
            <MetircCard label="Total Losses" value={totalLosses} />
            <MetircCard label="Reviewed Losses" value={reviewedLosses} />
            <MetircCard label="Average Moves" value={averageMoves} />
            <MetircCard label="Average Accuracy" value={averageAccuracy + "%"} />
        </section>
    );
};
