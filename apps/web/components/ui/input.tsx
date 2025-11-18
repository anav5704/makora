import { Field, Label, Input as Root } from "@headlessui/react"
import type { ChangeEvent } from "react"

interface InputProps {
    name: string
    type: string
    value: string | number
    label: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const Input = ({ name, type, value, label, onChange }: InputProps) => {
    return (
        <Field>
            <Label>{label}</Label>
            <Root
            className="mt-2.5 block px-4 py-2.5 w-full rounded-md border border-zinc-700 bg-zinc-800"
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            />
        </Field>
    )
}
