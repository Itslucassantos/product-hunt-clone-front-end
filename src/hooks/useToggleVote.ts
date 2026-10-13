"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleVote } from "@/lib/api/endpoints";
import type { MyVotes, ProductListItem, VoteResult } from "@/types/api";
import { useAuthToken } from "./useAuthToken";

export function useToggleVote(productId: string) {
  const queryClient = useQueryClient();
  const getAuthToken = useAuthToken();

  return useMutation({
    mutationFn: async () => toggleVote(productId, await getAuthToken()),
    onSuccess: ({ upvotes, voted }: VoteResult) => {
      queryClient.setQueriesData<ProductListItem[] | ProductListItem>(
        { queryKey: ["products"] },
        (data) => {
          if (Array.isArray(data)) {
            return data.map((p) => (p.id === productId ? { ...p, upvotes } : p));
          }
          return data?.id === productId ? { ...data, upvotes } : data;
        },
      );
      queryClient.setQueryData<MyVotes>(["my-votes"], (data) => {
        const ids = new Set(data?.productIds ?? []);
        if (voted) ids.add(productId);
        else ids.delete(productId);
        return { productIds: [...ids] };
      });
    },
  });
}
