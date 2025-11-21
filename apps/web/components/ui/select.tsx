"use client";

import {
    Field,
    Label,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { Platform } from "@/types/chess";

interface Option {
    id: number;
    name: string;
    value: Platform;
}

interface SelectProps {
    options: Option[];
    selectedItem: Option;
    setSelectedItem: (item: Option) => void;
    label: string;
    id?: string;
    name?: string;
}

export const Select = ({
    options,
    selectedItem,
    setSelectedItem,
    label,
    id,
    name,
}: SelectProps) => {
    return (
        <Field>
            <Label>{label}</Label>
            <Listbox value={selectedItem} onChange={setSelectedItem}>
                <ListboxButton
                    id={id}
                    name={name}
                    className="flex items-center justify-between cursor-pointer text-left mt-2.5 px-4 py-2.5 w-full rounded-md border border-zinc-700 bg-zinc-800">
                    {selectedItem.name}
                    <ChevronDown size={24} />
                </ListboxButton>
                <ListboxOptions
                    className="w-(--button-width) mt-2 p-2 rounded-md border border-zinc-700 bg-zinc-800"
                    anchor="bottom">
                    {options.map((option) => (
                        <ListboxOption
                            key={option.id}
                            value={option}
                            className="cursor-pointer p-2 rounded-md hover:bg-zinc-700">
                            {option.name}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </Field>
    );
};
