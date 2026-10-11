/**
 * Where to go after log in or sign up. `redirect_url` is a path without the locale prefix
 * (e.g. "/products/42"). Anything that is not a plain internal path falls back to the Home.
 */
export function getSafeRedirectPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return "/";
  return value;
}
