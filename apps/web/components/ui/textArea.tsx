import { Textarea as Core } from "@headlessui/react"
import { ChangeEvent, KeyboardEventHandler } from "react";

interface TextAreaProps {
  name: string;
  value: string;
  className?: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
}

export const TextArea = ({ name, value, className, onChange, onKeyDown }: TextAreaProps) => {
  return (
    <Core
        className={`${className}  p-5 w-full bg-zinc-900`}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
    />
  )
}
