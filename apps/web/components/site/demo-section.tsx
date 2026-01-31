"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AreaChart, RefreshCw, Cpu } from "lucide-react";
import { useState } from "react";

interface Tab {
    id: number;
    name: string;
    description: string;
    image: string;
    icon: React.ReactNode;
}

const tabs: Tab[] = [
    {
        id: 1,
        name: "Track",
        description: "Sync games directly from your chess.com and lichess.org accounts..",
        image: "/images/track.png",
        icon: <RefreshCw size={20} />,
    },
    {
        id: 2,
        name: "Analyze",
        description: "Get Stockfish analysis for inaccuracies, mistakes, and blunders.",
        image: "/images/analyze.png",
        icon: <Cpu size={20} />,
    },
    {
        id: 3,
        name: "Visualize",
        description: "View loss patterns, accuracy trends, and playing habits over time",
        image: "/images/visualize.png",
        icon: <AreaChart size={20} />,
    },
];

export const DemoSection = () => {
    const [activeTab, setActiveTab] = useState<Tab>(tabs[0]);

    return (
        <div className="space-y-8">
            <AnimatePresence mode="wait">
                <motion.img
                    key={`image-${activeTab.id}`}
                    src={activeTab.image}
                    alt={`${activeTab.name} demo`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="rounded-md overflow-hidden w-full h-full object-contain"
                />
            </AnimatePresence>

            <AnimatePresence mode="wait">
                <motion.p
                    key={`description-${activeTab.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="text-xl text-center"
                >
                    {activeTab.description}
                </motion.p>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-5">
                {tabs.map((tab) => (
                    <button
                        type="button"
                        key={tab.id}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-md font-medium transition-colors ${
                            activeTab.id === tab.id
                                ? "bg-white text-zinc-900"
                                : "bg-zinc-800"
                        }`}
                    >
                        {tab.icon}
                        {tab.name}
                    </button>
                ))}
            </div>
        </div>
    );
};
