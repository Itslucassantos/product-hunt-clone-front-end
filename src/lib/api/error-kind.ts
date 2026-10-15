import { ApiRequestError } from "./errors";

export type ErrorKind =
  | "generic"
  | "offline"
  | "unauthenticated"
  | "sessionExpired"
  | "forbidden"
  | "notFound"
  | "rateLimited"
  | "serverError"
  | "unavailable"
  | "upstream";

export function errorKind(error: unknown): ErrorKind {
  if (!(error instanceof ApiRequestError)) return "generic";
  switch (error.code) {
    case null:
      return "offline";
    case "UNAUTHENTICATED":
      return "unauthenticated";
    case "SESSION_EXPIRED":
      return "sessionExpired";
    case "FORBIDDEN":
      return "forbidden";
    case "ROUTE_NOT_FOUND":
    case "PRODUCT_NOT_FOUND":
      return "notFound";
    case "RATE_LIMITED":
      return "rateLimited";
    case "INTERNAL_ERROR":
      return "serverError";
    case "SERVICE_UNAVAILABLE":
      return "unavailable";
    case "UPSTREAM_ERROR":
      return "upstream";
    default:
      return "generic";
  }
}

export function retryAfterSeconds(error: unknown): number {
  if (error instanceof ApiRequestError && typeof error.details === "object" && error.details) {
    const value = (error.details as { retryAfterSeconds?: unknown }).retryAfterSeconds;
    if (typeof value === "number" && value > 0) return Math.ceil(value);
  }
  return 10;
}
