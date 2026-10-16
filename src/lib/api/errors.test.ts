import { describe, expect, it } from "vitest";
import { errorKind, retryAfterSeconds } from "./error-kind";
import { errorMessageKey } from "./error-message-key";
import { ApiRequestError } from "./errors";
import { fieldErrorsOf } from "./field-errors";

const err = (code: string | null, details?: unknown) =>
  new ApiRequestError(code, code ? 400 : null, "req-1", details);

describe("errorMessageKey", () => {
  it("returns known codes as they are", () => {
    expect(errorMessageKey(err("PRODUCT_NOT_VOTABLE"))).toBe("PRODUCT_NOT_VOTABLE");
  });

  it("maps a missing code to NETWORK_ERROR", () => {
    expect(errorMessageKey(err(null))).toBe("NETWORK_ERROR");
  });

  it("maps unknown codes and non-API errors to INTERNAL_ERROR", () => {
    expect(errorMessageKey(err("SOMETHING_NEW"))).toBe("INTERNAL_ERROR");
    expect(errorMessageKey(new Error("boom"))).toBe("INTERNAL_ERROR");
  });
});

describe("errorKind", () => {
  it.each([
    [null, "offline"],
    ["UNAUTHENTICATED", "unauthenticated"],
    ["SESSION_EXPIRED", "sessionExpired"],
    ["FORBIDDEN", "forbidden"],
    ["ROUTE_NOT_FOUND", "notFound"],
    ["PRODUCT_NOT_FOUND", "notFound"],
    ["RATE_LIMITED", "rateLimited"],
    ["INTERNAL_ERROR", "serverError"],
    ["SERVICE_UNAVAILABLE", "unavailable"],
    ["UPSTREAM_ERROR", "upstream"],
    ["VALIDATION_ERROR", "generic"],
  ])("maps %s to %s", (code, kind) => {
    expect(errorKind(err(code))).toBe(kind);
  });

  it("treats non-API errors as generic", () => {
    expect(errorKind(new Error("x"))).toBe("generic");
  });
});

describe("retryAfterSeconds", () => {
  it("rounds up the value sent by the API", () => {
    expect(retryAfterSeconds(err("RATE_LIMITED", { retryAfterSeconds: 4.2 }))).toBe(5);
  });

  it("falls back to 10 seconds", () => {
    expect(retryAfterSeconds(err("RATE_LIMITED"))).toBe(10);
    expect(retryAfterSeconds(err("RATE_LIMITED", { retryAfterSeconds: 0 }))).toBe(10);
    expect(retryAfterSeconds(new Error("x"))).toBe(10);
  });
});

describe("fieldErrorsOf", () => {
  it("returns the details of a VALIDATION_ERROR", () => {
    const details = [{ field: "title", code: "REQUIRED" }];
    expect(fieldErrorsOf(err("VALIDATION_ERROR", details))).toEqual(details);
  });

  it("returns an empty list for other errors or malformed details", () => {
    expect(fieldErrorsOf(err("FORBIDDEN", [{ field: "a", code: "b" }]))).toEqual([]);
    expect(fieldErrorsOf(err("VALIDATION_ERROR", "nope"))).toEqual([]);
    expect(fieldErrorsOf(new Error("x"))).toEqual([]);
  });
});
