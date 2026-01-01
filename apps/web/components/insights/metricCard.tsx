interface MetricCardProps {
    label: string;
    value: number | string;
}

export const MetircCard = ({ label, value }: MetricCardProps) => {
    return (
        <article className="col-span-1 p-5 space-y-3">
            <p>{label}</p>
            <p className="text-3xl font-bold text-right">{value}</p>
        </article>
    );
};
