"use client";

import { AddAccount } from "@/components/modals/addAccount";
import { FilterGame } from "@/components/modals/filterGame";

export const ModalProvider = () => {
  return (
      <>
        <AddAccount />
        <FilterGame />
      </>
    )
};
