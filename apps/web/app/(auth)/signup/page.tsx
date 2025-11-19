import { auth } from "@makora/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/forms/signupForm";

export default async function SignupPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user) redirect("/dashboard");

    return <SignupForm />;
}
