import { Sidebar } from "@/components/navigation/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen divide-x divide-zinc-800">
            <Sidebar />
            <section className="p-5 h-screen overflow-scroll">{children}</section>
        </main>
    );
}
