import Link from "next/link";
import HeroVisual from "./hero/HeroVisual";
import Reveal from "./ui/Reveal";
import SplitReveal from "./ui/SplitReveal";
import Magnetic from "./ui/Magnetic";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export default function Hero({ locale, t }: { locale: Locale; t: Content["hero"] }) {
  return (
    <section className="relative min-h-svh overflow-hidden bg-ground">
      <HeroVisual />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col px-5 pt-24 md:px-8 md:pt-28">
        {/* HUD readouts — the spec layer, staged */}
        <div className="absolute right-5 top-24 hidden flex-col items-end gap-2 md:top-28 lg:flex xl:right-8">
          {[t.hud.tolerance, t.hud.formats, t.hud.frame].map((readout, i) => (
            <Reveal immediate key={readout} delay={0.9 + i * 0.15}>
              <p className="mono-label border-r-2 border-cerulean pr-3 text-mist">{readout}</p>
            </Reveal>
          ))}
        </div>

        <div className="flex flex-1 flex-col justify-center pb-10">
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
                  href={`/${locale}#contact`}
                  className="block bg-coral px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-coral-bright"
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

        {/* the pipeline, legible as a sequence from the first frame */}
        <Reveal immediate delay={0.8}>
          <ol className="grid grid-cols-5 border-t rule-dark pb-7 pt-4 md:pb-8">
            {t.stages.map((stage, i) => (
              <li key={stage.code} className={`flex flex-col gap-1 pr-3 ${i > 0 ? "pl-3 md:pl-5" : ""}`}>
                <span className="mono-label flex items-center gap-2 text-cerulean">
                  {stage.code}
                  {i < t.stages.length - 1 && (
                    <span aria-hidden="true" className="hidden text-steel md:inline">
                      →
                    </span>
                  )}
                </span>
                <span className="hidden text-xs text-mist sm:block md:text-sm">{stage.name}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
