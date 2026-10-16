"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getMyVotes } from "@/lib/api/endpoints";
import { useAuthToken } from "./useAuthToken";

export function useMyVotes() {
  const { isSignedIn } = useAuth();
  const getAuthToken = useAuthToken();

  return useQuery({
    queryKey: ["my-votes"],
    queryFn: async () => getMyVotes(await getAuthToken()),
    select: (data) => new Set(data.productIds),
    enabled: isSignedIn === true,
    staleTime: 0,
  });
}
