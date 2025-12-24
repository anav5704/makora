import { LoaderCircle } from "lucide-react"

export const Loader = () => {
return (
  <div className="grid place-content-center h-full w-full">
    <LoaderCircle size={24} className="animate-spin" />
  </div>
)
}
