import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import PageHero from "@/components/ui/PageHero";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { content } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

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
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { en: "/en/contact", de: "/de/contact" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: `/${locale}/contact`,
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = content[locale];

  return (
    <>
      <Nav locale={locale} t={t.nav} />
      <main id="main" tabIndex={-1}>
        <PageHero kicker={t.contact.kicker} title={t.contact.title} intro={t.contact.body} />
        <Contact t={t.contact} />
      </main>
      <Footer locale={locale} t={t} />
    </>
  );
}
