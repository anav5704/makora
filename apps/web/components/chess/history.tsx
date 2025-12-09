interface HistoryProps {
  moves: string[]
}

export const History = ({ moves }: HistoryProps) => {
  return (
  <nav className="h-screen overflow-scroll border-l border-zinc-800 p-5 w-64 flex flex-col justify-between">
      {moves.map((move, i) => (
        <p key={i + move}>{move}</p>
      ))}
  </nav>
  )
}
