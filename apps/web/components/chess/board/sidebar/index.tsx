"use client";
import type { Game } from "@makora/db";
import type { Dispatch, SetStateAction } from "react";
import { GameControls } from "@/components/chess/board/sidebar/gameControls";
import { NoteControls } from "@/components/chess/board/sidebar/noteControls";
import { Activity, useState } from "react";

interface GameDetailsProps {
    game: Game;
    positions?: string[];
    moves?: string[];
    moveIndex?: number;
    setMoveIndex?: Dispatch<SetStateAction<number>>;
    onNavigate?: (index: number) => void;
}

export const Sidebar = ({
    game,
    positions = [],
    moves = [],
    moveIndex = 0,
    setMoveIndex,
    onNavigate,
}: GameDetailsProps) => {
    const [activeTab, setActiveTab] = useState<'game' | 'notes'>('game');

    return (
      <aside className="max-h-screen w-72 border-l border-zinc-800 flex flex-col">
        <div className="p-5 border-b border-zinc-800 grid grid-cols-2">
             <button
                 type="button"
                 className={`col-span-1 duration-300 transition rounded-md p-3 ${
                     activeTab === 'game' ? 'bg-zinc-800' : ''
                 }`}
                 onClick={() => setActiveTab('game')}
             >
                 Game
             </button>
             <button
                 type="button"
                 className={`col-span-1 duration-300 transition rounded-md p-3 ${
                     activeTab === 'notes' ? 'bg-zinc-800' : ''
                 }`}
                 onClick={() => setActiveTab('notes')}
             >
                 Notes
             </button>
           </div>

           <div className="flex-1 overflow-hidden">
             {/* Game Tab */}
             <Activity mode={activeTab === 'game' ? 'visible' : 'hidden'}>
               <div className="h-full flex flex-col justify-end divide-y divide-zinc-800 overflow-scroll">
                 <GameControls
                         game={game}
                         positions={positions}
                         moves={moves}
                         moveIndex={moveIndex}
                         setMoveIndex={setMoveIndex}
                         onNavigate={onNavigate}
                 />
               </div>
             </Activity>

             {/* Notes Tab */}
             <Activity mode={activeTab === 'notes' ? 'visible' : 'hidden'}>
               <div className="h-full flex flex-col divide-y divide-zinc-800">
                 <NoteControls gameId={game.id} defaultNotes={game.notes} />
               </div>
             </Activity>
           </div>
         </aside>

    );
};
