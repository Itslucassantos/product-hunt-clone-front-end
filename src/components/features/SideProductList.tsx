"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProducts } from "@/hooks/useProducts";
import { Link } from "@/i18n/navigation";
import { ProductImage } from "./ProductImage";
import { StarRating } from "./StarRating";

type SideProductListProps = {
  title: string;
  filters: Parameters<typeof useProducts>[0];
  showRating?: boolean;
  dashed?: boolean;
};

export function SideProductList({
  title,
  filters,
  showRating = false,
  dashed = false,
}: SideProductListProps) {
  const t = useTranslations();
  const { data: products, isPending, isError, error, refetch } = useProducts(filters);
  const headingId = `side-${title.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2 id={headingId} className="font-display text-xl font-extrabold">
        {title}
      </h2>

      {isPending && (
        <Skeleton
          label={t("common.loadingProducts")}
          count={2}
          listClassName="flex flex-col gap-4"
          itemClassName="h-10 rounded-xl"
        />
      )}

      {isError && <ErrorState error={error} onRetry={() => refetch()} />}

      {products && products.length === 0 && <p className="text-sm text-muted">{t("home.empty")}</p>}

      {products && products.length > 0 && (
        <ul className="flex flex-col gap-4">
          {products.map((product) => (
            <li key={product.id} className="flex items-start gap-3">
              <ProductImage
                id={product.id}
                src={product.imageUrl}
                title={product.title}
                size={40}
                dashed={dashed}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Link
                  href={`/products/${product.id}`}
                  className="font-semibold leading-tight hover:underline"
                >
                  {product.title}
                </Link>
                <p className="text-sm text-muted">{product.description}</p>
                {showRating && product.review && (
                  <div className="mt-0.5 flex items-center gap-2">
                    <StarRating rating={product.review.rating} />
                    <span className="text-xs font-semibold text-ink-soft">
                      {t("home.rating", { rating: product.review.rating })}
                    </span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
