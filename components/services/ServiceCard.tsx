import Link from "next/link";
import RegistrationMark from "../ui/RegistrationMark";
import { servicePath } from "@/lib/routes";
import type { Service } from "@/lib/services";
import type { Locale } from "@/lib/i18n";

/*
  The service plate, shared by the card grid (ServicesGrid) and the pinned
  horizontal chain (ServicesTrack). Both hubs carry the same descriptive
  internal links, so the markup lives here once — a drift between the two
  would mean two different anchor texts for the same four pages.

  Whole-card link: the anchor covers the plate via an inset overlay so the
  click target is the card, while the accessible name stays the service title.
*/
export default function ServiceCard({
  service,
  index,
  locale,
  readMoreLabel,
  dark = false,
  variant = "grid",
}: {
  service: Service;
  index: number;
  locale: Locale;
  readMoreLabel: string;
  dark?: boolean;
  /** "track" adds the oversized plate numeral the horizontal pan parallaxes */
  variant?: "grid" | "track";
}) {
  const ordinal = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`datum group relative flex h-full flex-col overflow-hidden border transition-colors duration-500 ${
        dark
          ? "rule-dark hover:border-steel/60"
          : "rule-light bg-white hover:border-ink-soft/40"
      }`}
    >
      {/* the plate numeral only exists in the track, where the horizontal pan
          drifts it against its own card — in the grid there is nothing moving
          for it to be parallax against, so CSS keeps it out of the flow */}
      {variant === "track" && (
        <span
          aria-hidden="true"
          className="track-plate display-tight pointer-events-none absolute -bottom-6 -right-2 select-none text-[9rem] leading-none text-ink/[0.045]"
        >
          {ordinal}
        </span>
      )}

      <div className="relative flex flex-1 flex-col px-5 pb-6 pt-5">
        {/* plate row: the registration mark sits directly above the title with
            the card's position in the chain opposite it, so the survey
            structure reads without an empty header bar */}

        <h3
          className={`display-tight mt-5 text-xl ${dark ? "text-frost" : "text-ink"}`}
        >
          <Link
            href={servicePath(locale, service.key)}
            className={`transition-colors duration-500 before:absolute before:inset-0 ${
              dark
                ? "group-hover:text-cerulean-soft"
                : "group-hover:text-blueprint"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              {service.cardTitle}
              <RegistrationMark className="h-[15px] w-[15px] text-coral transition-transform duration-700 ease-authored group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" />
            </div>
          </Link>
        </h3>
        <p
          className={`mt-3 text-[0.95rem] leading-relaxed ${dark ? "text-mist" : "text-ink-soft"}`}
        >
          {service.cardSummary}
        </p>

        {/* mt-auto pins the spec chips to the bottom of the body, so they line
            up across the row even though the summaries and titles run to
            different lengths */}
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

      {/* plate foot — the read-more row carries the card's bottom rule, so
          every card ends on the same line */}
      <div
        className={`relative flex items-center justify-between border-t px-5 py-3.5 transition-colors duration-500 ${
          dark
            ? "rule-dark text-steel group-hover:text-cerulean-soft"
            : "rule-light text-steel group-hover:text-blueprint"
        }`}
      >
        <span className="mono-label">{readMoreLabel}</span>
        <span
          aria-hidden="true"
          className="transition-transform duration-500 ease-authored group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </article>
  );
}
