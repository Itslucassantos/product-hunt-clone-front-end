import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { ProductView } from "@/components/features/ProductView";

export default function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = use(params);
  setRequestLocale(locale);

  return <ProductView id={id} />;
}
