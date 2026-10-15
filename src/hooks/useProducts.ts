"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { productsQuery, type ProductFilters } from "@/lib/api/queries";
import type { Locale, ProductListItem } from "@/types/api";

export function useProducts(filters: ProductFilters = {}) {
  const locale = useLocale() as Locale;

  return useQuery(productsQuery(locale, filters));
}

export function useProductsByTopics(slugs: string[]) {
  const locale = useLocale() as Locale;

  return useQueries({
    queries: slugs.map((slug) => productsQuery(locale, { topic: slug })),
    combine: (results) => {
      const byId = new Map<string, ProductListItem>();
      for (const result of results) {
        for (const product of result.data ?? []) byId.set(product.id, product);
      }
      return { data: [...byId.values()].sort((a, b) => b.upvotes - a.upvotes) };
    },
  });
}
