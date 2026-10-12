"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { useProducts } from "@/hooks/useProducts";
import { useTopics } from "@/hooks/useTopics";
import { usePathname, useRouter } from "@/i18n/navigation";
import { errorMessageKey } from "@/lib/api/error-message-key";
import { CategoryCard } from "./CategoryCard";
import { ProductCard } from "./ProductCard";

function RetryAlert({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-start gap-2">
      <Alert>{t(`errors.${errorMessageKey(error)}`)}</Alert>
      <button type="button" onClick={onRetry} className="text-sm font-semibold underline">
        {t("common.tryAgain")}
      </button>
    </div>
  );
}

export function CategoriesView() {
  const t = useTranslations("categories");
  const router = useRouter();
  const pathname = usePathname();
  const topicParam = useSearchParams().get("topic");
  const topics = useTopics();

  const selected = topics.data?.find((topic) => topic.slug === topicParam) ?? topics.data?.[0];
  const products = useProducts({ topic: selected?.slug });

  const select = (slug: string) =>
    router.replace({ pathname, query: { topic: slug } }, { scroll: false });

  return (
    <div className="flex flex-col gap-10">
      {topics.isPending && (
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4"
          aria-hidden="true"
        >
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-tag" />
          ))}
        </div>
      )}

      {topics.isError && <RetryAlert error={topics.error} onRetry={() => topics.refetch()} />}

      {topics.data && topics.data.length === 0 && <p className="text-muted">{t("empty")}</p>}

      {topics.data && topics.data.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
          {topics.data.map((topic) => (
            <CategoryCard
              key={topic.id}
              topic={topic}
              selected={topic.id === selected?.id}
              countLabel={t("productCount", { count: topic.productCount })}
              onSelect={() => select(topic.slug)}
            />
          ))}
        </div>
      )}

      {selected && (
        <section aria-labelledby="most-voted" className="flex flex-col gap-3">
          <h2 id="most-voted" className="font-display text-2xl font-extrabold">
            {t("mostVoted", { topic: selected.name })}
          </h2>

          {products.isPending && (
            <ul className="flex flex-col gap-3" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-28 animate-pulse rounded-2xl bg-tag" />
              ))}
            </ul>
          )}

          {products.isError && (
            <RetryAlert error={products.error} onRetry={() => products.refetch()} />
          )}

          {products.data && products.data.length === 0 && (
            <p className="text-muted">{t("noProducts")}</p>
          )}

          {products.data && products.data.length > 0 && (
            <ul className="flex flex-col gap-3">
              {products.data.map((product) => (
                <ProductCard key={product.id} product={product} votes="count" />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
