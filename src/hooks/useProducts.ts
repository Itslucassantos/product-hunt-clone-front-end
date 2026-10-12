"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { listProducts } from "@/lib/api/endpoints";
import type { Locale } from "@/types/api";

type Filters = { topic?: string; status?: "published" | "coming-soon"; reviewed?: boolean };

export function useProducts({ topic, status = "published", reviewed }: Filters = {}) {
  const locale = useLocale() as Locale;

  return useQuery({
    queryKey: ["products", locale, { topic: topic ?? null, status, reviewed: reviewed ?? false }],
    queryFn: () => listProducts({ locale, topic, status, reviewed }),
  });
}
