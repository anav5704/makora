import { Button as Root } from '@headlessui/react'
import { LoaderCircle } from "lucide-react"

interface ButonProps {
    label: string,
    loading: boolean,
    onClick: () => void
}

export const Button = ({ label, loading, onClick }: ButonProps) => {
  return (
    <Root
      className="bg-violet-500 px-4 py-2.5 rounded-md w-full text-white cusor-pointer disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <LoaderCircle size={24} className="animate-spin mx-auto" />
      ): (
      <p>{label}</p>
      )}
    </Root>
  )
}
