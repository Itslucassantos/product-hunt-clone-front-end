import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Suspense, use } from "react";
import { CategoriesView } from "@/components/features/CategoriesView";

export default function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("categories");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">{t("title")}</h1>
        <p className="text-lg text-muted">{t("subtitle")}</p>
      </div>
      <Suspense>
        <CategoriesView />
      </Suspense>
    </div>
  );
}
