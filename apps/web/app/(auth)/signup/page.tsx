import { Box, Heading } from "@chakra-ui/react";
import { SignupForm } from "@/components/forms/signupForm";

export default function SignupPage() {
    return (
        <Box
            padding={5}
            className="grid w-screen grid-cols-2 h-screen items-center">
            <section className="col-span-1 bg-zinc-800 h-full w-full rounded-xl">
                {/* Carousel */}
            </section>
            <section className="col-span-1">
                <SignupForm />
            </section>
        </Box>
    );
}
