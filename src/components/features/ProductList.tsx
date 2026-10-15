"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProducts } from "@/hooks/useProducts";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "./ProductCard";

export function ProductList() {
  const t = useTranslations();
  const topic = useSearchParams().get("topic") ?? undefined;
  const { data: products, isPending, isError, error, refetch } = useProducts({ topic });

  return (
    <section aria-labelledby="products" className="flex flex-col gap-3">
      <h2 id="products" className="font-display text-xl font-extrabold">
        {t("home.products")}
      </h2>

      {isPending && <Skeleton label={t("common.loadingProducts")} />}

      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {products && products.length === 0 && (
        <EmptyState
          title={t("home.emptyTitle")}
          text={topic ? t("home.emptyTopic") : t("home.empty")}
          action={
            topic && (
              <Link href="/" className="mt-2 font-semibold underline">
                {t("home.showAll")}
              </Link>
            )
          }
        />
      )}

      {products && products.length > 0 && (
        <ul className="flex flex-col gap-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ul>
      )}
    </section>
  );
}
