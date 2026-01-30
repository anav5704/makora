"use client"

import { AccountCard } from "@/components/accountCard";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/trpc";
import { useModalStore } from "@/stores/modalStore";
import { useQuery } from "@tanstack/react-query";

export default function SettingsPage() {
    const { data, isLoading } = useQuery(api.user.getAccounts.queryOptions())
    const { openModal } = useModalStore()

  return (
    <main className="divide-y divide-x divide-zinc-800">
        {isLoading ? (
            <Loader />
        ) : (
            <>
                <header className="z-10 sticky top-0 bg-zinc-900 border-b border-zinc-800">
                    <section className="grid grid-cols-5 gap-5 p-5">
                      <Button className="border col-start-5" variant="outline" label="Add Account" loading={false} onClick={() => openModal("addAccount")} />
                    </section>
                </header>

            <section className="grid grid-cols-4 p-5 gap-5">
              {data?.map((account) => (
                  // @ts-expect-error
                  <AccountCard key={account.id} account={account} />
                ))}
            </section>
            </>
        )}
    </main>
      )
}
