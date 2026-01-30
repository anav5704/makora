"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { AnimatePresence, motion } from "framer-motion";
import { normalizeEnum } from "@/utils/normalizeEnum";

interface DonutChartProps {
    title: string;
    data: Array<{ name: string; value: number }>;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: { name: string; value: number } }>;
    total: number;
    onDataChange: (data: { name: string; value: number; percentage: number } | null) => void;
}

function CustomTooltip({ active, payload, total, onDataChange }: CustomTooltipProps) {
    useEffect(() => {
        if (active && payload && payload.length > 0) {
            const data = payload[0].payload;
            const percentage = total > 0 ? Math.round((data.value / total) * 100) : 0;
            onDataChange({
                name: data.name,
                value: data.value,
                percentage,
            });
        } else {
            onDataChange(null);
        }
    }, [active, payload, total, onDataChange]);

    return null;
}

export function DonutChart({ title, data }: DonutChartProps) {
    const [activeData, setActiveData] = useState<{ name: string; value: number; percentage: number } | null>(null);

    const handleDataChange = useCallback((data: { name: string; value: number; percentage: number } | null) => {
        setActiveData(data);
    }, []);

    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

    // Find the highest value index
    const highestValueIndex = useMemo(() => {
        if (data.length === 0) return -1;
        let maxIndex = 0;
        let maxValue = data[0].value;
        data.forEach((item, index) => {
            if (item.value > maxValue) {
                maxValue = item.value;
                maxIndex = index;
            }
        });
        return maxIndex;
    }, [data]);

    return (
        <div className="p-5 col-span-1">
            <div className="flex justify-between items-center mb-5">
                <p>{title}</p>
                <AnimatePresence>
                    {activeData && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}>
                            {activeData.value} ({activeData.percentage}%) · {normalizeEnum(activeData.name)}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Tooltip
                        content={({ active, payload }) => (
                            <CustomTooltip
                                active={active}
                                payload={payload as Array<{ payload: { name: string; value: number } }>}
                                total={total}
                                onDataChange={handleDataChange}
                            />
                        )}
                    />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}>
                        {data.map((entry, index) => (
                            <Cell
                                key={entry.name}
                                stroke="none"
                                fill={index === highestValueIndex ? "#d4d4d8" : "#27272a"}
                                strokeWidth={index === highestValueIndex ? 2 : 0}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
