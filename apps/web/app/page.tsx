"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/trpc";

export default function Home() {
    const healthCheck = useQuery(api.healthCheck.queryOptions());

    return (
        <main>
            {healthCheck.isLoading
                ? "Checking..."
                : healthCheck.data
                  ? "Connected"
                  : "Disconnected"}
        </main>
    );
}
