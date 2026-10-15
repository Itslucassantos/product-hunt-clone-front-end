"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTopics } from "@/hooks/useTopics";
import { Link } from "@/i18n/navigation";

const CHIP = "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold";

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
        <Skeleton
          label={t("common.loadingTopics")}
          count={5}
          listClassName="flex gap-2"
          itemClassName="h-11 w-24 rounded-full"
        />
      )}

      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

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
