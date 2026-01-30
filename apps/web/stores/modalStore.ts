import { create } from "zustand";

export type ModalName = "filterGame" | "addAccount" | "editAccount" | null;

interface ModalData {
    accountId?: string;
    accountUsername?: string;
    accountPlatform?: string;
}

interface ModalState {
    activeModal: ModalName;
    modalData: ModalData | null;
    openModal: (name: ModalName, data?: ModalData) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    activeModal: null,
    modalData: null,
    openModal: (name, data) => set({ activeModal: name, modalData: data ?? null }),
    closeModal: () => set({ activeModal: null, modalData: null }),
}));
