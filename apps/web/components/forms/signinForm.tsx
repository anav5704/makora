"use client";

import { Fieldset } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth";

export const SigninForm = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const handleSignin = async () => {
        setLoading(true);

        await authClient.signIn.email(
            {
                email: email,
                password: password,
            },
            {
                onSuccess: () => {
                    router.push("/dashboard");
                    alert("Successfully signed in");
                },
                onError: (error) => {
                    console.log(error);
                    alert("Error: could not sign in");
                },
            },
        );

        setLoading(false);
    };

    return (
        <div className="max-w-sm mx-auto">
            <Header text="Welcome Back" />

            <Fieldset className="space-y-5">
                <Input
                    name="email"
                    type="email"
                    value={email}
                    label="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                    name="password"
                    type="password"
                    value={password}
                    label="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    label="Sign In"
                    loading={loading}
                    onClick={handleSignin}
                />
            </Fieldset>

            <p className="text-center mt-5 text-zinc-400">
                Don't have an account?{" "}
                <a href="/signup" className="text-white underline">
                    Sign Up
                </a>
            </p>
        </div>
    );
};
