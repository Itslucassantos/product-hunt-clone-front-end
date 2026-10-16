import { ApiRequestError } from "./errors";

const KNOWN_CODES = new Set([
  "NETWORK_ERROR",
  "UNAUTHENTICATED",
  "SESSION_EXPIRED",
  "PRODUCT_NOT_FOUND",
  "PRODUCT_NOT_VOTABLE",
  "RATE_LIMITED",
  "FORBIDDEN",
  "VALIDATION_ERROR",
  "MALFORMED_REQUEST",
  "INVALID_TOPIC_ORDER",
  "TOPIC_NOT_FOUND",
  "REVIEW_NOT_FOUND",
  "ROUTE_NOT_FOUND",
  "TOPIC_ALREADY_EXISTS",
  "TOPIC_IN_USE",
  "IMAGE_TOO_LARGE",
  "UNSUPPORTED_IMAGE_TYPE",
  "UPSTREAM_ERROR",
  "SERVICE_UNAVAILABLE",
  "PRODUCT_ALREADY_EXISTS",
  "USER_NOT_FOUND",
]);

export function errorMessageKey(error: unknown): string {
  if (error instanceof ApiRequestError) {
    const code = error.code ?? "NETWORK_ERROR";
    return KNOWN_CODES.has(code) ? code : "INTERNAL_ERROR";
  }
  return "INTERNAL_ERROR";
}
