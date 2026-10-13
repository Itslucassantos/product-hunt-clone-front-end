"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { getProduct } from "@/lib/api/endpoints";
import type { Locale } from "@/types/api";

export function useProduct(id: string) {
  const locale = useLocale() as Locale;

  return useQuery({
    queryKey: ["products", locale, id],
    queryFn: () => getProduct(id, locale),
  });
}
