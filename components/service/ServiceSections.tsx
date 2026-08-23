import SectionHeader from "../ui/SectionHeader";
import Reveal from "../ui/Reveal";
import RegistrationMark from "../ui/RegistrationMark";
import SpotlightCells from "../ui/SpotlightCells";
import ProcessChain from "../ProcessChain";
import ServiceFaq from "./ServiceFaq";
import SectionDots from "../ui/SectionDots";
import type { Section } from "@/lib/services";

/*
  Renderers for the service-page section types. One component per `kind`, so a
  page's shape lives in lib/services.ts as data and the PM can reorder or drop
  a section without touching JSX.

  Surface rhythm is decided here rather than in the data: the renderer walks the
  list and alternates paper / paper-dim for consecutive light sections, so the
  dark→light→dark banding of the home page carries over to every service page
  without anyone having to keep track by hand.
*/

const LIGHT_KINDS = new Set(["prose", "spec", "faq"]);

export function ServiceSectionList({ sections }: { sections: Section[] }) {
  let lightRun = 0;

  return (
    <>
      {sections.map((section, i) => {
        const light = LIGHT_KINDS.has(section.kind);
        lightRun = light ? lightRun + 1 : 0;
        // second and fourth light section in a row step down to the dim surface
        const dim = light && lightRun % 2 === 0;
        return <ServiceSection key={`${section.kind}-${i}`} section={section} index={i} dim={dim} />;
      })}
    </>
  );
}

function ServiceSection({
  section,
  index,
  dim,
}: {
  section: Section;
  index: number;
  dim: boolean;
}) {
  const id = `sec-${index}`;

  switch (section.kind) {
    case "prose":
      return <ProseSection section={section} id={id} dim={dim} />;
    case "chain":
      return (
        <ProcessChain
          id={id}
          kicker={section.kicker}
          title={section.title}
          intro={section.intro}
          steps={section.steps}
        />
      );
    case "deliverables":
      return <DeliverablesSection section={section} id={id} />;
    case "usecases":
      return <UseCasesSection section={section} id={id} />;
    case "spec":
      return <SpecSection section={section} id={id} dim={dim} />;
    case "faq":
      return <ServiceFaq kicker={section.kicker} title={section.title} items={section.items} dim={dim} />;
  }
}

/* --------------------------------------------------------- prose + fact card */

function ProseSection({
  section,
  id,
  dim,
}: {
  section: Extract<Section, { kind: "prose" }>;
  id: string;
  dim: boolean;
}) {
  return (
    <section
      className={`relative isolate on-paper ${dim ? "bg-paper-dim" : "bg-paper"}`}
      aria-labelledby={id}
    >
      <SectionDots />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeader id={id} kicker={section.kicker} title={section.title} tone="light" />
        </Reveal>

        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-6">
            <Reveal delay={0.1}>
              <div className="space-y-6">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="text-base leading-relaxed text-ink-soft md:text-lg"
                  >
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
                  <p className="mono-label text-ink-soft">{section.factsLabel}</p>
                </div>
                <dl>
                  {section.facts.map((fact, i) => (
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

/* ----------------------------------------------------------- deliverables band */

function DeliverablesSection({
  section,
  id,
}: {
  section: Extract<Section, { kind: "deliverables" }>;
  id: string;
}) {
  return (
    <section className="relative isolate on-blueprint bg-blueprint-deep" aria-labelledby={id}>
      <SectionDots />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        {/* stays brand dark blue in both themes — colors here are static */}
        <Reveal>
          <header className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 border-b border-white/15 pb-3 text-white/70">
              <RegistrationMark className="h-3 w-3 shrink-0 text-coral" />
              <p className="mono-label">{section.kicker}</p>
            </div>
            <h2 id={id} className="display-tight mt-8 max-w-3xl text-display-lg text-white">
              {section.title}
            </h2>
          </header>
        </Reveal>

        <SpotlightCells className="grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, i) => (
            <li key={item.ext} className="spot-cell group overflow-hidden bg-blueprint-deep">
              <Reveal delay={i * 0.05} className="flex h-full flex-col justify-between gap-8 px-6 py-7">
                <p className="font-mono text-xl font-semibold tracking-tight text-sky transition-colors duration-500 group-hover:text-white md:text-2xl">
                  {item.ext}
                </p>
                <p className="text-sm text-white/80">{item.format}</p>
              </Reveal>
            </li>
          ))}
        </SpotlightCells>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- use cases */

function UseCasesSection({
  section,
  id,
}: {
  section: Extract<Section, { kind: "usecases" }>;
  id: string;
}) {
  return (
    <section className="relative isolate bg-ground" aria-labelledby={id}>
      <SectionDots />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeader
            id={id}
            kicker={section.kicker}
            title={section.title}
            intro={section.intro}
            tone="dark"
          />
        </Reveal>
        <ul className="grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, i) => (
            <Reveal as="li" key={item.who} delay={i * 0.07}>
              <div className="datum flex h-full flex-col border-t rule-dark pt-5">
                <p className="mono-label text-cerulean">U-{String(i + 1).padStart(2, "0")}</p>
                <h3 className="display-tight mt-3 text-xl text-frost md:text-2xl">{item.who}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-mist">{item.need}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- spec sheet */

function SpecSection({
  section,
  id,
  dim,
}: {
  section: Extract<Section, { kind: "spec" }>;
  id: string;
  dim: boolean;
}) {
  return (
    <section
      className={`relative isolate on-paper ${dim ? "bg-paper-dim" : "bg-paper"}`}
      aria-labelledby={id}
    >
      <SectionDots />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeader id={id} kicker={section.kicker} title={section.title} tone="light" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="border rule-light bg-white">
            <div className="flex items-center justify-between border-b rule-light px-5 py-3 md:px-8">
              <p className="mono-label text-ink-soft">{section.sheetLabel}</p>
              <p className="mono-label text-coral">{section.badge}</p>
            </div>
            <dl>
              {section.rows.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid gap-1 px-5 py-4 transition-colors duration-300 hover:bg-paper-dim/60 md:grid-cols-12 md:gap-6 md:px-8 md:py-5 ${
                    i > 0 ? "border-t rule-light" : ""
                  }`}
                >
                  <dt className="mono-label pt-0.5 text-ink-soft md:col-span-4">{row.label}</dt>
                  <dd className="font-mono text-[0.95rem] leading-relaxed text-ink md:col-span-8">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
