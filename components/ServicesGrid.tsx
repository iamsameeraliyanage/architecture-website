import Link from "next/link";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import RegistrationMark from "./ui/RegistrationMark";
import { servicePath } from "@/lib/routes";
import { getServices, serviceList } from "@/lib/services";
import type { Locale } from "@/lib/i18n";

/*
  The four services as a card grid. This is the site's main internal-linking
  hub — it appears on the home page, the services page and the about page, so
  every service page is two clicks from anywhere with descriptive anchor text
  rather than a bare "learn more".

  Whole-card link: the anchor covers the card via an inset overlay so the click
  target is the card, while the accessible name stays the service title.
*/
export default function ServicesGrid({
  locale,
  tone = "light",
  headed = true,
  id = "services-title",
}: {
  locale: Locale;
  tone?: "dark" | "light";
  /** drop the section head where the page hero already says it */
  headed?: boolean;
  id?: string;
}) {
  const t = getServices(locale);
  const items = serviceList(locale);
  const dark = tone === "dark";

  return (
    <section
      id="services"
      className={`scroll-mt-20 ${dark ? "bg-ground" : "on-paper bg-paper"}`}
      aria-labelledby={headed ? id : undefined}
      aria-label={headed ? undefined : t.hub.gridTitle}
    >
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        {headed && (
          <Reveal>
            <SectionHeader
              id={id}
              kicker={t.hub.gridKicker}
              title={t.hub.gridTitle}
              intro={t.hub.gridIntro}
              tone={tone}
            />
          </Reveal>
        )}

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((service, i) => (
            <Reveal as="li" key={service.key} delay={i * 0.07} className="h-full">
              <article
                className={`datum group relative flex h-full flex-col border transition-colors duration-500 ${
                  dark
                    ? "rule-dark hover:border-steel/60"
                    : "rule-light bg-white hover:border-ink-soft/40"
                }`}
              >
                <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
                  {/* plate row: the registration mark sits directly above the
                      title with the card's position in the chain opposite it,
                      so the survey structure reads without an empty header bar */}
                  <div className="flex items-center justify-between">
                    <RegistrationMark className="h-[15px] w-[15px] text-coral transition-transform duration-700 ease-authored group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" />
                    <span className={`mono-label ${dark ? "text-steel" : "text-ink-soft/70"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className={`display-tight mt-5 text-xl ${dark ? "text-frost" : "text-ink"}`}>
                    <Link
                      href={servicePath(locale, service.key)}
                      className={`transition-colors duration-500 before:absolute before:inset-0 ${
                        dark ? "group-hover:text-cerulean-soft" : "group-hover:text-blueprint"
                      }`}
                    >
                      {service.cardTitle}
                    </Link>
                  </h3>
                  <p
                    className={`mt-3 text-[0.95rem] leading-relaxed ${
                      dark ? "text-mist" : "text-ink-soft"
                    }`}
                  >
                    {service.cardSummary}
                  </p>

                  {/* mt-auto pins the spec chips to the bottom of the body, so
                      they line up across the row even though the summaries and
                      titles run to different lengths */}
                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-7">
                    {service.cardSpecs.map((spec) => (
                      <li
                        key={spec}
                        className={`mono-label border px-2 py-1 ${
                          dark ? "rule-dark text-steel" : "rule-light text-ink-soft"
                        }`}
                      >
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* plate foot — the read-more row carries the card's bottom
                    rule, so every card ends on the same line */}
                <div
                  className={`flex items-center justify-between border-t px-5 py-3.5 transition-colors duration-500 ${
                    dark
                      ? "rule-dark text-steel group-hover:text-cerulean-soft"
                      : "rule-light text-steel group-hover:text-blueprint"
                  }`}
                >
                  <span className="mono-label">{t.labels.readMore}</span>
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-500 ease-authored group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
