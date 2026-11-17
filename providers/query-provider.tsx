"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { ApiError, setUnauthorizedHandler } from "@/lib/api-client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // lists feel instant on back/forward; refetch quietly after 30s
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => !(error instanceof ApiError && error.status < 500) && failureCount < 2,
      },
      mutations: { retry: false },
    },
    queryCache: new QueryCache(),
    mutationCache: new MutationCache(),
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const qc = makeQueryClient();
    setUnauthorizedHandler(() => {
      qc.clear();
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      // Deliberately a full navigation: it drops every in-memory cache and component state.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?next=${next}&reason=expired`);
    });
    return qc;
  });

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
