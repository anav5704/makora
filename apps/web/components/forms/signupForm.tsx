"use client";

import { Fieldset } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth";
import { Header } from "../ui/header";

export const SignupForm = () => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password) {
            toast.error("Fill in all the fields");
            return;
        }

        setLoading(true);

        try {
            const { error } = await authClient.signUp.email({
                name,
                email,
                password,
            });

            if (error) {
                toast.error(error.message || "Could not sign up");
                return;
            }

            toast.success("Account created");
            router.push("/onboarding");
        } catch {
            toast.error("Could not sign up");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto">
            <Header text="Create Account" />

            <p className="text-center text-xl mb-5">Enter your details to create an account</p>

            <Fieldset className="space-y-5">
                <Input name="name" type="text" value={name} label="Name" onChange={(e) => setName(e.target.value)} />

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

                <Button variant="solid" label="Sign Up" loading={loading} onClick={handleSignup} />
            </Fieldset>

            <p className="text-center mt-5 text-zinc-400">
                Already have an account?{" "}
                <a href="/signin" className="text-white underline">
                    Sign In
                </a>
            </p>
        </div>
    );
};
