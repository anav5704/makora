"use client";

import { Fieldset } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Account, platforms } from "@/components/chess/account";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { api, queryClient } from "@/lib/trpc";
import { useModalStore } from "@/stores/modalStore";

export const AddAccount = () => {
    const { activeModal, closeModal } = useModalStore();
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
    const [username, setUsername] = useState("");

    const { mutateAsync, isPending } = useMutation(
        api.user.addAccount.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: api.user.getAccounts.pathKey() });
                queryClient.invalidateQueries({ queryKey: api.chess.getActiveJobs.pathKey() });
                queryClient.invalidateQueries({ queryKey: api.chess.getFailedJobs.pathKey() });
                setUsername("");
                setSelectedPlatform(platforms[0]);
                closeModal();
            },
        }),
    );

    const handleAddAccount = async () => {
        if (username.trim().length < 2) {
            toast.error("Username must be at least 2 characters");
            return;
        }

        try {
            await mutateAsync({
                platform: selectedPlatform.value,
                username,
            });
        } catch {
            return;
        }
    };

    return (
        <Modal title="Add Account" open={activeModal === "addAccount"}>
            <Fieldset className="space-y-5">
                <Account
                    selectedPlatform={selectedPlatform}
                    setSelectedPlatform={setSelectedPlatform}
                    username={username}
                    setUsername={setUsername}
                />

                <Button variant="solid" label="Add Account" loading={isPending} onClick={handleAddAccount} />
            </Fieldset>
        </Modal>
    );
};
