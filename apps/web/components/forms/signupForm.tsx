"use client";

import { Fieldset } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
        setLoading(true);

        await authClient.signUp.email(
            {
                name: name,
                email: email,
                password: password,
            },
            {
                onSuccess: () => {
                    router.push("/onboarding");
                    alert("Sign up successful");
                },
                onError: (error) => {
                    alert("Error: " + error.error.message);
                },
            },
        );

        setLoading(false);
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

                <Button label="Sign Up" loading={loading} onClick={handleSignup} />
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
