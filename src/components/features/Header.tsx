import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-6 py-3">
        <Logo />
        <nav className="flex items-center gap-6 text-[15px] font-semibold">
          <Link href="/">{t("products")}</Link>
          <Link href="/categories">{t("categories")}</Link>
          <Link href="/about">{t("about")}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
