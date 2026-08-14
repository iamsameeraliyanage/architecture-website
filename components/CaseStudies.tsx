import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import RegistrationMark from "./ui/RegistrationMark";
import Parallax from "./ui/Parallax";
import type { Content } from "@/lib/content";

export default function CaseStudies({ t }: { t: Content["cases"] }) {
  return (
    <section className="bg-ground" aria-labelledby="cases-title">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeader id="cases-title" kicker={t.kicker} title={t.title} intro={t.note} tone="dark" />
        </Reveal>

        <ul className="grid gap-6 md:grid-cols-3">
          {t.entries.map((entry, i) => (
            <Reveal as="li" key={entry} delay={i * 0.08}>
              <article className="flex h-full flex-col border rule-dark">
                <div className="flex items-center justify-between border-b rule-dark px-5 py-3">
                  <p className="mono-label text-frost">{entry}</p>
                  <RegistrationMark className="h-3 w-3 text-coral" />
                </div>
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b rule-dark">
                  {/* overscanned dot layer drifts on scroll (ERA data-parallax="img") */}
                  <Parallax className="dot-field-dark absolute inset-x-0 -inset-y-[14%]" from={-6} to={6} />
                  <p className="mono-label relative max-w-[80%] text-center text-steel">
                    {t.placeholderTag}
                  </p>
                </div>
                <dl className="px-5 py-4">
                  {t.fields.map((field, j) => (
                    <div
                      key={field.label}
                      className={`flex items-baseline justify-between gap-4 py-2 ${
                        j > 0 ? "border-t rule-dark" : ""
                      }`}
                    >
                      <dt className="mono-label text-steel">{field.label}</dt>
                      <dd className="font-mono text-sm text-mist">{field.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
