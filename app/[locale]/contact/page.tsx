import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import PageHero from "@/components/ui/PageHero";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
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
  const t = content[locale].pages.contact;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: pagePath(locale, "contact"), languages: pageAlternates("contact") },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: pagePath(locale, "contact"),
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = content[locale];
  const s = getServices(locale);
  const path = pagePath(locale, "contact");

  const crumbs = [
    { label: s.labels.breadcrumbHome, href: pagePath(locale, "home") },
    { label: t.nav.contact, href: path },
  ];

  return (
    <>
      <JsonLd
        data={graph([
          organizationSchema(locale),
          websiteSchema(locale),
          webPageSchema(locale, path, t.pages.contact.metaTitle, t.pages.contact.metaDescription),
          breadcrumbSchema(crumbs),
        ])}
      />
      <Nav locale={locale} t={t.nav} />
      <main id="main" tabIndex={-1}>
        <PageHero
          kicker={t.contact.kicker}
          title={t.contact.title}
          intro={t.contact.body}
          crumbs={crumbs}
          crumbsLabel={s.labels.breadcrumbAria}
        />
        <Contact t={t.contact} />
      </main>
      <Footer locale={locale} t={t} />
    </>
  );
}
