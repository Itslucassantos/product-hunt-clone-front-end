"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export function AuthButtons() {
  const t = useTranslations("nav");
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();

  if (!isLoaded) return null;

  if (isSignedIn) {
    return (
      <Button variant="secondary" onClick={() => signOut()}>
        {t("logOut")}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/sign-in"
        className="inline-flex min-h-11 items-center rounded-xl border border-border-strong px-4 text-[15px] font-semibold"
      >
        {t("logIn")}
      </Link>
      <Link
        href="/sign-up"
        className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-[15px] font-semibold text-white"
      >
        {t("signUp")}
      </Link>
    </div>
  );
}
