"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProducts } from "@/hooks/useProducts";
import { useTopics } from "@/hooks/useTopics";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { CategoryCard } from "./CategoryCard";
import { ProductCard } from "./ProductCard";

export function CategoriesView() {
  const t = useTranslations("categories");
  const tCommon = useTranslations();
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
        <Skeleton
          label={tCommon("common.loadingTopics")}
          count={3}
          listClassName="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4"
          itemClassName="h-40 rounded-2xl"
        />
      )}

      {topics.isError && <ErrorState error={topics.error} onRetry={() => topics.refetch()} />}

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

          {products.isPending && <Skeleton label={tCommon("common.loadingProducts")} />}

          {products.isError && (
            <ErrorState error={products.error} onRetry={() => products.refetch()} />
          )}

          {products.data && products.data.length === 0 && (
            <EmptyState
              title={t("emptyTitle")}
              text={t("noProducts")}
              action={
                <Link href="/" className="mt-2 font-semibold underline">
                  {tCommon("home.showAll")}
                </Link>
              }
            />
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
