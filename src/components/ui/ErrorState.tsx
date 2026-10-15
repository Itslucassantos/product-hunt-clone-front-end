"use client";

import { useTranslations } from "next-intl";
import { useRateLimit } from "@/components/RateLimit";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { errorKind } from "@/lib/api/error-kind";
import { errorMessageKey } from "@/lib/api/error-message-key";
import { ApiRequestError } from "@/lib/api/errors";
import { Button } from "./Button";

type ErrorStateProps = {
  error: unknown;
  onRetry?: () => void;
  page?: boolean;
  digest?: string;
};

export function ErrorState({ error, onRetry, page = false, digest }: ErrorStateProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { limited, secondsLeft } = useRateLimit();
  const kind = errorKind(error);
  const requestId = (error instanceof ApiRequestError ? error.requestId : null) ?? digest;

  const needsLogin = kind === "unauthenticated" || kind === "sessionExpired";
  const canRetry = onRetry && !needsLogin && kind !== "forbidden" && kind !== "notFound";
  const message =
    kind === "notFound" && page
      ? t("errorScreens.notFoundText")
      : t(`errors.${errorMessageKey(error)}`);

  const logIn = () =>
    router.push({
      pathname: "/sign-in",
      query: { redirect_url: `${pathname}${window.location.search}` },
    });

  return (
    <div
      role="alert"
      className={
        page
          ? "mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center"
          : "flex flex-col items-start gap-3 rounded-2xl border border-danger bg-surface p-5"
      }
    >
      {page ? (
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          {t(`errorScreens.${kind}`)}
        </h1>
      ) : (
        <p className="font-semibold text-danger">{t(`errorScreens.${kind}`)}</p>
      )}
      <p className={page ? "text-muted" : "text-sm text-ink-soft"}>{message}</p>

      <div className="flex flex-wrap gap-2">
        {needsLogin && <Button onClick={logIn}>{t("nav.logIn")}</Button>}
        {canRetry && (
          <Button variant="secondary" onClick={onRetry} disabled={limited}>
            {limited ? t("common.retryIn", { seconds: secondsLeft }) : t("common.tryAgain")}
          </Button>
        )}
        {(page || kind === "forbidden" || kind === "notFound") && (
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-xl border border-border-strong px-5 text-[15px] font-semibold"
          >
            {t("common.backToProducts")}
          </Link>
        )}
      </div>

      {requestId && (
        <p className="text-xs text-muted">{t("common.requestId", { id: requestId })}</p>
      )}
    </div>
  );
}
