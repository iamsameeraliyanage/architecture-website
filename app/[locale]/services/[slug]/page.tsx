import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import PageHero from "@/components/ui/PageHero";
import { ServiceSectionList } from "@/components/service/ServiceSections";
import RelatedServices from "@/components/RelatedServices";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import MobileQuoteBar from "@/components/ui/MobileQuoteBar";
import JsonLd from "@/components/ui/JsonLd";
import { content } from "@/lib/content";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { pagePath, serviceAlternates, servicePath } from "@/lib/routes";
import { getService, getServices, serviceKeyFromSlug, serviceKeys } from "@/lib/services";
import {
  breadcrumbSchema,
  faqSchema,
  graph,
  organizationSchema,
  serviceSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema";

/*
  One route, four pages per locale — with localised slugs.

  The German page has to carry the German search term in its URL
  ("3d-laserscanning", not "3d-laser-scanning"), so the slug is looked up per
  locale rather than shared. The stable `ServiceKey` behind it is what links
  the two together for hreflang.
*/
/* an unrecognised slug has to reach notFound() so the branded 404 renders;
   with the layout's dynamicParams = false it would return the bare one */
export const dynamicParams = true;

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const { locale } = params;
  if (!isLocale(locale)) return [];
  return serviceKeys.map((key) => ({ slug: getService(locale, key).slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const key = serviceKeyFromSlug(locale, slug);
  if (!key) return {};
  const service = getService(locale, key);

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: servicePath(locale, key),
      languages: serviceAlternates(key),
    },
    openGraph: {
      type: "website",
      title: service.metaTitle,
      description: service.metaDescription,
      url: servicePath(locale, key),
      locale: locale === "de" ? "de_CH" : "en_US",
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const key = serviceKeyFromSlug(locale, slug);
  if (!key) notFound();

  const t = content[locale];
  const s = getServices(locale);
  const service = getService(locale, key);
  const path = servicePath(locale, key);

  const crumbs = [
    { label: s.labels.breadcrumbHome, href: pagePath(locale, "home") },
    { label: s.hub.navLabel, href: pagePath(locale, "services") },
    { label: service.navLabel, href: path },
  ];

  // the page's own FAQ block doubles as FAQPage data — one source, so the
  // rich result can never describe questions the page does not show
  const faq = service.sections.find((section) => section.kind === "faq");

  return (
    <>
      <JsonLd
        data={graph([
          organizationSchema(locale),
          websiteSchema(locale),
          webPageSchema(locale, path, service.metaTitle, service.metaDescription),
          breadcrumbSchema(crumbs),
          serviceSchema(locale, key),
          ...(faq ? [faqSchema(faq.items)] : []),
        ])}
      />
      <Nav locale={locale} t={t.nav} />
      <main id="main" tabIndex={-1}>
        <PageHero
          kicker={service.kicker}
          title={service.h1}
          intro={service.intro}
          crumbs={crumbs}
          crumbsLabel={s.labels.breadcrumbAria}
        />
        <ServiceSectionList sections={service.sections} />
        <RelatedServices locale={locale} current={key} />
        <CtaBand locale={locale} t={{ ...t.cta, primary: service.ctaLabel }} />
      </main>
      <Footer locale={locale} t={t} />
      <MobileQuoteBar
        quoteHref={pagePath(locale, "contact")}
        quoteLabel={t.nav.cta}
        phone={t.contact.details.phone}
        phoneLabel={t.contact.details.callLabel}
      />
    </>
  );
}

export type { Locale };
export { locales };
