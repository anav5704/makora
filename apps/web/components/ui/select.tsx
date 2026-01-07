"use client";

import { Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { _isoDuration } from "better-auth";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export interface Option<T> {
    id: number;
    name: string;
    value: T;
}

interface SelectProps<T> {
    options: Option<T>[];
    selectedItem: Option<T>;
    setSelectedItem: (item: Option<T>) => void;
    label?: string;
    id?: string;
    name?: string;
}

export const Select = <T,>({ options, selectedItem, setSelectedItem, label, id, name }: SelectProps<T>) => {
    return (
        <Field>
        {label && <Label>{label}</Label>}
            <Listbox value={selectedItem} onChange={setSelectedItem}>
            {({ open }) => (
              <>
                <ListboxButton
                id={id}
                name={name}
                className={`${label && "mt-2.5"} flex items-center justify-between cursor-pointer text-left px-4 py-2.5 w-full rounded-md border border-zinc-800 bg-zinc-900`}>
                    {selectedItem.name}
                    <ChevronDown size={24} className="-mr-2" />
                </ListboxButton>
                 <AnimatePresence>
                    {open && (
                      <ListboxOptions
                          static
                          as={motion.div}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          anchor="bottom"
                        className="w-(--button-width) z-10 origin-top mt-2 p-2 rounded-md border border-zinc-800 bg-zinc-900"
                      >
                        {options.map((option) => (
                          <ListboxOption
                            key={option.id}
                            value={option}
                            className="cursor-pointer p-2 rounded-md hover:bg-zinc-800">
                            {option.name}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    )}
                 </AnimatePresence>
              </>
                )}
            </Listbox>
        </Field>
    );
};
