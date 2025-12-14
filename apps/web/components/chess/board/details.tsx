import { Game } from "@makora/db"
import { normalizeEnum } from "@/utils/normalizeEnum";

interface DetailsProps {
  game: Game
}

export const Details = ({ game }: DetailsProps) => {
  return (
    <div className="p-5 space-y-5">
      <h3 className="truncate">Opponent: {game.opponent}</h3>
      <h3 className="truncate">Opening: {game.opening}</h3>
      <h3 className="truncate">Time Control: {normalizeEnum(game.timeControl)}</h3>
      <h3 className="truncate">Termination: {normalizeEnum(game.termination)}</h3>
      <h3 className="truncate">Date: {new Date(game.date).toDateString()}</h3>
    </div>
  )
}
