"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart as RadarChartCore,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

interface RadarPoint {
    phase: string;
    value: number;
}

interface RadarChartProps {
    title: string;
    data: RadarPoint[];
    unit?: string;
    domain?: [number, number];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: RadarPoint }>;
    unit?: string;
    onDataChange: (data: RadarPoint | null) => void;
}

function CustomTooltip({ active, payload, onDataChange }: CustomTooltipProps) {
    useEffect(() => {
        if (active && payload && payload.length > 0) {
            onDataChange(payload[0].payload);
        } else {
            onDataChange(null);
        }
    }, [active, payload, onDataChange]);

    return null;
}

export function RadarChart({ title, data, unit = "", domain }: RadarChartProps) {
    const [activeData, setActiveData] = useState<RadarPoint | null>(null);

    const handleDataChange = useCallback((next: RadarPoint | null) => {
        setActiveData(next);
    }, []);

    return (
        <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
                <p>{title}</p>
                <AnimatePresence>
                    {activeData && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}>
                            {activeData.value}
                            {unit} · {activeData.phase}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <RadarChartCore data={data} outerRadius={100} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="phase" tick={false} />
                    <PolarRadiusAxis domain={domain} tick={false} axisLine={false} />
                    <Tooltip
                        content={({ active, payload }) => (
                            <CustomTooltip
                                active={active}
                                payload={payload as Array<{ payload: RadarPoint }>}
                                onDataChange={handleDataChange}
                            />
                        )}
                        cursor={false}
                    />
                    <Radar dataKey="value" stroke="#d4d4d8" fill="#27272a" fillOpacity={1} />
                </RadarChartCore>
            </ResponsiveContainer>
        </div>
    );
}
