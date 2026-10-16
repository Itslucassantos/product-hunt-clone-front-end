"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { topicsQuery } from "@/lib/api/queries";
import type { Locale } from "@/types/api";

export function useTopics({ fresh = false } = {}) {
  const locale = useLocale() as Locale;

  return useQuery(topicsQuery(locale, { fresh }));
}
