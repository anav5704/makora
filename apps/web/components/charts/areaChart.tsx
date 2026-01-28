"use client";

import { useCallback, useEffect, useState } from "react";
import { Area, AreaChart as AreaChartCore, ResponsiveContainer, Tooltip } from "recharts";

export const description = "A simple area chart";

interface AreaChartProps {
    title: string;
    data: Array<Record<string, string | number>>;
    xKey: string;
    yKey: string;
    unit?: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: Record<string, string | number> }>;
    xKey: string;
    yKey: string;
    onDataChange: (data: { x: string; y: number } | null) => void;
}

function CustomTooltip({ active, payload, xKey, yKey, onDataChange }: CustomTooltipProps) {
    useEffect(() => {
        if (active && payload && payload.length > 0) {
            const data = payload[0].payload;
            const date = new Date(data[xKey] as string);
            const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
            onDataChange({
                x: formattedDate,
                y: data[yKey] as number,
            });
        } else {
            onDataChange(null);
        }
    }, [active, payload, xKey, yKey, onDataChange]);

    return null;
}

export function AreaChart({ title, data, xKey, yKey, unit }: AreaChartProps) {
    const [activeData, setActiveData] = useState<{ x: string; y: number } | null>(null);

    const handleDataChange = useCallback((data: { x: string; y: number } | null) => {
        setActiveData(data);
    }, []);

    return (
        <div className="p-5">
            <div className="flex justify-between items-center mb-3">
                <p>{title}</p>
                {activeData && (
                    <span>
                        {activeData.y}
                        {unit} @ {activeData.x}
                    </span>
                )}
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <AreaChartCore accessibilityLayer data={data}>
                    <Tooltip
                        content={({ active, payload }) => (
                            <CustomTooltip
                                active={active}
                                payload={payload as Array<{ payload: Record<string, string | number> }>}
                                xKey={xKey}
                                yKey={yKey}
                                onDataChange={handleDataChange}
                            />
                        )}
                        cursor={false}
                    />
                    <Area dataKey={yKey} type="monotone" fill="#27272a" stroke="#d4d4d8" />
                </AreaChartCore>
            </ResponsiveContainer>
        </div>
    );
}
