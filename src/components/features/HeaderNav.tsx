"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const ITEMS = [
  {
    href: "/",
    key: "products",
    match: (path: string) => path === "/" || path.startsWith("/products"),
  },
  {
    href: "/categories",
    key: "categories",
    match: (path: string) => path.startsWith("/categories"),
  },
  { href: "/about", key: "about", match: (path: string) => path.startsWith("/about") },
] as const;

export function HeaderNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6 text-[15px] font-semibold">
      {ITEMS.map(({ href, key, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center border-b-2 ${
              active ? "border-primary text-ink" : "border-transparent text-muted"
            }`}
          >
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
