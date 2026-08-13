import { NextRequest, NextResponse } from "next/server";
import { defaultLocale } from "./lib/i18n";

const LOCALE_PATTERN = /^\/(en|de)(\/|$)/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (LOCALE_PATTERN.test(pathname)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes and any request for a file with an extension
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
