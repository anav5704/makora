import Link from "next/link";

interface MetricCardProps {
    label: string;
    value: number | string;
    href?: `/games/${string}`;
}

export const MetircCard = ({ label, value, href }: MetricCardProps) => {
    const body = (
        <article className="col-span-1 p-5 space-y-3">
            <p>{label}</p>
            <p className="text-3xl font-bold text-right">{value}</p>
        </article>
    );

    if (href) {
        return (
            <Link href={href} className="col-span-1 hover:bg-zinc-900 transition-colors">
                {body}
            </Link>
        );
    }

    return body;
};
