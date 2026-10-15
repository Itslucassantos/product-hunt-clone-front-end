import { adminTitleFrom } from "@/lib/metadata";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { AdminTopicsView } from "@/components/features/AdminTopicsView";

export default function AdminTopicsPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  return <AdminTopicsView />;
}

export const generateMetadata = adminTitleFrom("topics.title");
