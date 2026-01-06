import { useModalStore } from "@/stores/modalStore";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
    open: boolean;
  title: string;
    children: React.ReactNode;
}

export const Modal = ({ open, title, children }: ModalProps) => {
  const { closeModal} = useModalStore()

  const close = () => closeModal()

    return (
        <AnimatePresence>
            {open && (
                <Dialog open={open} onClose={close} transition className="relative z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    >

                    <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                        <DialogPanel className="w-lg space-y-5 rounded-md bg-zinc-900 p-5">
                          <DialogTitle as="h3" className="text-2xl font-bold flex justify-between items-center">
                                {title}
                                <button type="button" onClick={close} className="p-2">
                                    <X size={24} />
                                </button>
                          </DialogTitle>
                          {children}
                        </DialogPanel>
                    </div>
                    </motion.div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};
