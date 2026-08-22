import { locale as rootLocale } from "next/root-params";
import NotFoundBody from "@/components/NotFoundBody";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

/*
  Reached when a matched route calls notFound() — an unrecognised service slug,
  for example. URLs that match no route at all are handled one level up by
  `app/global-not-found.tsx`, because this app's root layout sits inside a
  dynamic [locale] segment and never runs for an unmatched path.

  The locale comes from the root param: not-found.tsx receives no `params`.
*/
export default async function NotFound() {
  const raw = await rootLocale().catch(() => undefined);
  const locale: Locale = raw && isLocale(raw) ? raw : defaultLocale;
  return <NotFoundBody locale={locale} />;
}
