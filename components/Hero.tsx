import Link from "next/link";
import HeroVisual from "./hero/HeroVisual";
import MobileHeroStage from "./hero/MobileHeroStage";
import Reveal from "./ui/Reveal";
import SplitReveal from "./ui/SplitReveal";
import Magnetic from "./ui/Magnetic";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export default function Hero({ locale, t }: { locale: Locale; t: Content["hero"] }) {
  return (
    /*
      min-h-svh at every width, not just lg.

      svh rather than dvh or vh: dvh grows and shrinks as the mobile toolbar
      hides, which would re-lay-out the hero mid-scroll and re-trigger the
      point cloud's ResizeObserver on every frame of the toolbar animation;
      vh is the *large* viewport, so the CTA would start life under the
      toolbar. svh is the small one — the hero fits on first paint and never
      moves afterwards.
    */
    <section className="relative min-h-svh overflow-hidden bg-ground">
      <HeroVisual />

      {/* pt clears the fixed header: exactly its height below lg, where the
          stage sits directly under it, and the old generous gap from lg where
          the copy does */}
      <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col px-[max(var(--gutter),env(safe-area-inset-left))] pt-16 md:pt-[72px] lg:pt-28">
        {/* HUD readouts — the spec layer, staged */}
        <div className="absolute right-8 top-24 hidden flex-col items-end gap-2 md:top-28 lg:flex">
          {[t.hud.tolerance, t.hud.formats, t.hud.frame].map((readout, i) => (
            <Reveal immediate key={readout} delay={0.9 + i * 0.15}>
              <p className="mono-label border-r-2 border-cerulean pr-3 text-mist">{readout}</p>
            </Reveal>
          ))}
        </div>

        {/*
          Below lg the hero reads top to bottom as drawing, then argument: the
          apartment turning in the upper band, the claim and the action under
          it. That is the order the subject wants — you are being sold a survey
          of a building, so the building goes first — and it is the only
          arrangement in which the drawing is not competing with seven lines of
          subhead for the same pixels.

          The stage takes the slack (flex-1 inside it), so this block sizes to
          its content and sits directly beneath. From lg the stage is not
          rendered at all and the copy takes the slack instead, centring itself
          in the viewport beside the WebGL scene exactly as before.
        */}
        <MobileHeroStage />

        {/* Centred below lg, ranged left from lg.

            Centring works here because the stage sits directly above it on the
            same axis — drawing and copy share one centre line and read as one
            column. It would not work on desktop, where the copy is the left
            half of a two-column hero and the scene occupies the right. */}
        <div className="flex flex-1 flex-col justify-center pb-10 text-center lg:text-left">
          <Reveal immediate delay={0.1}>
            <p className="mono-label text-cerulean">{t.eyebrow}</p>
          </Reveal>

          <SplitReveal
            as="h1"
            immediate
            delay={0.25}
            className="display-tight mx-auto mt-5 max-w-5xl text-display-xl text-frost md:mt-6 lg:mx-0"
          >
            {t.headlineA}
            <br />
            <span className="text-cerulean-soft">{t.headlineB}</span>
          </SplitReveal>

          <Reveal immediate delay={0.45}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-mist md:mt-7 md:text-lg lg:mx-0">
              {t.subhead}
            </p>
          </Reveal>

          <Reveal immediate delay={0.6}>
            {/*
              Full-width on a phone, hugging its label from sm up. A primary
              action inset in a 320px column reads as one of several options;
              spanning the measure, it reads as the action. The 56px height is
              the thumb target, not the type size.
            */}
            <div className="mt-8 flex justify-center md:mt-9 lg:justify-start">
              <Magnetic className="w-full sm:w-auto">
                {/* placeholder destination — swap "#" for the real link */}
                <Link
                  href="#"
                  className="btn-cta flex min-h-14 w-full items-center justify-center bg-coral px-7 text-sm font-medium text-white sm:inline-flex sm:w-auto"
                >
                  {t.ctaPrimary}
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>

        {/*
          The pipeline, legible as a sequence from the first frame — desktop
          only.

          Five equal columns do not survive a phone, and the snap rail that
          stood in for them below lg has been dropped: it made the hero's last
          act a second horizontal gesture, competing with the services rail
          further down for the same affordance, and the five steps are carried
          in full by the Pipeline section either way. Nothing is lost on a
          phone but a duplicate.
        */}
        <ol className="hidden border-t rule-dark pb-8 pt-4 lg:grid lg:grid-cols-5">
          {t.stages.map((stage, i) => (
            <Reveal
              as="li"
              immediate
              key={stage.code}
              delay={0.75 + i * 0.08}
              className={`flex flex-col gap-1 pr-3 ${i > 0 ? "pl-3 xl:pl-5" : ""}`}
            >
              <span className="mono-label flex items-center gap-2 whitespace-nowrap text-cerulean">
                {stage.code}
                {i < t.stages.length - 1 && (
                  <span aria-hidden="true" className="text-steel">
                    →
                  </span>
                )}
              </span>
              <span className="text-sm text-mist">{stage.name}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
