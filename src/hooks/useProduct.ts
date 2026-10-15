"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { productQuery } from "@/lib/api/queries";
import type { Locale } from "@/types/api";

export function useProduct(id: string, { fresh = false } = {}) {
  const locale = useLocale() as Locale;

  return useQuery(productQuery(locale, id, { fresh }));
}
