import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);
const ADMIN_PATH = new RegExp(`^(?:/(?:${routing.locales.join("|")}))?/admin(?:/|$)`);

export default clerkMiddleware(async (auth, request) => {
  const { pathname, search } = request.nextUrl;

  if (ADMIN_PATH.test(pathname)) {
    const { userId } = await auth();
    if (!userId) {
      const locale = LOCALE_PREFIX.exec(pathname)?.[1] ?? routing.defaultLocale;
      const signIn = new URL(`/${locale}/sign-in`, request.url);
      signIn.searchParams.set("redirect_url", `${pathname.replace(LOCALE_PREFIX, "")}${search}`);
      return NextResponse.redirect(signIn);
    }
  }

  return handleI18nRouting(request);
});

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
