import { adminTitleFrom } from "@/lib/metadata";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { EditProduct } from "@/components/features/EditProduct";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = use(params);
  setRequestLocale(locale);
  return <EditProduct id={id} />;
}

export const generateMetadata = adminTitleFrom("form.editTitle");
