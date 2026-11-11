import type { AppRouter } from "@makora/api/routers/index";
import { MutationCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

const mutationErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
    }

    return "Something went wrong";
};

export const queryClient = new QueryClient({
    mutationCache: new MutationCache({
        onError: (error) => {
            toast.error(mutationErrorMessage(error));
        },
    }),
});

const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `${process.env.NEXT_PUBLIC_API_URL ?? ""}/trpc`,
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: "include",
                });
            },
        }),
    ],
});

const api = createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient,
});

export { api };
