import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Suspense, use } from "react";
import { ProductList } from "@/components/features/ProductList";
import { SideProductList } from "@/components/features/SideProductList";
import { TrendingTopics } from "@/components/features/TrendingTopics";

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");

  return (
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
  );
}
