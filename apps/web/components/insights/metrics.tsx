import { MetircCard } from "./metricCard";

interface MetricsProps {
    totalLosses: number;
    averageAccuracy: number | null;
    blundersPerGame: number | null;
    worstCollapse: { gameId: string; winDrop: number } | null;
}

export const Metrics = ({ totalLosses, averageAccuracy, blundersPerGame, worstCollapse }: MetricsProps) => {
    return (
        <section className="grid grid-cols-4 divide-x divide-zinc-800">
            <MetircCard label="Total Losses" value={totalLosses} />
            <MetircCard label="Average Accuracy" value={averageAccuracy === null ? "—" : averageAccuracy + "%"} />
            <MetircCard label="Blunders / Game" value={blundersPerGame ?? "—"} />
            <MetircCard
                label="Worst Collapse"
                value={worstCollapse ? `-${worstCollapse.winDrop}` : "—"}
                href={worstCollapse ? `/games/${worstCollapse.gameId}` : undefined}
            />
        </section>
    );
};
