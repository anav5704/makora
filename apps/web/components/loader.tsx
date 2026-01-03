import { LoaderCircle } from "lucide-react";

export const Loader = () => {
    return (
        <div className="grid place-content-center h-screen w-full">
            <LoaderCircle size={24} className="animate-spin" />
        </div>
    );
};
