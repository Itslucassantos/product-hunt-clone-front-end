"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const OPTIONS = [
  { locale: "en", label: "EN" },
  { locale: "pt-BR", label: "PT" },
] as const;

export function LanguageSwitcher() {
  const t = useTranslations("header");
  const currentLocale = useLocale();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="flex h-11 items-center gap-1 rounded-xl bg-tag p-1"
    >
      {OPTIONS.map(({ locale, label }) => {
        const active = locale === currentLocale;
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            lang={locale}
            hrefLang={locale}
            aria-current={active ? "true" : undefined}
            className={`flex h-full items-center rounded-[10px] border px-3 text-sm font-semibold ${
              active ? "border-border bg-surface text-ink" : "border-transparent text-muted"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
