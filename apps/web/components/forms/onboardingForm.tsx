// TODO: refactor chess account component to handle CRUD and onhoarding form to handle only onboarding logic

"use client";

import { Fieldset } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Account, platforms } from "@/components/chess/account";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { api } from "@/lib/trpc";

export const OnboardingForm = () => {
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOnboard = async () => {
        setLoading(true);
        try {
            const { data, error, isPending } = useMutation(
                api.user.onboard.queryOptions({
                    platform: selectedPlatform,
                    username,
                }),
            );
        } catch (error) {
            console.error("Error onboarding:", error);
        } finally {
            setLoading(false);
        }
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
                    loading={loading}
                    onClick={handleOnboard}
                />
            </Fieldset>
        </div>
    );
};
