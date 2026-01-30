"use client";

import { Fieldset } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Account, platforms } from "@/components/chess/account";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { api, queryClient } from "@/lib/trpc";
import { useModalStore } from "@/stores/modalStore";

export const EditAccount = () => {
    const { activeModal, modalData, closeModal } = useModalStore();
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
    const [username, setUsername] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (modalData?.accountUsername) {
            setUsername(modalData.accountUsername);
        }
        if (modalData?.accountPlatform) {
            const platform = platforms.find((p) => p.value === modalData.accountPlatform);
            if (platform) {
                setSelectedPlatform(platform);
            }
        }
        setConfirmDelete(false);
    }, [modalData]);

    const { mutateAsync: updateAccount, isPending: isUpdating } = useMutation(
        api.user.updateAccount.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: api.user.getAccounts.queryKey() });
                setConfirmDelete(false);
                closeModal();
            },
        }),
    );

    const { mutateAsync: deleteAccount, isPending: isDeleting } = useMutation(
        api.user.deleteAccount.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: api.user.getAccounts.queryKey() });
                setConfirmDelete(false);
                closeModal();
            },
        }),
    );

    const handleUpdate = async () => {
        if (!modalData?.accountId) return;
        updateAccount({
            id: modalData.accountId,
            platform: selectedPlatform.value,
            username,
        });
    };

    const handleDelete = async () => {
        if (!modalData?.accountId) return;

        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        deleteAccount({
            id: modalData.accountId,
        });
    };

    return (
        <Modal title="Edit Account" open={activeModal === "editAccount"}>
            <Fieldset className="space-y-5">
                <Account
                    selectedPlatform={selectedPlatform}
                    setSelectedPlatform={setSelectedPlatform}
                    username={username}
                    setUsername={setUsername}
                />

                <div className="flex gap-5">
                    <Button
                        variant="danger"
                        label={confirmDelete ? "Confirm" : "Delete"}
                        loading={isDeleting}
                        onClick={handleDelete}
                    />
                    <Button
                        variant="solid"
                        label="Update"
                        loading={isUpdating}
                        onClick={handleUpdate}
                    />
                </div>
            </Fieldset>
        </Modal>
    );
};
