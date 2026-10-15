"use client";

import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/Toast";
import { errorMessageKey } from "@/lib/api/error-message-key";
import { retryAfterSeconds } from "@/lib/api/error-kind";
import { ApiRequestError } from "@/lib/api/errors";

export function useErrorToast() {
  const toast = useToast();
  const t = useTranslations("errors");

  return (error: unknown) => {
    if (error instanceof ApiRequestError && error.code === "RATE_LIMITED") {
      toast.error(t("RATE_LIMITED_RETRY", { seconds: retryAfterSeconds(error) }));
    } else {
      toast.error(t(errorMessageKey(error)));
    }
  };
}
