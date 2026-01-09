import { Field, Label, Input as Root } from "@headlessui/react";
import type { ChangeEvent, KeyboardEventHandler } from "react";

interface InputProps {
    name: string;
    type: string;
    value: string | number;
    label?: string;
    placeholder?: string;
  className?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

export const Input = ({ name, type, value, label, placeholder, className, onChange, onKeyDown }: InputProps) => {
    return (
        <Field className={className}>
            {label && <Label>{label}</Label>}
            <Root
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onKeyDown={onKeyDown}
          className={`${label && "mt-2.5"} block px-4 py-2.5 w-full rounded-md border border-zinc-800 bg-zinc-900`}
            />
        </Field>
    );
};
