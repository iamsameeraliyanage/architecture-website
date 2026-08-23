import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import RegistrationMark from "./ui/RegistrationMark";
import SectionDots from "./ui/SectionDots";
import type { Content } from "@/lib/content";

/*
  The about page's argument section: why the work is structured the way it is,
  set against the workflow chain and the Swiss project requirements it has to
  satisfy.

  The chain reads as a vertical traverse — station, hairline, station — so the
  four tools are visibly one sequence rather than a logo wall. It is drawn in
  CSS rather than scroll-driven; this section is far enough down the page that
  a second scrubbed animation would compete with the pipeline above it.
*/
export default function Approach({ t }: { t: Content["about"] }) {
  return (
    <section className="relative isolate bg-ground" aria-labelledby="approach-title">
      <SectionDots />
      <div className="shell band">
        <Reveal>
          <SectionHeader
            id="approach-title"
            kicker={t.approachKicker}
            title={t.approachTitle}
            tone="dark"
          />
        </Reveal>

        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <ul className="space-y-10">
              {t.approachBlocks.map((block, i) => (
                <Reveal as="li" key={block.title} delay={i * 0.08}>
                  <div className="datum border-t rule-dark pt-5">
                    <p className="mono-label text-cerulean">W-{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="display-tight mt-3 text-xl text-frost md:text-2xl">
                      {block.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-mist md:text-base">
                      {block.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.15}>
              <p className="mono-label border-b rule-dark pb-3 text-steel">{t.chainLabel}</p>
              <ol className="mt-5">
                {t.chain.map((step, i) => (
                  <li key={step} className="group relative flex gap-4 pb-7 last:pb-0">
                    {/* connector, drawn between this station and the next */}
                    {i < t.chain.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-[7px] top-4 h-full w-px bg-line-dark"
                      />
                    )}
                    <span className="relative z-10 mt-0.5 shrink-0 bg-ground">
                      <RegistrationMark className="h-[15px] w-[15px] text-coral" />
                    </span>
                    <span className="font-mono text-sm text-frost">{step}</span>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={0.25}>
              <p className="mono-label mt-12 border-b rule-dark pb-3 text-steel">{t.swissLabel}</p>
              <ul className="mt-2">
                {t.swiss.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-3 border-b rule-dark py-3 text-sm text-mist"
                  >
                    <span aria-hidden="true" className="mono-label text-cerulean">
                      +
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
