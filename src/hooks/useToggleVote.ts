"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toggleVote } from "@/lib/api/endpoints";
import { ApiRequestError } from "@/lib/api/errors";
import type { MyVotes, ProductListItem, VoteResult } from "@/types/api";
import { useAuthToken } from "./useAuthToken";
import { useErrorToast } from "./useErrorToast";

const isSortedByVotes = (list: ProductListItem[]) =>
  list.every((p, i) => i === 0 || list[i - 1].upvotes >= p.upvotes);

function updateUpvotes(
  queryClient: QueryClient,
  productId: string,
  next: (current: number) => number,
) {
  queryClient.setQueriesData<ProductListItem[] | ProductListItem>(
    { queryKey: ["products"] },
    (data) => {
      if (Array.isArray(data)) {
        if (!data.some((p) => p.id === productId)) return data;
        const keepSorted = isSortedByVotes(data);
        const updated = data.map((p) =>
          p.id === productId ? { ...p, upvotes: next(p.upvotes) } : p,
        );
        return keepSorted ? updated.sort((a, b) => b.upvotes - a.upvotes) : updated;
      }
      return data?.id === productId ? { ...data, upvotes: next(data.upvotes) } : data;
    },
  );
}

function setVoted(queryClient: QueryClient, productId: string, voted: boolean) {
  queryClient.setQueryData<MyVotes>(["my-votes"], (data) => {
    const ids = new Set(data?.productIds ?? []);
    if (voted) ids.add(productId);
    else ids.delete(productId);
    return { productIds: [...ids] };
  });
}

export function useToggleVote(productId: string) {
  const queryClient = useQueryClient();
  const getAuthToken = useAuthToken();
  const errorToast = useErrorToast();

  return useMutation({
    mutationFn: async () => toggleVote(productId, await getAuthToken()),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["products"] });
      await queryClient.cancelQueries({ queryKey: ["my-votes"] });

      const hadVoted =
        queryClient.getQueryData<MyVotes>(["my-votes"])?.productIds.includes(productId) ?? false;
      const delta = hadVoted ? -1 : 1;

      updateUpvotes(queryClient, productId, (current) => current + delta);
      setVoted(queryClient, productId, !hadVoted);

      return { hadVoted, delta };
    },
    onError: (error, _variables, context) => {
      if (context) {
        updateUpvotes(queryClient, productId, (current) => current - context.delta);
        setVoted(queryClient, productId, context.hadVoted);
      }
      queryClient.invalidateQueries({ queryKey: ["my-votes"] });
      if (error instanceof ApiRequestError && error.code === "PRODUCT_NOT_VOTABLE") {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }
      errorToast(error);
    },
    onSuccess: ({ upvotes, voted }: VoteResult) => {
      updateUpvotes(queryClient, productId, () => upvotes);
      setVoted(queryClient, productId, voted);
    },
  });
}
