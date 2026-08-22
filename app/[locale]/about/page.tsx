import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import PageHero from "@/components/ui/PageHero";
import About from "@/components/About";
import Team from "@/components/Team";
import Partner from "@/components/Partner";
import CtaBand from "@/components/CtaBand";
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
  const t = content[locale].pages.about;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${locale}/about`,
      languages: { en: "/en/about", de: "/de/about" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: `/${locale}/about`,
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = content[locale];

  return (
    <>
      <Nav locale={locale} t={t.nav} />
      <main id="main" tabIndex={-1}>
        <PageHero kicker={t.about.kicker} title={t.about.title} intro={t.about.lead} />
        <About t={t.about} />
        <Team t={t.team} />
        <Partner t={t.partner} />
        <CtaBand locale={locale} t={t.cta} />
      </main>
      <Footer locale={locale} t={t} />
    </>
  );
}
