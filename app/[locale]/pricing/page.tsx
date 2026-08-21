import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import PageHero from "@/components/ui/PageHero";
import Pricing from "@/components/Pricing";
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
  const t = content[locale].pages.pricing;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: { en: "/en/pricing", de: "/de/pricing" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: `/${locale}/pricing`,
    },
  };
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = content[locale];

  return (
    <>
      <Nav locale={locale} t={t.nav} />
      <main>
        <PageHero kicker={t.pricing.kicker} title={t.pricing.title} intro={t.pricing.intro} />
        <Pricing t={t.pricing} />
        <CtaBand locale={locale} t={t.cta} omit="pricing" />
      </main>
      <Footer locale={locale} t={t} />
    </>
  );
}
