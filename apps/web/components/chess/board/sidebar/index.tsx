"use client";

import type { Game } from "@makora/db";
import { Fragment, type Dispatch, type SetStateAction } from "react";
import { GameControls } from "@/components/chess/board/sidebar/gameControls";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

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
    return (
      <TabGroup as="aside" className="max-h-screen w-72 border-l border-zinc-800 flex flex-col">
        <TabList className="p-5 border-b border-zinc-800 grid grid-cols-2">
             <Tab className="col-span-1 data-selected:bg-zinc-700 duration-300 transition rounded-md p-3">Game</Tab>
             <Tab className="col-span-1 data-selected:bg-zinc-700 duration-300 transition rounded-md p-3">Notes</Tab>
           </TabList>

           <TabPanels className="flex-1 overflow-hidden">
             <TabPanel className="h-full flex flex-col justify-end divide-y divide-zinc-800 overflow-scroll">
            <GameControls
                    game={game}
                    positions={positions}
                    moves={moves}
                    moveIndex={moveIndex}
                    setMoveIndex={setMoveIndex}
                    onNavigate={onNavigate}
            />
          </TabPanel>
          <TabPanel>
             {/*notes and tags*/}
             </TabPanel>
           </TabPanels>
         </TabGroup>

    );
};
