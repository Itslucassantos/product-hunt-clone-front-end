import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "@/lib/api/errors";
import { createTestQueryClient } from "@/test/render";
import type { MyVotes, ProductListItem } from "@/types/api";
import { useToggleVote } from "./useToggleVote";

const toggleVote = vi.fn();
const errorToast = vi.fn();

vi.mock("@/lib/api/endpoints", () => ({ toggleVote: (...args: unknown[]) => toggleVote(...args) }));
vi.mock("./useAuthToken", () => ({ useAuthToken: () => async () => "token" }));
vi.mock("./useErrorToast", () => ({ useErrorToast: () => errorToast }));

const product = (id: string, upvotes: number): ProductListItem => ({
  id,
  title: id,
  description: "",
  url: "https://example.com",
  imageUrl: null,
  status: "PUBLISHED",
  upvotes,
  topics: [],
  review: null,
});

const LIST_KEY = ["products", "en", "list"];
const DETAIL_KEY = ["products", "en", "detail", "b"];

function setup(productId: string, voted: string[] = [], leaderVotes = 5) {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(LIST_KEY, [product("a", leaderVotes), product("b", 5)]);
  queryClient.setQueryData(DETAIL_KEY, product("b", 5));
  queryClient.setQueryData<MyVotes>(["my-votes"], { productIds: voted });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(() => useToggleVote(productId), { wrapper });
  return { queryClient, ...hook };
}

const upvotesOf = (list: ProductListItem[] | undefined, id: string) =>
  list?.find((p) => p.id === id)?.upvotes;

beforeEach(() => {
  toggleVote.mockReset();
  errorToast.mockReset();
});

describe("useToggleVote", () => {
  it("updates votes and the list order before the API answers", async () => {
    toggleVote.mockReturnValue(new Promise(() => {}));
    const { queryClient, result } = setup("b");

    act(() => result.current.mutate());

    await waitFor(() => {
      const list = queryClient.getQueryData<ProductListItem[]>(LIST_KEY);
      expect(list?.map((p) => p.id)).toEqual(["b", "a"]);
      expect(upvotesOf(list, "b")).toBe(6);
    });
    expect(queryClient.getQueryData<ProductListItem>(DETAIL_KEY)?.upvotes).toBe(6);
    expect(queryClient.getQueryData<MyVotes>(["my-votes"])?.productIds).toEqual(["b"]);
  });

  it("removes the vote when the product was already voted", async () => {
    toggleVote.mockReturnValue(new Promise(() => {}));
    const { queryClient, result } = setup("b", ["b"]);

    act(() => result.current.mutate());

    await waitFor(() => {
      expect(queryClient.getQueryData<ProductListItem>(DETAIL_KEY)?.upvotes).toBe(4);
    });
    expect(queryClient.getQueryData<MyVotes>(["my-votes"])?.productIds).toEqual([]);
  });

  it("rolls back and shows a toast when the API fails", async () => {
    const error = new ApiRequestError("INTERNAL_ERROR", 500, "req-1");
    toggleVote.mockRejectedValue(error);
    const { queryClient, result } = setup("b", [], 7);

    act(() => result.current.mutate());
    await waitFor(() => expect(errorToast).toHaveBeenCalledWith(error));

    const list = queryClient.getQueryData<ProductListItem[]>(LIST_KEY);
    expect(list?.map((p) => p.id)).toEqual(["a", "b"]);
    expect(upvotesOf(list, "b")).toBe(5);
    expect(queryClient.getQueryData<ProductListItem>(DETAIL_KEY)?.upvotes).toBe(5);
  });

  it("refetches the products on PRODUCT_NOT_VOTABLE", async () => {
    toggleVote.mockRejectedValue(new ApiRequestError("PRODUCT_NOT_VOTABLE", 409, null));
    const { queryClient, result } = setup("b");
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    act(() => result.current.mutate());
    await waitFor(() => expect(errorToast).toHaveBeenCalled());

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["products"] });
  });

  it("uses the server numbers on success", async () => {
    toggleVote.mockResolvedValue({ upvotes: 9, voted: true });
    const { queryClient, result } = setup("b");

    act(() => result.current.mutate());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData<ProductListItem>(DETAIL_KEY)?.upvotes).toBe(9);
    expect(queryClient.getQueryData<MyVotes>(["my-votes"])?.productIds).toEqual(["b"]);
  });
});
