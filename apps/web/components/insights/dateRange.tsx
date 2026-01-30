"use client";

import { useQueryState } from "nuqs";
import { Select, type Option } from "@/components/ui/select";

export type DateRangeValue = "week" | "month" | "3months" | "6months" | "year" | "all";

const dateRangeOptions: Option<DateRangeValue>[] = [
    { id: 1, name: "Past Week", value: "week" },
    { id: 2, name: "Past Month", value: "month" },
    { id: 3, name: "Past 3 Months", value: "3months" },
    { id: 4, name: "Past 6 Months", value: "6months" },
    { id: 5, name: "Past Year", value: "year" },
    { id: 6, name: "All Time", value: "all" },
];

export const DateRange = () => {
    const [range, setRange] = useQueryState("range", {
        defaultValue: "week",
    });

    const selectedOption = dateRangeOptions.find((option) => option.value === range) ?? dateRangeOptions[0];

    const handleChange = (option: Option<DateRangeValue>) => {
        setRange(option.value);
    };

    return (
        <div className="col-start-5">
            <Select
                options={dateRangeOptions}
                selectedItem={selectedOption}
                setSelectedItem={handleChange}
            />
        </div>
    );
};
