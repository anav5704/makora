import { ChessAccount } from "@makora/db"
import { ChessCom } from "./chess/icons/chess-com"
import { LichessOrg } from "./chess/icons/lichess-org"

interface AccountCardProps {
  account: ChessAccount
}

export const AccountCard = ({ account }: AccountCardProps) => {
  const lastSync = account.syncedAt ? new Date(account.syncedAt).toDateString() : "Never"

  return (
    <article className="space-y-3 p-5 border border-zinc-800 rounded-md col-span-1">
      <h3 className="flex gap-3">
         {account.platform === "CHESS_COM" ? <ChessCom /> : <LichessOrg />}
          {account.username}
      </h3>
      <p>Total games: {account._count.games}</p>
      <p>Last sync: {lastSync}</p>
    </article>
  )
}
