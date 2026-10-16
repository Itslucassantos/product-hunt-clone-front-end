import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { setRequestLocale } from "next-intl/server";
import { ProductView } from "@/components/features/ProductView";
import { productQuery, productsQuery } from "@/lib/api/queries";
import { getQueryClient } from "@/lib/get-query-client";
import type { Locale } from "@/types/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await getQueryClient()
    .fetchQuery(productQuery(locale as Locale, id))
    .catch(() => null);
  if (!product) return {};

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      ...(product.imageUrl && { images: [product.imageUrl] }),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const queryClient = getQueryClient();
  const product = await queryClient
    .fetchQuery(productQuery(locale as Locale, id))
    .catch(() => null);
  await Promise.all(
    (product?.topics ?? []).map((topic) =>
      queryClient.prefetchQuery(productsQuery(locale as Locale, { topic: topic.slug })),
    ),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductView id={id} />
    </HydrationBoundary>
  );
}
