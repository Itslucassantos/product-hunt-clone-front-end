import type { ApiError } from "@/types/api";
import { ApiRequestError } from "./errors";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | undefined>;
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;

  fresh?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", query, body, token, signal, fresh } = options;

  const baseUrl =
    typeof window === "undefined" ? process.env.API_INTERNAL_URL || API_BASE_URL : API_BASE_URL;
  const url = new URL(`/api${path}`, baseUrl);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = { "X-Request-Id": crypto.randomUUID() };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      cache: fresh ? "no-cache" : undefined,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiRequestError(null, null, null);
  }

  if (!response.ok) {
    const requestId = response.headers.get("X-Request-Id");
    const payload = (await response.json().catch(() => null)) as ApiError | null;
    throw new ApiRequestError(
      payload?.error.code ?? "INTERNAL_ERROR",
      response.status,
      payload?.error.requestId ?? requestId,
      payload?.error.details,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
