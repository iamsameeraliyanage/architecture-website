import Image from "next/image";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import RegistrationMark from "./ui/RegistrationMark";
import Parallax from "./ui/Parallax";
import { getCaseStudies } from "@/lib/case-studies";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export default function CaseStudies({ locale, t }: { locale: Locale; t: Content["cases"] }) {
  const cases = getCaseStudies(locale);
  const specKeys = ["buildingType", "location", "area", "lod", "delivery"] as const;

  return (
    <section className="bg-ground" aria-labelledby="cases-title">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeader id="cases-title" kicker={t.kicker} title={t.title} intro={t.note} tone="dark" />
        </Reveal>

        <ul className="grid gap-6 md:grid-cols-3">
          {cases.map((entry, i) => (
            <Reveal as="li" key={entry.id} delay={i * 0.08}>
              <article className="group flex h-full flex-col border rule-dark transition-colors duration-500 hover:border-steel/60">
                <div className="flex items-center justify-between border-b rule-dark px-5 py-3">
                  <p className="mono-label text-frost transition-colors duration-500 group-hover:text-cerulean">
                    {entry.code}
                  </p>
                  <RegistrationMark className="h-3 w-3 text-coral transition-transform duration-700 ease-authored group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" />
                </div>

                <div className="relative aspect-[4/3] overflow-hidden border-b rule-dark">
                  {/* overscanned plate drifts on scroll (ERA data-parallax="img") */}
                  <Parallax className="absolute inset-x-0 -inset-y-[8%]" from={-5} to={5}>
                    <Image
                      src={entry.image}
                      alt={entry.imageAlt}
                      fill
                      sizes="(min-width: 768px) 30vw, 92vw"
                      quality={90}
                      className="object-cover transition-transform duration-1200 ease-authored group-hover:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </Parallax>
                  {entry.sample && (
                    <p className="mono-label absolute right-3 top-3 border rule-dark bg-ground/80 px-2 py-1 text-mist backdrop-blur-sm">
                      {t.sampleTag}
                    </p>
                  )}
                </div>

                <div className="flex flex-1 flex-col px-5 pb-2 pt-5">
                  <h3 className="display-tight text-xl text-frost">{entry.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-mist">{entry.summary}</p>
                  <dl className="mt-5">
                    {specKeys.map((key, j) => (
                      <div
                        key={key}
                        className={`flex items-baseline justify-between gap-4 py-2 ${
                          j > 0 ? "border-t rule-dark" : ""
                        }`}
                      >
                        <dt className="mono-label text-steel">{t.fieldLabels[key]}</dt>
                        <dd className="text-right font-mono text-sm text-mist">{entry.specs[key]}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
