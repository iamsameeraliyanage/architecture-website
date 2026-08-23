import Link from "next/link";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import { pagePath, servicePath } from "@/lib/routes";
import { getServices, serviceList, type ServiceKey } from "@/lib/services";
import SectionDots from "./ui/SectionDots";
import type { Locale } from "@/lib/i18n";

/*
  Sibling links at the foot of a service page. Two jobs at once: it keeps a
  reader who landed on the wrong page from bouncing back to search, and it
  gives every service page three descriptive inbound internal links from its
  siblings — the internal anchor-text structure the SEO scope calls for.
*/
export default function RelatedServices({
  locale,
  current,
}: {
  locale: Locale;
  current: ServiceKey;
}) {
  const t = getServices(locale);
  const others = serviceList(locale).filter((service) => service.key !== current);

  return (
    <section className="relative isolate border-t rule-dark bg-ground" aria-labelledby="related-title">
      <SectionDots />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <Reveal>
          <SectionHeader
            id="related-title"
            kicker={t.labels.relatedKicker}
            title={t.labels.relatedTitle}
            tone="dark"
          />
        </Reveal>

        <ul className="border-t rule-dark">
          {others.map((service, i) => (
            <Reveal as="li" key={service.key} delay={i * 0.07}>
              <Link
                href={servicePath(locale, service.key)}
                className="group flex flex-col gap-2 border-b rule-dark py-6 transition-colors duration-500 hover:bg-raised/60 md:flex-row md:items-baseline md:gap-8 md:px-2"
              >
                <span className="display-tight flex-1 text-2xl text-frost transition-colors duration-500 group-hover:text-cerulean-soft md:text-3xl">
                  {service.cardTitle}
                </span>
                <span className="max-w-md flex-1 text-sm leading-relaxed text-mist md:text-right">
                  {service.cardSummary}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-steel transition-transform duration-500 ease-authored group-hover:translate-x-1 md:pl-4"
                >
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.2}>
          <Link
            href={pagePath(locale, "services")}
            className="mono-label group mt-8 inline-flex items-center gap-2 text-mist transition-colors hover:text-frost"
          >
            {t.labels.allServices}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
