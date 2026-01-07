"use client";

import type { Game, Platform } from "@makora/db";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { getTimeControl } from "@/utils/getTimeControl";
import { normalizeEnum } from "@/utils/normalizeEnum";
import { ChessCom } from "../chess/icons/chess-com";
import { LichessOrg } from "../chess/icons/lichess-org";

interface GamesListProps {
    games: (Game & { account: { platform: Platform } })[];
}

export const GamesList = ({ games }: GamesListProps) => {
    const relativeDate = (date: Date) => formatDistanceToNow(new Date(date), { addSuffix: true }).replace("about", "");

    return (
        <section>
            {games?.map(
                ({
                    id,
                    reviewed,
                    timeControl,
                    opening,
                    account: { platform },
                    gamePhase,
                    termination,
                    moveCount,
                    date,
                }) => {
                    // @ts-expect-error
                    const { icon: Icon, title } = getTimeControl(timeControl);

                    return (
                        <Link key={id} href={{ pathname: `/games/${id}` }}>
                            <p
                                className={`${reviewed ? "text-zinc-400" : "text-white"} grid grid-cols-8 p-5 border-b border-zinc-800 hover:bg-zinc-800 transition`}>
                                <span className="col-span-4">
                                    <span className="flex items-center gap-5">
                                        {platform === "CHESS_COM" ? <ChessCom /> : <LichessOrg />}
                                        <span title={title}>
                                            <Icon size={24} />
                                        </span>
                                        <span className="truncate">{opening}</span>
                                    </span>
                                </span>
                                <span className="col-span-1">{normalizeEnum(gamePhase)}</span>
                                <span className="col-span-1">{normalizeEnum(termination)}</span>
                                <span className="col-span-1">{moveCount}</span>
                                <span className="col-span-1">{relativeDate(new Date(date))}</span>
                            </p>
                        </Link>
                    );
                },
            )}
        </section>
    );
};
