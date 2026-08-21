import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

const SITE_URL = "https://scancrew.example";

/* "" is the home page; the rest are the standalone pages under each locale. */
const routes = ["", "/pricing", "/about", "/contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${SITE_URL}/${locale}${route}`,
      changeFrequency: "monthly" as const,
      priority: (route === "" ? 1 : 0.8) * (locale === "en" ? 1 : 0.9),
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${route}`])),
      },
    })),
  );
}
