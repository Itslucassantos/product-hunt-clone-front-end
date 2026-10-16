import { queryOptions } from "@tanstack/react-query";
import type { Locale } from "@/types/api";
import { getProduct, listProducts, listTopics } from "./endpoints";

export type ProductFilters = {
  topic?: string;
  status?: "published" | "coming-soon";
  reviewed?: boolean;
};

export const productsQuery = (locale: Locale, { topic, status, reviewed }: ProductFilters = {}) => {
  const filters = {
    topic: topic ?? null,
    status: status ?? "published",
    reviewed: reviewed ?? false,
  };

  return queryOptions({
    queryKey: ["products", locale, filters],
    queryFn: () =>
      listProducts({
        locale,
        topic: filters.topic ?? undefined,
        status: filters.status,
        reviewed: filters.reviewed,
      }),
  });
};

export const productQuery = (locale: Locale, id: string, { fresh = false } = {}) =>
  queryOptions({
    queryKey: fresh ? ["products", locale, id, "fresh"] : ["products", locale, id],
    queryFn: () => getProduct(id, locale, { fresh }),
    ...(fresh && { staleTime: 0, gcTime: 0 }),
  });

export const topicsQuery = (locale: Locale, { fresh = false } = {}) =>
  queryOptions({
    queryKey: ["topics", locale],
    queryFn: () => listTopics(locale, { fresh }),
  });
