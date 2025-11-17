"use client";

import {
    Button,
    Center,
    Field,
    Fieldset,
    Heading,
    Input,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { toaster } from "@/components/ui/toaster";
import { authClient } from "@/lib/auth";

export const SignupForm = () => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        await authClient.signUp.email(
            {
                name,
                email,
                password,
            },
            {
                onSuccess: () => {
                    toaster.create({
                        description: "Account successfuly created",
                        type: "success",
                    });
                },
                onError: (error) => {
                    console.log(error);

                    toaster.create({
                        description: "Error: could not create account",
                        type: "error",
                    });
                },
            },
        );

        setLoading(false);
    };

    return (
        <>
            <Heading
                textAlign="center"
                marginBottom={5}
                fontWeight="bold"
                size="4xl">
                Create Account
            </Heading>
            <Center>
                <Fieldset.Root size="lg" maxW="lg">
                    <Field.Root>
                        <Field.Label>Name</Field.Label>
                        <Input
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Field.Root>
                    <Field.Root>
                        <Field.Label>Email</Field.Label>
                        <Input
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Field.Root>
                    <Field.Root>
                        <Field.Label>Password</Field.Label>
                        <PasswordInput
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Field.Root>

                    <Button
                        onClick={handleSignup}
                        loading={loading}
                        disabled={loading}>
                        Register
                    </Button>
                </Fieldset.Root>
            </Center>
        </>
    );
};
