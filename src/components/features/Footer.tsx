import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-2 px-6 py-6 text-sm text-muted">
        <span className="font-display font-extrabold text-ink">{t("common.appName")}</span>
        <span>{t("footer.tagline")}</span>
      </div>
    </footer>
  );
}
