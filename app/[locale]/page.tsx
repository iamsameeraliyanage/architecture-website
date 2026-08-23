import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ScanToBim from "@/components/ScanToBim";
import Pipeline from "@/components/Pipeline";
import ServicesTrack from "@/components/ServicesTrack";
import Audiences from "@/components/Audiences";
import Standards from "@/components/Standards";
import Deliverables from "@/components/Deliverables";
import CaseStudies from "@/components/CaseStudies";
import Faq from "@/components/Faq";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import MobileQuoteBar from "@/components/ui/MobileQuoteBar";
import JsonLd from "@/components/ui/JsonLd";
import { content } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pagePath } from "@/lib/routes";
import {
  faqSchema,
  graph,
  organizationSchema,
  serviceListSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/schema";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = content[locale];
  const path = pagePath(locale, "home");

  return (
    <>
      <JsonLd
        data={graph([
          organizationSchema(locale),
          websiteSchema(locale),
          webPageSchema(locale, path, t.meta.title, t.meta.description),
          serviceListSchema(locale),
          faqSchema(t.faq.items),
        ])}
      />
      <Nav locale={locale} t={t.nav} />
      <main id="main" tabIndex={-1}>
        <Hero locale={locale} t={t.hero} />
        {/* the primary keyword's own section, stated as a problem before it is
            stated as a service — and the first light ground after the hero */}
        <ScanToBim locale={locale} t={t.scanToBim} />
        <Pipeline t={t.pipeline} />
        <ServicesTrack locale={locale} />
        <Audiences t={t.audiences} />
        <Standards t={t.standards} />
        <Deliverables t={t.deliverables} />
        <CaseStudies locale={locale} t={t.cases} />
        <Faq t={t.faq} />
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
