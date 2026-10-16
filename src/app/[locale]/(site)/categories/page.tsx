import { titleFrom } from "@/lib/metadata";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CategoriesView } from "@/components/features/CategoriesView";
import { productsQuery, topicsQuery } from "@/lib/api/queries";
import { getQueryClient } from "@/lib/get-query-client";
import type { Locale } from "@/types/api";

export default async function CategoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const { locale } = await params;
  const { topic } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("categories");

  const queryClient = getQueryClient();
  const topics = await queryClient.fetchQuery(topicsQuery(locale as Locale)).catch(() => null);
  const selected = topics?.find((item) => item.slug === topic) ?? topics?.[0];
  if (selected) {
    await queryClient.prefetchQuery(productsQuery(locale as Locale, { topic: selected.slug }));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-5xl font-extrabold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-muted">{t("subtitle")}</p>
        </div>
        <Suspense>
          <CategoriesView />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}

export const generateMetadata = titleFrom("categories", "title");
