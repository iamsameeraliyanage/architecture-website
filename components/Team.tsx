import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import SectionDots from "./ui/SectionDots";
import type { Content } from "@/lib/content";

export default function Team({ t }: { t: Content["team"] }) {
  return (
    <section className="relative isolate on-paper bg-paper-dim" aria-labelledby="team-title">
      <SectionDots />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeader id="team-title" kicker={t.kicker} title={t.title} intro={t.note} tone="light" />
        </Reveal>

        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {t.members.map((member, i) => (
            <Reveal as="li" key={`${member.role}-${i}`} delay={i * 0.05}>
              <div className="flex h-full flex-col">
                <div className="dot-field-light relative flex aspect-square items-center justify-center border rule-light bg-white">
                  <span aria-hidden="true" className="mono-label text-steel">
                    {member.name}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium text-ink">{member.name}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{member.role}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
