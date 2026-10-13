"use client";

import { useTranslations } from "next-intl";
import { errorMessageKey } from "@/lib/api/error-message-key";
import { ApiRequestError } from "@/lib/api/errors";
import { Button } from "./Button";

export function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const t = useTranslations();
  const requestId = error instanceof ApiRequestError ? error.requestId : null;

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-2xl border border-danger bg-surface p-5"
    >
      <p className="font-semibold text-danger">{t(`errors.${errorMessageKey(error)}`)}</p>
      <Button variant="secondary" onClick={onRetry}>
        {t("common.tryAgain")}
      </Button>
      {requestId && (
        <p className="text-xs text-muted">{t("common.requestId", { id: requestId })}</p>
      )}
    </div>
  );
}
