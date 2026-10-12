"use client";

import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const BUTTON = "inline-flex min-h-11 items-center rounded-xl px-5 text-[15px] font-semibold";

export function AboutCta() {
  const t = useTranslations("about.cta");
  const { isSignedIn } = useAuth();

  return (
    <section className="flex flex-col items-start gap-4 rounded-2xl bg-primary p-8 text-white">
      <h2 className="font-display text-3xl font-extrabold">{t("title")}</h2>
      <p className="max-w-xl text-white/85">{t("text")}</p>
      <div className="flex flex-wrap gap-3">
        {!isSignedIn && (
          <Link href="/sign-up" className={`${BUTTON} bg-white text-[#15161B]`}>
            {t("signUp")}
          </Link>
        )}
        <Link href="/" className={`${BUTTON} border border-white/60 text-white`}>
          {t("viewProducts")}
        </Link>
      </div>
    </section>
  );
}
