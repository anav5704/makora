"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";

export const Search = () => {
    const [search, setSearch] = useQueryState("search");
    const [query, setQuery] = useState(search || "")

    useEffect(() => {
        setQuery(search || "");
    }, [search]);

    // Debounce the search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                setSearch(query);
            } else {
                setSearch(null);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, setSearch]);

    return (
        <Input
            name="search"
            type="text"
            value={query}
            placeholder="Search by opening or opponent"
            onChange={(e) => setQuery(e.target.value)}
            className="col-span-3"
        />
    );
};
