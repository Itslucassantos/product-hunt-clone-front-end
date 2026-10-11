"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api/endpoints";
import { useAuthToken } from "./useAuthToken";

/** Backend user (id and role). Only runs when signed in; role comes from the DB, never the token. */
export function useMe() {
  const { isSignedIn } = useAuth();
  const getAuthToken = useAuthToken();

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => getMe(await getAuthToken()),
    enabled: isSignedIn === true,
    staleTime: 60_000,
  });
}
