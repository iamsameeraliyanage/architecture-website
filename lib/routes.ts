import { locales, type Locale } from "./i18n";
import { serviceKeyFromSlug, serviceSlug, serviceKeys, type ServiceKey } from "./services";

/*
  One source of truth for every indexable URL on the site.

  The SEO spec asks for a fixed architecture with per-page keyword mapping, so
  paths are built here rather than typed inline: canonical URLs, hreflang
  alternates, the sitemap and the nav all read the same map and cannot drift.

  Service leaf slugs are localised — the German page has to carry the German
  search term in its URL ("3d-laserscanning", not "3d-laser-scanning"). The
  "/services/" segment itself stays constant in both locales so the route tree
  stays a single, statically generated branch.
*/

// Placeholder domain — swap for the production .ch domain at launch.
export const SITE_URL = "https://scancrew.example";

export type PageKey = "home" | "services" | "pricing" | "about" | "contact";

const STATIC_PATHS: Record<PageKey, string> = {
  home: "",
  services: "/services",
  pricing: "/pricing",
  about: "/about",
  contact: "/contact",
};

/** Locale-prefixed path for a top-level page, e.g. `/de/pricing`. */
export function pagePath(locale: Locale, key: PageKey): string {
  return `/${locale}${STATIC_PATHS[key]}`;
}

/** Locale-prefixed path for a service page, e.g. `/de/services/3d-laserscanning`. */
export function servicePath(locale: Locale, key: ServiceKey): string {
  return `/${locale}/services/${serviceSlug(locale, key)}`;
}

/** Absolute URL, for canonical tags, JSON-LD `@id` values and the sitemap. */
export function absolute(path: string): string {
  return `${SITE_URL}${path}`;
}

/**
 * hreflang map for a page — Next merges this into `alternates.languages`.
 * Every page must ship one: the site is a single market in two languages and
 * unpaired pages are the usual reason Google picks the wrong one.
 */
export function pageAlternates(key: PageKey): Record<Locale, string> {
  return Object.fromEntries(locales.map((l) => [l, pagePath(l, key)])) as Record<Locale, string>;
}

export function serviceAlternates(key: ServiceKey): Record<Locale, string> {
  return Object.fromEntries(locales.map((l) => [l, servicePath(l, key)])) as Record<Locale, string>;
}

/** Every indexable path, per locale — consumed by `app/sitemap.ts`. */
export function allRoutes(): Array<{ paths: Record<Locale, string>; priority: number }> {
  const pages: Array<{ key: PageKey; priority: number }> = [
    { key: "home", priority: 1 },
    { key: "services", priority: 0.9 },
    { key: "pricing", priority: 0.8 },
    { key: "about", priority: 0.6 },
    { key: "contact", priority: 0.7 },
  ];

  return [
    ...pages.map((p) => ({ paths: pageAlternates(p.key), priority: p.priority })),
    // service pages carry the commercial keyword set — ranked just under home
    ...serviceKeys.map((key) => ({ paths: serviceAlternates(key), priority: 0.9 })),
  ];
}

/**
 * Same page, other language.
 *
 * A plain locale-prefix swap is not enough once service slugs are localised:
 * `/de/services/3d-laserscanning` swapped naively becomes `/en/services/
 * 3d-laserscanning`, which does not exist. The slug is resolved back to its
 * stable key and re-rendered in the target locale, so the switcher lands on
 * the translated page rather than a 404 — which is also what makes the
 * hreflang pairs on those pages true.
 */
export function translatePath(pathname: string, to: Locale): string {
  const match = pathname.match(/^\/(en|de)(\/.*)?$/);
  if (!match) return `/${to}${pathname === "/" ? "" : pathname}`;

  const from = match[1] as Locale;
  const rest = match[2] ?? "";

  const service = rest.match(/^\/services\/([^/]+)\/?$/);
  if (service) {
    const key = serviceKeyFromSlug(from, service[1]);
    if (key) return servicePath(to, key);
  }

  return `/${to}${rest}`;
}
