"use client";

import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useMe } from "@/hooks/useMe";

/**
 * Calls GET /api/me as soon as the user is signed in, which makes the backend create the local
 * user (the Clerk webhook may be late or disabled). Clears user data from the cache on sign out.
 */
export function BackendUserSync() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  useMe();

  useEffect(() => {
    if (isSignedIn === false) {
      queryClient.removeQueries({ queryKey: ["me"] });
      queryClient.removeQueries({ queryKey: ["my-votes"] });
    }
  }, [isSignedIn, queryClient]);

  return null;
}
