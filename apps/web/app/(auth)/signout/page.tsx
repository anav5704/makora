import { auth } from "@makora/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SignoutPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) redirect("/signin");

    await auth.api.signOut({
        headers: await headers(),
    });

    redirect("/signin");
}
