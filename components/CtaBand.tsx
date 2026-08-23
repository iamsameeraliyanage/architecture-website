import Link from "next/link";
import RegistrationMark from "./ui/RegistrationMark";
import Reveal from "./ui/Reveal";
import SplitReveal from "./ui/SplitReveal";
import Magnetic from "./ui/Magnetic";
import SectionDots from "./ui/SectionDots";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

/*
  Closing band shared by the home page and the standalone pages. `omit` drops
  the link that would point at the page you are already on.
*/
export default function CtaBand({
  locale,
  t,
  omit,
}: {
  locale: Locale;
  t: Content["cta"];
  omit?: "contact" | "pricing";
}) {
  return (
    <section className="relative isolate border-t rule-dark bg-ground" aria-labelledby="cta-title">
      <SectionDots />
      <div className="shell band grid gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <Reveal>
            <div className="flex items-center gap-3 text-mist">
              <RegistrationMark className="h-3 w-3 shrink-0 text-coral" />
              <p className="mono-label">{t.kicker}</p>
            </div>
          </Reveal>
          <SplitReveal as="h2" id="cta-title" className="display-tight mt-5 text-display-lg text-frost">
            {t.title}
          </SplitReveal>
        </div>

        <div className="flex flex-col justify-end md:col-span-5">
          <Reveal delay={0.1}>
            <p className="text-base leading-relaxed text-mist">{t.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              {omit !== "contact" && (
                <Magnetic>
                  <Link
                    href={`/${locale}/contact`}
                    className="btn-cta block bg-coral px-7 py-4 text-sm font-medium text-white"
                  >
                    {t.primary}
                  </Link>
                </Magnetic>
              )}
              {omit !== "pricing" && (
                <Link
                  href={`/${locale}/pricing`}
                  className="group -my-3 inline-flex min-h-11 items-center gap-2 py-3 text-sm text-mist transition-colors hover:text-frost"
                >
                  {t.secondary}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
