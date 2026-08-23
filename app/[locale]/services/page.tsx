import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import PageHero from "@/components/ui/PageHero";
import ServicesGrid from "@/components/ServicesGrid";
import ProcessChain from "@/components/ProcessChain";
import Standards from "@/components/Standards";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import MobileQuoteBar from "@/components/ui/MobileQuoteBar";
import JsonLd from "@/components/ui/JsonLd";
import { content } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageAlternates, pagePath } from "@/lib/routes";
import { getServices } from "@/lib/services";
import {
  breadcrumbSchema,
  graph,
  organizationSchema,
  serviceListSchema,
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
  const t = getServices(locale).hub;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: pagePath(locale, "services"), languages: pageAlternates("services") },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: pagePath(locale, "services"),
    },
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ServicesHub locale={locale} />;
}

function ServicesHub({ locale }: { locale: Locale }) {
  const t = content[locale];
  const s = getServices(locale);
  const path = pagePath(locale, "services");

  const crumbs = [
    { label: s.labels.breadcrumbHome, href: pagePath(locale, "home") },
    { label: s.hub.navLabel, href: path },
  ];

  return (
    <>
      <JsonLd
        data={graph([
          organizationSchema(locale),
          websiteSchema(locale),
          webPageSchema(locale, path, s.hub.metaTitle, s.hub.metaDescription),
          breadcrumbSchema(crumbs),
          serviceListSchema(locale),
        ])}
      />
      <Nav locale={locale} t={t.nav} />
      <main id="main" tabIndex={-1}>
        <PageHero
          kicker={s.hub.kicker}
          title={s.hub.h1}
          intro={s.hub.intro}
          crumbs={crumbs}
          crumbsLabel={s.labels.breadcrumbAria}
        />
        <ServicesGrid locale={locale} tone="light" />
        {/* the chain the four services sit on, so the hub answers "in what
            order?" as well as "what do you do?" */}
        <ProcessChain
          id="hub-chain-title"
          kicker={t.pipeline.kicker}
          title={t.pipeline.title}
          intro={t.pipeline.intro}
          steps={t.pipeline.stages.map((stage) => ({
            code: stage.code,
            name: stage.name,
            body: stage.body,
          }))}
        />
        <Standards t={t.standards} />
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
