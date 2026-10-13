import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { AdminProductsView } from "@/components/features/AdminProductsView";

export default function AdminProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  return <AdminProductsView />;
}
