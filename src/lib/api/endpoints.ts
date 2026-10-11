import type {
  Locale,
  Me,
  MyVotes,
  ProductDetail,
  ProductListItem,
  Topic,
  VoteResult,
} from "@/types/api";
import { apiRequest } from "./client";

// One typed function per backend route (see BACKEND.md). Components never call `fetch` directly.

type ListProductsParams = {
  locale: Locale;
  /** Topic slug. */
  topic?: string;
  status?: "published" | "coming-soon";
  reviewed?: boolean;
};

export const listProducts = ({ locale, topic, status, reviewed }: ListProductsParams) =>
  apiRequest<ProductListItem[]>("/products", {
    query: { locale, topic, status, reviewed: reviewed ? "true" : undefined },
  });

export const getProduct = (id: string, locale: Locale) =>
  apiRequest<ProductDetail>(`/products/${id}`, { query: { locale } });

export const listTopics = (locale: Locale) => apiRequest<Topic[]>("/topics", { query: { locale } });

// Protected routes: they need the Clerk token. The first one called after sign up also creates
// the local user in the backend (when the Clerk webhook is not configured).

export const getMe = (token: string) => apiRequest<Me>("/me", { token });

export const getMyVotes = (token: string) => apiRequest<MyVotes>("/me/votes", { token });

export const toggleVote = (productId: string, token: string) =>
  apiRequest<VoteResult>(`/products/${productId}/vote`, { method: "POST", token });
