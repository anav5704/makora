import { redirect } from "next/navigation";
import { SignupForm } from "@/components/forms/signupForm";
import { getSession } from "@/lib/session";

export default async function SignupPage() {
  const session = await getSession()

    if (session) redirect("/dashboard");

    return <SignupForm />;
}
