import Reveal from "./ui/Reveal";
import type { Content } from "@/lib/content";

export default function About({ t }: { t: Content["about"] }) {
  return (
    <section className="on-paper bg-paper" aria-label={t.title}>
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-6">
            <Reveal delay={0.1}>
              <div className="space-y-6">
                {t.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="text-base leading-relaxed text-ink-soft md:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-5 md:col-start-8">
            <Reveal delay={0.15}>
              <div className="border rule-light bg-white">
                <div className="border-b rule-light px-5 py-3 md:px-6">
                  <p className="mono-label text-ink-soft">{t.factsLabel}</p>
                </div>
                <dl>
                  {t.facts.map((fact, i) => (
                    <div
                      key={fact.label}
                      className={`px-5 py-4 md:px-6 ${i > 0 ? "border-t rule-light" : ""}`}
                    >
                      <dt className="mono-label text-steel">{fact.label}</dt>
                      <dd className="mt-1.5 font-mono text-sm text-ink">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
