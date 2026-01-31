import { Container } from "@/components/ui/container"

export const Footer = () => {
  return (
    <section className="w-full border-t border-zinc-800 p-5">
      <Container>
        <footer className="flex justify-between">
            <p>Made by <a className="underline" href="https://anav.dev">Anav</a></p>
            <a href="https://github.com/anav5704/makora">GitHub</a>
        </footer>
      </Container>
    </section>
    )
}
