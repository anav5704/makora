import { create } from "zustand";

export type ModalName = "filterGame" | null;

interface ModalState {
    activeModal: ModalName;
    openModal: (name: ModalName) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    activeModal: null,
    openModal: (name) => set({ activeModal: name }),
    closeModal: () => set({ activeModal: null }),
}));
