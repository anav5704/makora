import { Field, Label, Input as Root } from "@headlessui/react";
import type { ChangeEvent, KeyboardEventHandler } from "react";

interface InputProps {
    name: string;
    type: string;
    value: string | number;
    label?: string;
    placeholder?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: KeyboardEventHandler<HTMLInputElement>) => void;
}

export const Input = ({ name, type, value, label, placeholder, onChange, onKeyDown }: InputProps) => {
    return (
        <Field>
            {label && <Label className="mb-2.5">{label}</Label>}
            <Root
                className="block px-4 py-2.5 w-full rounded-md border border-zinc-800 bg-zinc-900"
                name={name}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                onKeyDown={onKeyDown}
            />
        </Field>
    );
};
