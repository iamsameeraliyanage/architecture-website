import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Inter, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { pageAlternates, pagePath, SITE_URL } from "@/lib/routes";
import LenisProvider from "@/components/motion/LenisProvider";
import ScrollProgress from "@/components/ui/ScrollProgress";
import ScanCursor from "@/components/ui/ScanCursor";
import ThemeInit from "@/components/ThemeInit";
import "../globals.css";

const grotesk = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const dynamicParams = false;

/*
  `viewportFit: "cover"` is what makes env(safe-area-inset-*) resolve to
  anything but zero — the layout already asks for those insets (the shell
  gutters, the mobile menu's bottom padding, the quote bar), and without it
  they are all silently 0 and the page is letterboxed inside the notch.
  Everything that runs to a screen edge therefore has to pad itself; see the
  --gutter definition in globals.css.

  themeColor paints the browser chrome to match the band behind it, so the
  status bar is part of the page rather than a white strip above it. Both
  entries are listed because the site's theme is user-switchable and the
  media query is the only signal the UA reads.
*/
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05090f" },
    { media: "(prefers-color-scheme: light)", color: "#e6ecf2" },
  ],
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = content[locale].meta;

  return {
    metadataBase: new URL(SITE_URL),
    title: t.title,
    description: t.description,
    alternates: { canonical: pagePath(locale, "home"), languages: pageAlternates("home") },
    openGraph: {
      type: "website",
      siteName: "ScanCrew",
      title: t.title,
      description: t.description,
      url: pagePath(locale, "home"),
      locale: locale === "de" ? "de_CH" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${grotesk.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body>
        {/* without JS the GSAP reveals never run — show the text they hide */}
        <noscript>
          <style>{`.split-pending { visibility: visible; }`}</style>
        </noscript>
        {/* set the stored theme before first paint to avoid a flash */}
        <ThemeInit />
        <LenisProvider />
        <ScrollProgress />
        <ScanCursor />
        {children}
      </body>
    </html>
  );
}

export type { Locale };
