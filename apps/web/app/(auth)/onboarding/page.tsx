import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/forms/onboardingForm";
import { getSession } from "@/lib/session";

export default async function OnboardingPage() {
    const session = await getSession();

    if (!session) redirect("/signin");

    // @ts-expect-error
    if (session?.user.boarded) redirect("/dashboard");

    return <OnboardingForm />;
}
