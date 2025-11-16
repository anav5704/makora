"use client"

import { Button } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/trpc"

export default function Home() {
    const healthCheck = useQuery(api.healthCheck.queryOptions())

    return (
        <main>
            <Button loading={healthCheck.isLoading}>
                {healthCheck.isLoading
                    ? "Loading"
                    : healthCheck.data
                        ? "Connected"
                        : "Disconnected"}
            </Button>
        </main>
    )
}
