import Link from "next/link";
import Nav from "./Nav";
import Footer from "./Footer";
import ServicesGrid from "./ServicesGrid";
import RegistrationMark from "./ui/RegistrationMark";
import Reveal from "./ui/Reveal";
import SplitReveal from "./ui/SplitReveal";
import Magnetic from "./ui/Magnetic";
import { content } from "@/lib/content";
import { pagePath } from "@/lib/routes";
import type { Locale } from "@/lib/i18n";

/*
  Shared 404 body.

  Rendered twice: by `app/global-not-found.tsx` for URLs that match no route at
  all, and by `app/[locale]/not-found.tsx` when a matched route calls
  notFound() — an unrecognised service slug, for instance.

  Beyond saying the address is wrong, it puts the four service pages one click
  away. A 404 that dead-ends is a lost session; the SEO scope asks for this page
  specifically for that reason.
*/
export default function NotFoundBody({ locale }: { locale: Locale }) {
  const t = content[locale];

  return (
    <>
      <Nav locale={locale} t={t.nav} />
      <main id="main" tabIndex={-1}>
        <section className="dot-field-dark bg-ground" aria-labelledby="nf-title">
          <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8 md:pb-32 md:pt-40">
            <Reveal immediate>
              <div className="flex items-center gap-3 border-b rule-dark pb-3 text-mist">
                <RegistrationMark className="h-3 w-3 shrink-0 text-coral" />
                <p className="mono-label">{t.notFound.kicker}</p>
              </div>
            </Reveal>

            <SplitReveal
              as="h1"
              id="nf-title"
              immediate
              delay={0.15}
              className="display-tight mt-8 max-w-4xl text-display-xl text-frost"
            >
              {t.notFound.title}
            </SplitReveal>

            <Reveal immediate delay={0.3}>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist md:text-lg">
                {t.notFound.body}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Magnetic>
                  <Link
                    href={pagePath(locale, "home")}
                    className="btn-cta block bg-coral px-7 py-4 text-sm font-medium text-white"
                  >
                    {t.notFound.primary}
                  </Link>
                </Magnetic>
                <Link
                  href={pagePath(locale, "services")}
                  className="group inline-flex items-center gap-2 text-sm text-mist transition-colors hover:text-frost"
                >
                  {t.notFound.secondary}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <ServicesGrid locale={locale} tone="light" />
      </main>
      <Footer locale={locale} t={t} />
    </>
  );
}
