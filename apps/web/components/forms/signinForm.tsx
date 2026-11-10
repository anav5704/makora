"use client";

import { Fieldset } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
        if (!email.trim() || !password) {
            toast.error("Enter your email and password");
            return;
        }

        setLoading(true);

        try {
            const { error } = await authClient.signIn.email({
                email,
                password,
            });

            if (error) {
                toast.error(error.message || "Could not sign in");
                return;
            }

            toast.success("Signed in");
            router.push("/dashboard");
        } catch {
            toast.error("Could not sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto">
            <Header text="Welcome Back" />

            <p className="text-center text-xl mb-5">Sign in to your Makora Chess account</p>

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

                <Button variant="solid" label="Sign In" loading={loading} onClick={handleSignin} />
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
