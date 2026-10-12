import { ApiRequestError } from "./errors";

const KNOWN_CODES = new Set([
  "NETWORK_ERROR",
  "UNAUTHENTICATED",
  "SESSION_EXPIRED",
  "PRODUCT_NOT_FOUND",
  "PRODUCT_NOT_VOTABLE",
  "RATE_LIMITED",
]);

export function errorMessageKey(error: unknown): string {
  if (error instanceof ApiRequestError) {
    const code = error.code ?? "NETWORK_ERROR";
    return KNOWN_CODES.has(code) ? code : "INTERNAL_ERROR";
  }
  return "INTERNAL_ERROR";
}
