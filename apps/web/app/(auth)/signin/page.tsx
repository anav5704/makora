import { redirect } from "next/navigation";
import { SigninForm } from "@/components/forms/signinForm";
import { getSession } from "@/lib/session";

export default async function SignupPage() {
    const session = await getSession()

    if (session) redirect("/dashboard");

    return <SigninForm />;
}
