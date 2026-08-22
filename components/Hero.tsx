import Link from "next/link";
import HeroVisual from "./hero/HeroVisual";
import Reveal from "./ui/Reveal";
import SplitReveal from "./ui/SplitReveal";
import Magnetic from "./ui/Magnetic";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export default function Hero({ locale, t }: { locale: Locale; t: Content["hero"] }) {
  return (
    <section className="relative overflow-hidden bg-ground lg:min-h-svh">
      <HeroVisual />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-5 pt-24 md:px-8 md:pt-28 lg:min-h-svh">
        {/* HUD readouts — the spec layer, staged */}
        <div className="absolute right-8 top-24 hidden flex-col items-end gap-2 md:top-28 lg:flex">
          {[t.hud.tolerance, t.hud.formats, t.hud.frame].map((readout, i) => (
            <Reveal immediate key={readout} delay={0.9 + i * 0.15}>
              <p className="mono-label border-r-2 border-cerulean pr-3 text-mist">{readout}</p>
            </Reveal>
          ))}
        </div>

        <div className="flex flex-1 flex-col justify-center pb-12 lg:pb-10">
          <Reveal immediate delay={0.1}>
            <p className="mono-label text-cerulean">{t.eyebrow}</p>
          </Reveal>

          <SplitReveal
            as="h1"
            immediate
            delay={0.25}
            className="display-tight mt-6 max-w-5xl text-display-xl text-frost"
          >
            {t.headlineA}
            <br />
            <span className="text-cerulean-soft">{t.headlineB}</span>
          </SplitReveal>

          <Reveal immediate delay={0.45}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-mist md:text-lg">
              {t.subhead}
            </p>
          </Reveal>

          <Reveal immediate delay={0.6}>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Magnetic>
                <Link
                  href={`/${locale}/contact`}
                  className="btn-cta block bg-coral px-7 py-4 text-sm font-medium text-white"
                >
                  {t.ctaPrimary}
                </Link>
              </Magnetic>
              <Link
                href={`/${locale}#process`}
                className="group inline-flex items-center gap-2 text-sm text-mist transition-colors hover:text-frost"
              >
                {t.ctaSecondary}
                <span aria-hidden="true" className="transition-transform group-hover:translate-y-0.5">
                  ↓
                </span>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* the pipeline, legible as a sequence from the first frame — desktop
            only: on phones and tablets the five steps crush together and the
            section below covers the same ground */}
        {/* the rule is the static datum line; the stations plot onto it one by
            one, left to right, echoing the pipeline order */}
        <ol className="hidden grid-cols-5 border-t rule-dark pb-10 pt-4 lg:grid lg:pb-8">
          {t.stages.map((stage, i) => (
            <Reveal
              as="li"
              immediate
              key={stage.code}
              delay={0.75 + i * 0.08}
              className={`flex flex-col gap-1 pr-1 sm:pr-3 ${i > 0 ? "pl-1 sm:pl-3 md:pl-5" : ""}`}
            >
              <span className="mono-label flex items-center gap-2 whitespace-nowrap text-cerulean">
                {stage.code}
                {i < t.stages.length - 1 && (
                  <span aria-hidden="true" className="hidden text-steel md:inline">
                    →
                  </span>
                )}
              </span>
              <span className="hidden text-xs text-mist sm:block md:text-sm">{stage.name}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
