import { Footer } from "@/components/navigation/footer";
import { Navbar } from "@/components/navigation/navbar";
import { DemoSection } from "@/components/site/demo-section";
import { Container } from "@/components/ui/container";
import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function ProductPage() {
    const session = await getSession();

  return (
    <main>
      <Navbar user={!!session?.user} />

      <Container className="my-[15vh] space-y-8 text-center">
          <h1 className="text-gradient-white text-center text-6xl font-bold">
              Track, Analyze & Visualize <br /> Your Chess Losses
          </h1>

        <p className="text-2xl text-zinc-400">
          The <span className="text-white">chess improvement tool</span> that focuses on
          <br />
          what matters most - <span className="text-white"> your mistakes.</span>
        </p>

        <section className="space-x-5">
              <a className="px-6 py-4 bg-zinc-800 rounded-md" href="https://github.com/anav5704/makora">Learn More</a>
              <Link className="px-6 py-3 bg-white text-zinc-900 rounded-md" href="/signup">Get Started</Link>
        </section>
      </Container>

      <Container className="my-[15vh]">
          <DemoSection />
      </Container>

      <Footer />
    </main>
    );
}
