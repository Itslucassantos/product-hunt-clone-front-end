import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "./redirect";

describe("getSafeRedirectPath", () => {
  it("keeps internal paths, including the query string", () => {
    expect(getSafeRedirectPath("/")).toBe("/");
    expect(getSafeRedirectPath("/products/1")).toBe("/products/1");
    expect(getSafeRedirectPath("/?topic=ai")).toBe("/?topic=ai");
  });

  it.each([null, undefined, "", "products", "https://evil.com", "//evil.com", "/\\evil.com"])(
    "falls back to / for %s",
    (value) => {
      expect(getSafeRedirectPath(value)).toBe("/");
    },
  );
});
