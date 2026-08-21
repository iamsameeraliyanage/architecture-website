import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Pipeline from "@/components/Pipeline";
import Audiences from "@/components/Audiences";
import Standards from "@/components/Standards";
import Deliverables from "@/components/Deliverables";
import CaseStudies from "@/components/CaseStudies";
import Faq from "@/components/Faq";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import { content } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = content[locale];

  return (
    <>
      <Nav locale={locale} t={t.nav} />
      <main>
        <Hero locale={locale} t={t.hero} />
        <Pipeline t={t.pipeline} />
        <Audiences t={t.audiences} />
        <Standards t={t.standards} />
        <Deliverables t={t.deliverables} />
        <CaseStudies t={t.cases} />
        <Faq t={t.faq} />
        <CtaBand locale={locale} t={t.cta} />
      </main>
      <Footer locale={locale} t={t} />
    </>
  );
}
