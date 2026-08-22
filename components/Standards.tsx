import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import type { Content } from "@/lib/content";

export default function Standards({ t }: { t: Content["standards"] }) {
  return (
    <section className="on-paper bg-paper" aria-labelledby="standards-title">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeader id="standards-title" kicker={t.kicker} title={t.title} tone="light" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="border rule-light bg-white">
            <div className="flex items-center justify-between border-b rule-light px-5 py-3 md:px-8">
              <p className="mono-label text-ink-soft">{t.sheetLabel}</p>
              <p className="mono-label text-coral">±20 MM</p>
            </div>
            <dl>
              {t.rows.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid gap-1 px-5 py-4 transition-colors duration-300 hover:bg-paper-dim/60 md:grid-cols-12 md:gap-6 md:px-8 md:py-5 ${
                    i > 0 ? "border-t rule-light" : ""
                  }`}
                >
                  <dt className="mono-label pt-0.5 text-ink-soft md:col-span-4">{row.label}</dt>
                  <dd className="font-mono text-[0.95rem] text-ink md:col-span-8">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
