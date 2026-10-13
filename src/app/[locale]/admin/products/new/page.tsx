import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { ProductForm } from "@/components/features/ProductForm";

export default function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  return <ProductForm />;
}
