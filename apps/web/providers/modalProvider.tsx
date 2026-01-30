"use client";

import { AddAccount } from "@/components/modals/addAccount";
import { EditAccount } from "@/components/modals/editAccount";
import { FilterGame } from "@/components/modals/filterGame";

export const ModalProvider = () => {
  return (
      <>
        <AddAccount />
        <EditAccount />
        <FilterGame />
      </>
    )
};
