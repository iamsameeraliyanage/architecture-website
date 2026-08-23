import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import ServiceCard from "./services/ServiceCard";
import { getServices, serviceList } from "@/lib/services";
import SectionDots from "./ui/SectionDots";
import type { Locale } from "@/lib/i18n";

/*
  The four services as a card grid. This is the site's main internal-linking
  hub — it appears on the services page, the about page and the 404, so every
  service page is two clicks from anywhere with descriptive anchor text rather
  than a bare "learn more". The home page runs the same four plates as a
  scroll-driven horizontal chain instead (components/ServicesTrack.tsx); the
  plate itself is shared, so the two cannot drift apart.
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
      className={`relative isolate scroll-mt-20 ${dark ? "bg-ground" : "on-paper bg-paper"}`}
      aria-labelledby={headed ? id : undefined}
      aria-label={headed ? undefined : t.hub.gridTitle}
    >
      <SectionDots />
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
              <ServiceCard
                service={service}
                index={i}
                locale={locale}
                readMoreLabel={t.labels.readMore}
                dark={dark}
              />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
