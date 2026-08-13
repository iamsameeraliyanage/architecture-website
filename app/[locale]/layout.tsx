import type { Metadata } from "next";
import { Instrument_Sans, Inter, IBM_Plex_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { isLocale, locales, type Locale } from "@/lib/i18n";
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

// Placeholder domain — swap for the production domain at launch.
const SITE_URL = "https://scancrew.example";

export const dynamicParams = false;

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
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", de: "/de" },
    },
    openGraph: {
      type: "website",
      siteName: "ScanCrew",
      title: t.title,
      description: t.description,
      url: `/${locale}`,
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
    <html lang={locale} className={`${grotesk.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>
        {/* set the stored theme before first paint to avoid a flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}

export type { Locale };
