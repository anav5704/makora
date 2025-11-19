import { auth } from "@makora/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/forms/onboardingForm";

export default async function OnboardingPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) redirect("/signin");

    // @ts-expect-error
    if (session?.session.boarded) redirect("/dashboard");

    return <OnboardingForm />;
}
