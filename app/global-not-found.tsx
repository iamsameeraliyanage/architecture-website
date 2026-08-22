import type { Metadata } from "next";
import { headers } from "next/headers";
import { Instrument_Sans, Inter, IBM_Plex_Mono } from "next/font/google";
import NotFoundBody from "@/components/NotFoundBody";
import ThemeInit from "@/components/ThemeInit";
import LenisProvider from "@/components/motion/LenisProvider";
import ScrollProgress from "@/components/ui/ScrollProgress";
import ScanCursor from "@/components/ui/ScanCursor";
import { content } from "@/lib/content";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import { LOCALE_HEADER } from "@/proxy";
import "./globals.css";

/*
  Global 404 for URLs that match no route.

  This app's root layout lives inside the dynamic [locale] segment, so it never
  runs for an unmatched path — which is the case Next documents `global-not-
  found` for. Because it bypasses the layout entirely, the html shell, fonts,
  stylesheet and theme script all have to be repeated here.

  The locale comes from a header the proxy sets, since there is no matched
  route to read a param from — a dead link under /de still answers in German.
*/
const grotesk = Instrument_Sans({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

/* Next already emits `noindex` for this file — declaring it again here only
   duplicates the tag. */
export const metadata: Metadata = {
  title: content[defaultLocale].notFound.metaTitle,
};

export default async function GlobalNotFound() {
  const raw = (await headers()).get(LOCALE_HEADER);
  const locale: Locale = raw && isLocale(raw) ? raw : defaultLocale;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${grotesk.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body>
        <noscript>
          <style>{`.split-pending { visibility: visible; }`}</style>
        </noscript>
        {/* the locale layout never runs for this file, so its scroll and
            cursor layer has to be repeated or the 404 feels like a different
            site than the one the visitor was just on */}
        <ThemeInit />
        <LenisProvider />
        <ScrollProgress />
        <ScanCursor />
        <NotFoundBody locale={locale} />
      </body>
    </html>
  );
}
