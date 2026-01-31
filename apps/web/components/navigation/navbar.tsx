import { Container } from "@/components/ui/container"
import Link from "next/link"

interface NavbarProps {
    user: boolean
}

export const Navbar = ({ user }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-10 bg-zinc-900 w-full p-5 border-b border-zinc-800">
      <Container>
        <nav className="flex justify-between">
          <p>Makora Chess</p>
          {user ? (
          <Link href="/dashboard">Dasboard</Link>
          ): (
          <ul className="flex gap-5">
              <li>
                <Link href="/signin">Sign In</Link>
              </li>
              <li>
                <Link href="/signup">Sign Up</Link>
              </li>
          </ul>
          )}
        </nav>
      </Container>
    </header>
  )
}
