import { Dialog, DialogPanel } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";

interface ModalProps {
    open: boolean;
    children: React.ReactNode;
}

export const Modal = ({ open, children }: ModalProps) => {
    return (
        <AnimatePresence>
            {open && (
                <Dialog open={open} onClose={() => {}} transition className="relative z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black/50"
                    />
                    <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                        <DialogPanel className="max-w-lg space-y-5 rounded-md bg-zinc-900 p-5">{children}</DialogPanel>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
};
