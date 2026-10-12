import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { use } from "react";
import { AboutCta } from "@/components/features/AboutCta";

const STEPS = ["publish", "vote", "reorder"] as const;

const STACK = {
  frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "TanStack Query", "next-intl"],
  backend: ["Express", "TypeScript", "Prisma", "PostgreSQL", "Redis", "Zod", "Vitest"],
  shared: ["Clerk", "Hexagonal architecture"],
} as const;

function Pills({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-tag px-3 py-1 text-sm font-semibold text-ink-soft"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("about");

  return (
    <div className="flex flex-col gap-12">
      <div className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">{t("title")}</h1>
        <p className="text-lg text-ink-soft">{t("intro")}</p>
      </div>

      <section aria-labelledby="how-it-works" className="flex flex-col gap-4">
        <h2 id="how-it-works" className="font-display text-2xl font-extrabold">
          {t("howItWorks")}
        </h2>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-6"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-display text-lg font-extrabold text-white"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <h3 className="font-display text-lg font-extrabold">{t(`steps.${step}.title`)}</h3>
              <p className="text-muted">{t(`steps.${step}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="portfolio" className="flex flex-col gap-4">
        <h2 id="portfolio" className="font-display text-2xl font-extrabold">
          {t("portfolio.title")}
        </h2>
        <p className="max-w-3xl text-ink-soft">{t("portfolio.text")}</p>
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
          {(["frontend", "backend", "shared"] as const).map((group) => (
            <div key={group} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-muted">{t(`portfolio.${group}`)}</h3>
              <Pills items={STACK[group]} />
            </div>
          ))}
        </div>
      </section>

      <AboutCta />
    </div>
  );
}
