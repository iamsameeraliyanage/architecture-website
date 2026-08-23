import Link from "next/link";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import { pagePath } from "@/lib/routes";
import SectionDots from "./ui/SectionDots";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

/*
  The home page's primary-keyword section: "Scan to BIM" carried in the H2 and
  the opening sentence, with the problem stated before the service is named.

  The applications list is the visual counterweight — a tally sheet of ticked
  entries rather than a bulleted list, each row acknowledging the pointer with
  its own hairline. Same survey register as the audiences datum blocks.
*/
export default function ScanToBim({ locale, t }: { locale: Locale; t: Content["scanToBim"] }) {
  return (
    <section className="relative isolate on-paper bg-paper" aria-labelledby="scan-to-bim-title">
      <SectionDots />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeader id="scan-to-bim-title" kicker={t.kicker} title={t.title} tone="light" />
        </Reveal>

        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <Reveal delay={0.1}>
              <div className="space-y-6">
                {t.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="text-base leading-relaxed text-ink-soft md:text-lg"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <Link
                href={pagePath(locale, "services")}
                className="group mt-8 inline-flex items-center gap-2 border-b border-ink-soft/30 pb-1 text-sm font-medium text-ink transition-colors hover:border-coral hover:text-coral"
              >
                {t.link}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-500 ease-authored group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </Reveal>
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <Reveal delay={0.15}>
              <p className="mono-label border-b rule-light pb-3 text-ink-soft">
                {t.applicationsLabel}
              </p>
              <ul>
                {t.applications.map((item, i) => (
                  <li
                    key={item}
                    className="group flex items-baseline gap-4 border-b rule-light py-3 transition-colors duration-500 hover:border-coral"
                  >
                    <span className="mono-label shrink-0 text-steel transition-colors duration-500 group-hover:text-coral">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[0.95rem] text-ink">{item}</span>
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
