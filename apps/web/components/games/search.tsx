"use client";

import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";
import { useState, useEffect } from "react";
import { SEARCH_DEBOUNCE } from "@/const"

export const Search = () => {
    const [search, setSearch] = useQueryState("search");
    const [query, setQuery] = useState(search || "")

    useEffect(() => {
        setQuery(search || "");
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) {
                setSearch(query);
            } else {
                setSearch(null);
            }
        }, SEARCH_DEBOUNCE);

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
