import Reveal from "./ui/Reveal";
import type { Content } from "@/lib/content";

export default function Pricing({ t }: { t: Content["pricing"] }) {
  return (
    <section id="pricing" className="on-paper scroll-mt-20 bg-paper-dim" aria-label={t.title}>
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <div className="grid border rule-light bg-white md:grid-cols-3">
            {t.tiers.map((tier, i) => (
              <article
                key={tier.lod}
                className={`flex flex-col px-6 py-8 md:px-8 md:py-10 ${
                  i > 0 ? "border-t rule-light md:border-l md:border-t-0" : ""
                }`}
              >
                <p className="mono-label text-coral">{tier.lod}</p>
                <h3 className="display-tight mt-3 text-lg text-ink md:min-h-[3.5rem] md:text-xl">
                  {tier.name}
                </h3>
                <p className="mt-6 font-mono text-3xl font-semibold tracking-tight text-blueprint md:text-4xl">
                  {tier.rate}
                  <span className="ml-1 text-sm font-normal text-ink-soft">{t.perUnit}</span>
                </p>
                <p className="mt-5 border-t rule-light pt-4 text-sm leading-relaxed text-ink-soft">
                  {tier.forLine}
                </p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-6 border rule-light bg-white px-6 py-6 md:px-8">
            <p className="mono-label text-ink-soft">{t.formulaLabel}</p>
            <p className="mt-3 font-mono text-sm text-ink md:text-base">{t.formula}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t.note}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
