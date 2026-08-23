import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import PageHero from "@/components/ui/PageHero";
import Pricing from "@/components/Pricing";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import MobileQuoteBar from "@/components/ui/MobileQuoteBar";
import JsonLd from "@/components/ui/JsonLd";
import { content } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pageAlternates, pagePath } from "@/lib/routes";
import { getServices } from "@/lib/services";
import {
  breadcrumbSchema,
  graph,
  organizationSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = content[locale].pages.pricing;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: pagePath(locale, "pricing"), languages: pageAlternates("pricing") },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: pagePath(locale, "pricing"),
    },
  };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = content[locale];
  const s = getServices(locale);
  const path = pagePath(locale, "pricing");

  const crumbs = [
    { label: s.labels.breadcrumbHome, href: pagePath(locale, "home") },
    { label: t.nav.pricing, href: path },
  ];

  return (
    <>
      <JsonLd
        data={graph([
          organizationSchema(locale),
          websiteSchema(locale),
          webPageSchema(locale, path, t.pages.pricing.metaTitle, t.pages.pricing.metaDescription),
          breadcrumbSchema(crumbs),
        ])}
      />
      <Nav locale={locale} t={t.nav} />
      <main id="main" tabIndex={-1}>
        <PageHero
          kicker={t.pricing.kicker}
          title={t.pricing.title}
          intro={t.pricing.intro}
          crumbs={crumbs}
          crumbsLabel={s.labels.breadcrumbAria}
        />
        <Pricing t={t.pricing} />
        <CtaBand locale={locale} t={t.cta} omit="pricing" />
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
