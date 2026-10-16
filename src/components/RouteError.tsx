"use client";

import { ApiRequestError } from "@/lib/api/errors";
import { ErrorState } from "./ui/ErrorState";

export function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      page
      error={new ApiRequestError("INTERNAL_ERROR", 500, null)}
      onRetry={reset}
      digest={error.digest}
    />
  );
}
