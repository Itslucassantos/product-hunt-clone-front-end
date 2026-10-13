"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useAuthToken } from "@/hooks/useAuthToken";
import { Link } from "@/i18n/navigation";
import { deleteProduct } from "@/lib/api/endpoints";
import { errorMessageKey } from "@/lib/api/error-message-key";
import type { AdminProduct } from "@/types/api";
import { ProductImage } from "./ProductImage";
import { StarRating } from "./StarRating";

type Filter = "all" | "published" | "comingSoon" | "reviewed";

const FILTERS: Record<Filter, (p: AdminProduct) => boolean> = {
  all: () => true,
  published: (p) => p.status === "PUBLISHED",
  comingSoon: (p) => p.status === "COMING_SOON",
  reviewed: (p) => p.review !== null,
};

const NEW_LINK_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-[15px] font-semibold text-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-24 flex-col gap-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm font-semibold">{children}</dd>
    </div>
  );
}

export function AdminProductsView() {
  const t = useTranslations("admin.products");
  const tError = useTranslations("errors");
  const tHome = useTranslations("home");
  const toast = useToast();
  const queryClient = useQueryClient();
  const getAuthToken = useAuthToken();
  const products = useAdminProducts();
  const [filter, setFilter] = useState<Filter>("all");
  const [toDelete, setToDelete] = useState<AdminProduct | null>(null);

  const remove = useMutation({
    mutationFn: async (id: string) => deleteProduct(id, await getAuthToken()),
    onSuccess: () => {
      toast.success(t("deleted", { name: toDelete?.title ?? "" }));
      setToDelete(null);
    },
    onError: (error) => {
      toast.error(tError(errorMessageKey(error)));
      setToDelete(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
  const all = products.data ?? [];
  const visible = all.filter(FILTERS[filter]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">{t("title")}</h1>
        <Link href="/admin/products/new" className={NEW_LINK_CLASS}>
          {t("new")}
        </Link>
      </div>

      <div role="group" aria-label={t("filters")} className="flex flex-wrap gap-2">
        {(Object.keys(FILTERS) as Filter[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${
              filter === key ? "border-primary bg-primary text-white" : "border-border-strong"
            }`}
          >
            {t(`filter.${key}`)} ({all.filter(FILTERS[key]).length})
          </button>
        ))}
      </div>

      {products.isPending && <Skeleton label={t("loading")} />}
      {products.isError && <ErrorState error={products.error} onRetry={() => products.refetch()} />}

      {products.data && visible.length === 0 && (
        <EmptyState
          title={t("emptyTitle")}
          text={t("emptyText")}
          action={
            <Link href="/admin/products/new" className={NEW_LINK_CLASS}>
              {t("new")}
            </Link>
          }
        />
      )}

      {visible.length > 0 && (
        <ul className="flex flex-col gap-3">
          {visible.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex min-w-0 flex-1 basis-60 items-center gap-4">
                <ProductImage
                  id={product.id}
                  src={product.imageUrl}
                  title={product.title}
                  size={64}
                  dashed={product.status === "COMING_SOON"}
                />
                <div className="min-w-0">
                  <Link
                    href={`/products/${product.id}`}
                    className="block truncate font-display text-lg font-extrabold hover:underline"
                  >
                    {product.title}
                  </Link>
                  <p className="line-clamp-2 text-sm text-ink-soft">{product.description}</p>
                </div>
              </div>

              <dl className="flex flex-wrap gap-x-6 gap-y-3">
                <Field label={t("topics")}>
                  {product.topics.map((topic) => topic.name).join(", ")}
                </Field>
                <Field label={t("status")}>
                  <StatusBadge
                    status={product.status}
                    label={
                      product.status === "PUBLISHED" ? t("filter.published") : tHome("comingSoon")
                    }
                  />
                </Field>
                <Field label={t("review")}>
                  {product.review ? (
                    <span className="flex items-center gap-2">
                      <StarRating rating={product.review.rating} />
                      {tHome("rating", { rating: product.review.rating })}
                    </span>
                  ) : (
                    <span className="text-muted">{t("noReview")}</span>
                  )}
                </Field>
                <Field label={t("votes")}>{product.upvotes}</Field>
              </dl>

              <div className="flex gap-2">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  aria-label={t("editLabel", { name: product.title })}
                  className="inline-flex min-h-11 items-center rounded-xl border border-border-strong px-4 text-[15px] font-semibold"
                >
                  {t("edit")}
                </Link>
                <button
                  type="button"
                  onClick={() => setToDelete(product)}
                  aria-label={t("deleteLabel", { name: product.title })}
                  className="inline-flex min-h-11 items-center rounded-xl px-4 text-[15px] font-semibold text-danger"
                >
                  {t("delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={t("deleteTitle", { name: toDelete?.title ?? "" })}
        description={
          toDelete?.review
            ? t("deleteBodyReview", { votes: toDelete.upvotes })
            : t("deleteBody", { votes: toDelete?.upvotes ?? 0 })
        }
        cancelLabel={t("cancel")}
        confirmLabel={t("delete")}
        loading={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </div>
  );
}
