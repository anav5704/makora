import { auth } from "@makora/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function SignoutPage() {
    const session = await getSession();

    if (!session) redirect("/signin");

    await auth.api.signOut({
        headers: await headers(),
    });

    redirect("/signin");
}
