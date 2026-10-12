"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { useProducts } from "@/hooks/useProducts";
import { errorMessageKey } from "@/lib/api/error-message-key";
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

      {isPending && (
        <ul className="flex flex-col gap-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-28 animate-pulse rounded-2xl bg-tag" />
          ))}
        </ul>
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

      {products && products.length === 0 && <p className="text-muted">{t("home.empty")}</p>}

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
