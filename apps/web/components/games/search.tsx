"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const Search = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get("search"));

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);

        if (query) {
            params.set("search", query);
        } else {
            params.delete("search");
        }

        router.replace(`${pathname}?${params.toString()}` as any);
    };

    return (
        <Input
            name="search"
            type="text"
            value={query || ""}
            placeholder="Search by opening or opponent"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="col-span-3"
        />
    );
};
