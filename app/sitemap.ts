import type { MetadataRoute } from "next";
import { allRoutes, SITE_URL } from "@/lib/routes";
import { locales } from "@/lib/i18n";

/*
  Built from lib/routes.ts rather than a hand-kept list, so a new service page
  is in the sitemap the moment it exists in the content. Every entry carries
  the full hreflang set — including the localised German service slugs, which
  a naive `/de` + path sitemap would have got wrong.
*/
export default function sitemap(): MetadataRoute.Sitemap {
  return allRoutes().flatMap(({ paths, priority }) =>
    locales.map((locale) => ({
      url: `${SITE_URL}${paths[locale]}`,
      changeFrequency: "monthly" as const,
      priority: priority * (locale === "en" ? 1 : 0.9),
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}${paths[l]}`]),
        ),
      },
    })),
  );
}
