"use client";

import { Toaster as Sonner } from "sonner";

export const Toaster = () => {
    return (
        <Sonner
            theme="dark"
            position="bottom-right"
            toastOptions={{
                style: {
                    background: "#18181b",
                    color: "#ffffff",
                    border: "1px solid #27272a",
                    borderRadius: "6px",
                    boxShadow: "none",
                },
                classNames: {
                    title: "text-white",
                    description: "text-white",
                    icon: "text-white",
                },
            }}
        />
    );
};
