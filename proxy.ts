import { NextRequest, NextResponse } from "next/server";
import { defaultLocale } from "./lib/i18n";

const LOCALE_PATTERN = /^\/(en|de)(\/|$)/;

/** Header the 404 page reads to answer in the right language. */
export const LOCALE_HEADER = "x-scancrew-locale";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matched = pathname.match(LOCALE_PATTERN);
  if (matched) {
    /* app/global-not-found.tsx bypasses routing entirely, so it never sees the
       [locale] param. Forwarding the locale as a request header is the only
       way a dead link under /de can answer in German. */
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, matched[1]);
    return NextResponse.next({ request: { headers } });
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes and any request for a file with an extension
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
