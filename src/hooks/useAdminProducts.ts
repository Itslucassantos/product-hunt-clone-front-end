"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { listAdminProducts } from "@/lib/api/endpoints";
import type { Locale } from "@/types/api";
import { useAuthToken } from "./useAuthToken";

export function useAdminProducts() {
  const locale = useLocale() as Locale;
  const getAuthToken = useAuthToken();

  return useQuery({
    queryKey: ["admin-products", locale],
    queryFn: async () => listAdminProducts(locale, await getAuthToken()),
    staleTime: 0,
  });
}
