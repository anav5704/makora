import type { ChessAccount } from "@makora/db"
import { ChessCom } from "./chess/icons/chess-com"
import { LichessOrg } from "./chess/icons/lichess-org"
import { useModalStore } from "@/stores/modalStore"

interface AccountWithCount extends ChessAccount {
  _count: {
    games: number
  }
}

interface AccountCardProps {
  account: AccountWithCount
}

export const AccountCard = ({ account }: AccountCardProps) => {
  const { openModal } = useModalStore()
  const lastSync = account.syncedAt ? new Date(account.syncedAt).toDateString() : "Never"

  const handleClick = () => {
    openModal("editAccount", {
      accountId: account.id,
      accountUsername: account.username,
      accountPlatform: account.platform,
    })
  }



  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-left space-y-3 p-5 border border-zinc-800 rounded-md col-span-1 cursor-pointer"
    >
      <h3 className="flex gap-3">
         {account.platform === "CHESS_COM" ? <ChessCom /> : <LichessOrg />}
          {account.username}
      </h3>
      <p>Total games: {account._count.games}</p>
      <p>Last sync: {lastSync}</p>
    </button>
  )
}
