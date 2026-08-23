import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import PageHero from "@/components/ui/PageHero";
import About from "@/components/About";
import Approach from "@/components/Approach";
import ServicesGrid from "@/components/ServicesGrid";
import Team from "@/components/Team";
import Partner from "@/components/Partner";
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
  const t = content[locale].pages.about;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: pagePath(locale, "about"), languages: pageAlternates("about") },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: pagePath(locale, "about"),
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = content[locale];
  const s = getServices(locale);
  const path = pagePath(locale, "about");

  const crumbs = [
    { label: s.labels.breadcrumbHome, href: pagePath(locale, "home") },
    { label: t.nav.about, href: path },
  ];

  return (
    <>
      <JsonLd
        data={graph([
          organizationSchema(locale),
          websiteSchema(locale),
          webPageSchema(locale, path, t.pages.about.metaTitle, t.pages.about.metaDescription),
          breadcrumbSchema(crumbs),
        ])}
      />
      <Nav locale={locale} t={t.nav} />
      <main id="main" tabIndex={-1}>
        <PageHero
          kicker={t.about.kicker}
          title={t.about.title}
          intro={t.about.lead}
          crumbs={crumbs}
          crumbsLabel={s.labels.breadcrumbAria}
        />
        <About t={t.about} />
        <Approach t={t.about} />
        {/* the page states what we do; the grid is where that becomes clickable */}
        <ServicesGrid locale={locale} tone="light" />
        <Team t={t.team} />
        <Partner t={t.partner} />
        <CtaBand locale={locale} t={t.cta} />
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
