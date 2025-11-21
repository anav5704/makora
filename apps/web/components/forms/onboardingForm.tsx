// TODO: refactor chess account component to handle CRUD and onhoarding form to handle only onboarding logic

"use client";

import { Fieldset } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Account, platforms } from "@/components/chess/account";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { api } from "@/lib/trpc";
import { Platform } from "@/types/chess";

export const OnboardingForm = () => {
    const { mutateAsync, isPending } = useMutation(api.user.onboard.mutationOptions());
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
    const [username, setUsername] = useState("");

    const handleOnboard = async () => {
      mutateAsync({
        platform: selectedPlatform.value,
        username
      })
    };

    return (
        <div className="max-w-sm mx-auto">
            <Header text="Onboarding" />

            <p className="text-center text-lg mb-5">
                Link your chess account to get started
                <br />
                You can link more acocunts later
            </p>

            <Fieldset className="space-y-5">
                <Account
                    selectedPlatform={selectedPlatform}
                    setSelectedPlatform={setSelectedPlatform}
                    username={username}
                    setUsername={setUsername}
                />

                <Button
                    label="Sign In"
                    loading={isPending}
                    onClick={handleOnboard}
                />
            </Fieldset>
        </div>
    );
};
