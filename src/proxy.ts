import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// Locale routing + Clerk. The /admin role check lives in the admin layout (role comes from GET /api/me).
export default clerkMiddleware((_auth, request) => handleI18nRouting(request));

export const config = {
  // Skip Next internals, static files and /api routes (no locale prefix there).
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
