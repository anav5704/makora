import { Modal } from "@/components/ui/modal";
import { useModalStore } from "@/stores/modalStore";

export const FilterGame = () => {
    const { activeModal, closeModal } = useModalStore();

    const close = () => closeModal();

    return (
        <Modal open={activeModal === "filterGame"} onc>
            <h1>Hi</h1>
            <button type="button" onClick={close}>
                Close
            </button>
        </Modal>
    );
};
