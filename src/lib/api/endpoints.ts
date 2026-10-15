import type {
  AdminProduct,
  Locale,
  Me,
  MyVotes,
  ProductDetail,
  ProductInput,
  ProductListItem,
  ReviewInput,
  Topic,
  TopicInput,
  VoteResult,
} from "@/types/api";
import { apiRequest } from "./client";

type ListProductsParams = {
  locale: Locale;
  topic?: string;
  status?: "published" | "coming-soon";
  reviewed?: boolean;
};

export const listProducts = ({ locale, topic, status, reviewed }: ListProductsParams) =>
  apiRequest<ProductListItem[]>("/products", {
    query: { locale, topic, status, reviewed: reviewed ? "true" : undefined },
  });

export const getProduct = (id: string, locale: Locale, { fresh = false } = {}) =>
  apiRequest<ProductDetail>(`/products/${id}`, { query: { locale }, fresh });

export const listTopics = (locale: Locale, { fresh = false } = {}) =>
  apiRequest<Topic[]>("/topics", { query: { locale }, fresh });

export const getMe = (token: string) => apiRequest<Me>("/me", { token });

export const getMyVotes = (token: string) => apiRequest<MyVotes>("/me/votes", { token });

export const toggleVote = (productId: string, token: string) =>
  apiRequest<VoteResult>(`/products/${productId}/vote`, { method: "POST", token });

export const listAdminProducts = (locale: Locale, token: string) =>
  apiRequest<AdminProduct[]>("/admin/products", { query: { locale }, token });

export const createProduct = (input: ProductInput, token: string) =>
  apiRequest<{ id: string }>("/products", { method: "POST", body: input, token });

export const updateProduct = (id: string, input: Partial<ProductInput>, token: string) =>
  apiRequest<void>(`/products/${id}`, { method: "PATCH", body: input, token });

export const deleteProduct = (id: string, token: string) =>
  apiRequest<void>(`/products/${id}`, { method: "DELETE", token });

export const saveReview = (id: string, input: ReviewInput, token: string) =>
  apiRequest<unknown>(`/products/${id}/review`, { method: "PUT", body: input, token });

export const removeReview = (id: string, token: string) =>
  apiRequest<void>(`/products/${id}/review`, { method: "DELETE", token });

export const createTopic = (input: TopicInput, token: string) =>
  apiRequest<Topic>("/topics", { method: "POST", body: input, token });

export const updateTopic = (id: string, input: TopicInput, token: string) =>
  apiRequest<Topic>(`/topics/${id}`, { method: "PATCH", body: input, token });

export const deleteTopic = (id: string, token: string) =>
  apiRequest<void>(`/topics/${id}`, { method: "DELETE", token });

export const reorderTopics = (ids: string[], token: string) =>
  apiRequest<void>("/topics/order", { method: "PUT", body: { ids }, token });
