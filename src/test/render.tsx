import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { RateLimitProvider } from "@/components/RateLimit";
import { ToastProvider } from "@/components/ui/Toast";
import messages from "../../messages/en.json";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

export function renderWithProviders(ui: ReactElement, queryClient = createTestQueryClient()) {
  const result = render(
    <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
      <QueryClientProvider client={queryClient}>
        <RateLimitProvider>
          <ToastProvider>{ui}</ToastProvider>
        </RateLimitProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
  return { ...result, queryClient };
}
