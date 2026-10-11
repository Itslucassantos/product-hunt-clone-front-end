"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { ApiRequestError } from "@/lib/api/errors";

/** Returns a function that gets a fresh Clerk token, or throws UNAUTHENTICATED when signed out. */
export function useAuthToken() {
  const { getToken } = useAuth();

  return useCallback(async () => {
    const token = await getToken();
    if (!token) throw new ApiRequestError("UNAUTHENTICATED", 401, null);
    return token;
  }, [getToken]);
}
