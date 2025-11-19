export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="grid w-screen grid-cols-2 p-5 h-screen items-center">
            <section className="col-span-1 bg-zinc-800 h-full w-full rounded-xl">
                {/* Carousel */}
            </section>
            <section className="col-span-1">{children}</section>
        </main>
    );
}
