"use client";

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/api/root";

let client: ReturnType<typeof createTRPCProxyClient<AppRouter>> | null = null;

export function getTRPCClient() {
  if (!client) {
    client = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    });
  }

  return client;
}
