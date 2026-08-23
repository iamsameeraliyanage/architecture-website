import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import SectionDots from "./ui/SectionDots";
import ServiceCard from "./services/ServiceCard";
import ServicesTrackPin from "./services/ServicesTrackPin";
import { getServices, serviceList } from "@/lib/services";
import type { Locale } from "@/lib/i18n";

/*
  "What we do", panned rather than tiled.

  Same four service plates and the same descriptive internal links as
  ServicesGrid — this is the site's main linking hub and the anchors are load
  bearing — but on a desktop viewport the row is pinned and driven sideways by
  the page's vertical scroll. The section's own claim is "four services, one
  continuous chain", and a lateral pan is that sentence as a movement: the
  chain runs through the frame instead of being cut into four tiles.

  Everything is server-rendered as the ordinary grid; ServicesTrackPin only
  takes it over where the pan can be afforded (see that file). ServicesGrid
  stays the treatment on /services, /about and 404, where the section is an
  index the reader is scanning, not a moment.
*/
export default function ServicesTrack({
  locale,
  id = "services-title",
}: {
  locale: Locale;
  id?: string;
}) {
  const t = getServices(locale);
  const items = serviceList(locale);

  return (
    <section
      id="services"
      className="on-paper relative isolate scroll-mt-20 bg-paper"
      aria-labelledby={id}
    >
      <SectionDots />
      <div className="py-20 md:py-28">
        <ServicesTrackPin
          header={
            <Reveal>
              <SectionHeader
                id={id}
                kicker={t.hub.gridKicker}
                title={t.hub.gridTitle}
                intro={t.hub.gridIntro}
                tone="light"
              />
            </Reveal>
          }
        >
          {items.map((service, i) => (
            <li key={service.key} className="track-card h-full">
              <ServiceCard
                service={service}
                index={i}
                locale={locale}
                readMoreLabel={t.labels.readMore}
                variant="track"
              />
            </li>
          ))}
        </ServicesTrackPin>
      </div>
    </section>
  );
}
