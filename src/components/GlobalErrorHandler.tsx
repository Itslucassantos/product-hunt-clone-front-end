"use client";

import { useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { onApiError } from "@/lib/api/error-bus";
import { retryAfterSeconds } from "@/lib/api/error-kind";
import { ApiRequestError } from "@/lib/api/errors";
import { useRateLimit } from "./RateLimit";
import { useToast } from "./ui/Toast";

export function GlobalErrorHandler() {
  const t = useTranslations("errors");
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useClerk();
  const toast = useToast();
  const { start: startRateLimit } = useRateLimit();
  const redirecting = useRef(false);

  useEffect(() => {
    redirecting.current = false;
  }, [pathname]);

  useEffect(() => {
    return onApiError((error, source) => {
      if (!(error instanceof ApiRequestError)) return;

      if (error.code === "RATE_LIMITED") {
        const seconds = retryAfterSeconds(error);
        startRateLimit(seconds);
        if (source === "query") toast.error(t("RATE_LIMITED_RETRY", { seconds }));
        return;
      }

      if (error.code === "UNAUTHENTICATED" || error.code === "SESSION_EXPIRED") {
        if (redirecting.current || pathname.startsWith("/sign-")) return;
        redirecting.current = true;
        const query: Record<string, string> = {
          redirect_url: `${pathname}${window.location.search}`,
        };
        if (error.code === "SESSION_EXPIRED") query.reason = "session-expired";
        void signOut(() => router.replace({ pathname: "/sign-in", query }));
      }
    });
  }, [pathname, startRateLimit, router, signOut, t, toast]);

  return null;
}
