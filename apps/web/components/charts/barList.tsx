"use client";

import { useRouter } from "next/navigation";
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface BarListProps {
    title: string;
    data: Array<{ name: string; value: number }>;
    getHref?: (name: string) => string;
}

export function BarList({ title, data, getHref }: BarListProps) {
    const router = useRouter();

    return (
        <div className="p-5">
            <div className="flex justify-between items-center mb-2">
                <p>{title}</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart accessibilityLayer data={data} layout="vertical" barGap={5} barCategoryGap={10}>
                    <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} hide />
                    <XAxis dataKey="value" type="number" hide />

                    <Bar
                        dataKey="value"
                        fill="#27272a"
                        radius={5}
                        className={getHref ? "cursor-pointer" : undefined}
                        onClick={(datum) => {
                            const name = (datum as unknown as { name?: unknown }).name;
                            if (getHref && typeof name === "string") router.push(getHref(name) as "/games");
                        }}
                    >
                        <LabelList dataKey="name" position="insideLeft" offset={15} className="fill-white" />
                        <LabelList dataKey="value" position="right" offset={15} className="fill-white" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
