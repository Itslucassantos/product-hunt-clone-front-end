"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";
import { emitApiError } from "@/lib/api/error-bus";
import { ApiRequestError } from "@/lib/api/errors";
import { BackendUserSync } from "./BackendUserSync";
import { GlobalErrorHandler } from "./GlobalErrorHandler";
import { RateLimitProvider } from "./RateLimit";
import { ToastProvider } from "./ui/Toast";

const MAX_RETRIES = 2;

function shouldRetry(failureCount: number, error: Error) {
  const clientError =
    error instanceof ApiRequestError && error.status !== null && error.status < 500;
  return !clientError && failureCount < MAX_RETRIES;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: (error) => emitApiError(error, "query") }),
        mutationCache: new MutationCache({
          onError: (error) => emitApiError(error, "mutation"),
        }),
        defaultOptions: {
          queries: { staleTime: 10_000, refetchOnWindowFocus: false, retry: shouldRetry },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RateLimitProvider>
            <GlobalErrorHandler />
            <BackendUserSync />
            {children}
          </RateLimitProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
