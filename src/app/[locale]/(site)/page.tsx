import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ProductList } from "@/components/features/ProductList";
import { SideProductList } from "@/components/features/SideProductList";
import { TrendingTopics } from "@/components/features/TrendingTopics";
import { productsQuery, topicsQuery } from "@/lib/api/queries";
import { getQueryClient } from "@/lib/get-query-client";
import type { Locale } from "@/types/api";

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const { locale } = await params;
  const { topic } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(topicsQuery(locale as Locale)),
    queryClient.prefetchQuery(productsQuery(locale as Locale, { topic })),
    queryClient.prefetchQuery(productsQuery(locale as Locale, { reviewed: true })),
    queryClient.prefetchQuery(productsQuery(locale as Locale, { status: "coming-soon" })),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-10">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">{t("title")}</h1>
        <div className="flex flex-wrap items-start gap-10">
          <div className="flex min-w-0 grow-[999] basis-[520px] flex-col gap-10">
            <Suspense>
              <TrendingTopics />
              <ProductList />
            </Suspense>
          </div>
          <aside className="flex grow basis-[320px] flex-col gap-8 rounded-2xl border border-border bg-surface p-6">
            <SideProductList title={t("reviewed")} filters={{ reviewed: true }} showRating />
            <hr className="border-border" />
            <SideProductList title={t("comingSoon")} filters={{ status: "coming-soon" }} dashed />
          </aside>
        </div>
      </div>
    </HydrationBoundary>
  );
}
