import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ModalProvider } from "@/providers/modalProvider";
import { QueryProvider } from "@/providers/queryProvider";
import "./globals.css";

const interTight = Inter_Tight({
    variable: "--font-inter-tight",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Makoa Chess",
    description: "Makora Chess (魔虚羅). Track, analyze and visualize your chess losses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${interTight.variable} antialiased`}>
                <Suspense fallback={null}>
                    <NuqsAdapter>
                        <QueryProvider>
                            <ModalProvider />
                            {children}
                            <Toaster />
                        </QueryProvider>
                    </NuqsAdapter>
                </Suspense>
            </body>
        </html>
    );
}
