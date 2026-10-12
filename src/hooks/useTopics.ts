"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { listTopics } from "@/lib/api/endpoints";
import type { Locale } from "@/types/api";

export function useTopics() {
  const locale = useLocale() as Locale;

  return useQuery({
    queryKey: ["topics", locale],
    queryFn: () => listTopics(locale),
  });
}
