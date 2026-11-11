// TODO: refactor chess account component to handle CRUD and onhoarding form to handle only onboarding logic

"use client";

import { Fieldset } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Account, platforms } from "@/components/chess/account";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { api, queryClient } from "@/lib/trpc";

export const OnboardingForm = () => {
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
    const [username, setUsername] = useState("");
    const router = useRouter();

    const { mutateAsync, isPending } = useMutation(
        api.user.onboard.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: api.chess.getActiveJobs.pathKey() });
                queryClient.invalidateQueries({ queryKey: api.chess.getFailedJobs.pathKey() });
                router.push("/dashboard");
            },
        }),
    );

    const handleOnboard = async () => {
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
        <div className="max-w-sm mx-auto">
            <Header text="Onboarding" />

            <p className="text-center text-lg mb-5">Link your chess account to get started</p>

            <Fieldset className="space-y-5">
                <Account
                    selectedPlatform={selectedPlatform}
                    setSelectedPlatform={setSelectedPlatform}
                    username={username}
                    setUsername={setUsername}
                />

                <Button variant="solid" label="Continue" loading={isPending} onClick={handleOnboard} />
            </Fieldset>

            <p className="text-center mt-5 text-zinc-400">You can add more accounts later</p>
        </div>
    );
};
