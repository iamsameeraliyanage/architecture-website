import Breadcrumbs from "./Breadcrumbs";
import RegistrationMark from "./RegistrationMark";
import Reveal from "./Reveal";
import SplitReveal from "./SplitReveal";
import SectionDots from "./SectionDots";

/*
  Header band for the standalone pages (pricing, about, contact).
  It sits directly under the fixed nav, so it owns the dark ground the
  transparent nav is drawn against — never render a page without one.
*/
export default function PageHero({
  kicker,
  title,
  intro,
  crumbs,
  crumbsLabel,
  id = "page-title",
}: {
  kicker: string;
  title: string;
  intro?: string;
  /** trail for pages below the top level; omitted on the first-level pages */
  crumbs?: Array<{ label: string; href: string }>;
  crumbsLabel?: string;
  id?: string;
}) {
  return (
    <section className="relative isolate bg-ground" aria-labelledby={id}>
      <SectionDots />
      <div className="shell pb-[var(--band)] pt-[calc(4rem+var(--band))] md:pt-[calc(4.5rem+var(--band))]">
        {crumbs && crumbsLabel ? (
          <Reveal immediate>
            <Breadcrumbs crumbs={crumbs} label={crumbsLabel} className="mb-8" />
          </Reveal>
        ) : null}

        <Reveal immediate>
          <div className="flex items-center gap-3 border-b rule-dark pb-3 text-mist">
            <RegistrationMark className="h-3 w-3 shrink-0 text-coral" />
            <p className="mono-label">{kicker}</p>
          </div>
        </Reveal>

        <SplitReveal
          as="h1"
          immediate
          delay={0.15}
          className="display-tight mt-8 max-w-4xl text-display-xl text-frost"
        >
          {title}
        </SplitReveal>

        {intro ? (
          <Reveal immediate delay={0.3}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist md:text-lg">{intro}</p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
