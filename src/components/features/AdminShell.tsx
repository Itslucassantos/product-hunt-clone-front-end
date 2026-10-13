"use client";

import { UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { AdminGuard } from "./AdminGuard";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations("admin");
  const pathname = usePathname();

  const tabs = [
    { href: "/admin/products", label: t("tabs.products") },
    { href: "/admin/topics", label: t("tabs.topics") },
  ];

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-admin flex-wrap items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
              {t("badge")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserButton
              appearance={{ elements: { avatarBox: { width: "2.75rem", height: "2.75rem" } } }}
            />
          </div>
        </div>
        <nav aria-label={t("navLabel")} className="mx-auto flex max-w-admin gap-6 px-6">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-[52px] items-center border-b-[3px] text-[15px] font-semibold ${
                  active ? "border-primary text-ink" : "border-transparent text-muted"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="ml-auto flex h-[52px] items-center text-[15px] font-semibold text-muted"
          >
            {t("tabs.viewSite")}
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-admin flex-1 px-6 py-10">
        <AdminGuard>{children}</AdminGuard>
      </main>
    </>
  );
}
