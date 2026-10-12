"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { useTopics } from "@/hooks/useTopics";
import { Link } from "@/i18n/navigation";
import { errorMessageKey } from "@/lib/api/error-message-key";

const CHIP = "inline-flex min-h-9 items-center rounded-full px-4 text-sm font-semibold";

export function TrendingTopics() {
  const t = useTranslations();
  const selected = useSearchParams().get("topic");
  const { data: topics, isPending, isError, error, refetch } = useTopics();

  return (
    <section aria-labelledby="trending-topics" className="flex flex-col gap-3">
      <h2 id="trending-topics" className="font-display text-xl font-extrabold">
        {t("home.trending")}
      </h2>

      {isPending && (
        <div className="flex gap-2" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-9 w-24 animate-pulse rounded-full bg-tag" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-start gap-2">
          <Alert>{t(`errors.${errorMessageKey(error)}`)}</Alert>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-semibold underline"
          >
            {t("common.tryAgain")}
          </button>
        </div>
      )}

      {topics && (
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/"
              aria-current={selected === null ? "true" : undefined}
              className={`${CHIP} ${selected === null ? "bg-primary text-white" : "bg-tag text-ink"}`}
            >
              {t("home.allTopics")}
            </Link>
          </li>
          {topics.map((topic) => (
            <li key={topic.id}>
              <Link
                href={{ pathname: "/", query: { topic: topic.slug } }}
                aria-current={selected === topic.slug ? "true" : undefined}
                className={`${CHIP} gap-2 ${selected === topic.slug ? "bg-primary text-white" : "bg-tag text-ink"}`}
              >
                {topic.name}
                <span className="text-xs opacity-70">{topic.productCount}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
