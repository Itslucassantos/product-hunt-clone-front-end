"use client";

import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { useEffect, type ReactNode } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMe } from "@/hooks/useMe";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiRequestError } from "@/lib/api/errors";

export function AdminGuard({ children }: { children: ReactNode }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const me = useMe();

  const forbidden =
    (me.data && me.data.role !== "ADMIN") ||
    (me.error instanceof ApiRequestError && me.error.code === "FORBIDDEN");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace({ pathname: "/sign-in", query: { redirect_url: pathname } });
    } else if (forbidden) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, forbidden, router, pathname]);

  if (me.isError && !forbidden) {
    return <ErrorState error={me.error} onRetry={() => me.refetch()} />;
  }

  if (me.data?.role !== "ADMIN") return <Skeleton label={t("checking")} count={2} />;

  return <>{children}</>;
}
