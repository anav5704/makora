import { Button as Root } from "@headlessui/react";
import { LoaderCircle } from "lucide-react";

interface ButonProps {
    label: string;
    loading: boolean;
    variant: "solid" | "outline" | "danger";
    className?: string;
    onClick: () => void;
}

export const Button = ({ label, loading, variant, className, onClick }: ButonProps) => {
    let variantStyle = ""

  switch (variant) {
    case "solid": {
      variantStyle = "bg-zinc-300 text-zinc-900"
      break
    }
    case "outline":
      variantStyle = "bg-zinc-900 text-white border-zinc-800"
      break
    case "danger":
      variantStyle = "bg-rose-500 text-zinc-900"
      break
  }

    return (
        <Root
          className={`${variantStyle} ${className} px-4 py-2.5 rounded-md w-full cusor-pointer disabled:cursor-not-allowed!`}
            onClick={onClick}
            disabled={loading}>
            {loading ? <LoaderCircle size={24} className="animate-spin mx-auto" /> : <p>{label}</p>}
        </Root>
    );
};
