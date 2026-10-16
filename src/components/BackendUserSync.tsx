"use client";

import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useMe } from "@/hooks/useMe";

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
