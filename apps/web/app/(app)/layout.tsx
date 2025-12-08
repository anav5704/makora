import { Sidebar } from "@/components/navigation/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen min-w-screen divide-x divide-zinc-800">
            <Sidebar />
            <section className="h-screen overflow-scroll w-full">{children}</section>
        </main>
    );
}
