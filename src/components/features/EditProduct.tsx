"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProduct } from "@/hooks/useProduct";
import { Link } from "@/i18n/navigation";
import { ApiRequestError } from "@/lib/api/errors";
import { ProductForm } from "./ProductForm";

export function EditProduct({ id }: { id: string }) {
  const t = useTranslations("admin.form");
  const product = useProduct(id);

  if (product.isPending) return <Skeleton label={t("loading")} count={2} height="h-64" />;

  if (product.isError) {
    if (product.error instanceof ApiRequestError && product.error.status === 404) {
      return (
        <div className="flex flex-col items-start gap-3">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">{t("notFound")}</h1>
          <Link href="/admin/products" className="font-semibold underline">
            {t("back")}
          </Link>
        </div>
      );
    }
    return <ErrorState error={product.error} onRetry={() => product.refetch()} />;
  }

  return <ProductForm product={product.data} />;
}
