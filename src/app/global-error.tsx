"use client";

import en from "../../messages/en.json";
import ptBR from "../../messages/pt-BR.json";
import "@/styles/globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isPt = typeof window !== "undefined" && window.location.pathname.startsWith("/pt-BR");
  const messages = isPt ? ptBR : en;

  return (
    <html lang={isPt ? "pt-BR" : "en"}>
      <body className="flex min-h-screen items-center justify-center">
        <div
          role="alert"
          className="mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center"
        >
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            {messages.errorScreens.serverError}
          </h1>
          <p className="text-muted">{messages.errors.INTERNAL_ERROR}</p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-xl border border-border-strong px-5 text-[15px] font-semibold"
          >
            {messages.common.tryAgain}
          </button>
          {error.digest && (
            <p className="text-xs text-muted">
              {messages.common.requestId.replace("{id}", error.digest)}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
