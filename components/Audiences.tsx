import SectionHeader from "./ui/SectionHeader";
import AudienceIcon from "./ui/AudienceIcon";
import Reveal from "./ui/Reveal";
import StackingCards, { StackingCardItem } from "./ui/stacking-cards";
import SectionDots from "./ui/SectionDots";
import type { Content } from "@/lib/content";
import RegistrationMark from "./ui/RegistrationMark";

/*
  The five audiences read as a scroll-driven stack rather than a grid: one
  card holds the viewport at a time, the previous ones scale down and stay
  visible behind it, so the section reads as a deck of client briefs.

  Geometry notes:
  - each item is one viewport-ish tall (80svh, floored at 520px), so the whole
    section costs ~4 screens of scroll.
  - `topPosition` is a percentage of that item and has to clear the fixed nav
    (h-16 / 72px): 11% of 80svh is ~79px on a 900px viewport. It grows per
    index so the stacked edges stay readable behind the live card.
  - the card is 82% of the item, which leaves room for that offset.
  - height has to come from here, not from the ui component — see the note in
    ui/stacking-cards.tsx.
*/

export default function Audiences({ t }: { t: Content["audiences"] }) {
  const total = t.blocks.length;

  return (
    <section className="relative isolate bg-ground" aria-labelledby="audiences-title">
      <SectionDots />
      <div className="shell band-t">
        <Reveal>
          <SectionHeader id="audiences-title" kicker={t.kicker} title={t.title} tone="dark" />
        </Reveal>
      </div>

      <StackingCards
        totalCards={total}
        scaleMultiplier={0.035}
        className="shell band-b"
      >
        {t.blocks.map((block, i) => {
          const n = String(i + 1).padStart(2, "0");
          return (
            <StackingCardItem
              key={block.who}
              index={i}
              /* 13%, not 11%: at the shorter mobile item height 11% lands the
                 card's top edge under the 64px header, so the sheet code at
                 the top of the live card was the one thing the nav covered */
              topPosition={`${13 + i * 2}%`}
              /*
                The deck was one 80svh item per card at every width — five
                cards plus the dwell spacer came to 4,090px on a phone, a
                fifth of the whole page, to carry five two-line paragraphs.
                The card holds ~230px of content, so on mobile the item is
                sized to that rather than to the viewport and the card takes
                a larger share of it; the stack still stacks and each card
                still gets a full beat of dwell.
              */
              className="h-[max(64svh,440px)] md:h-[max(80svh,520px)]"
            >
              <article className="relative flex h-[88%] flex-col overflow-hidden border rule-dark bg-raised px-5 py-6 shadow-[0_-24px_48px_-28px_rgba(0,0,0,0.55)] sm:px-6 sm:py-7 md:h-[82%] md:px-12 md:py-10">
                {/* datasheet numeral — fills the card the way the sheet codes do
                    elsewhere on the page, without adding another readable line */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-8 right-2 select-none font-mono text-[9rem] leading-none text-frost/[0.04] md:-top-12 md:text-[15rem]"
                >
                  {n}
                </span>

                <div className="relative flex items-center justify-between gap-4 border-b rule-dark pb-4">
                  <p className="mono-label text-cerulean">
                    {n} / {String(total).padStart(2, "0")}
                  </p>
                  <RegistrationMark className="h-3 w-3 shrink-0 text-coral" />
                </div>

                <div className="relative grid flex-1 content-center gap-5 py-5 sm:gap-7 sm:py-8 lg:grid-cols-12 lg:gap-12">
                  <div className="lg:col-span-5">
                    <AudienceIcon
                      name={block.icon}
                      className="h-10 w-10 text-cerulean sm:h-11 sm:w-11 md:h-16 md:w-16"
                    />
                    <h3 className="display-tight mt-4 text-display-md text-frost sm:mt-6">
                      {block.who}
                    </h3>
                  </div>
                  <p className="text-base leading-relaxed text-mist md:text-lg lg:col-span-7 lg:self-center">
                    {block.need}
                  </p>
                </div>
              </article>
            </StackingCardItem>
          );
        })}

        {/*
          Trailing room inside the scroll container. Each item sticks until the
          container ends, so without this the last card is stuck for zero
          scroll and flicks past — this buys it the same dwell as the others.
        */}
        <div aria-hidden="true" className="h-[28svh] md:h-[45svh]" />
      </StackingCards>
    </section>
  );
}
