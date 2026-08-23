import Reveal from "./ui/Reveal";
import RegistrationMark from "./ui/RegistrationMark";
import SpotlightCells from "./ui/SpotlightCells";
import SectionDots from "./ui/SectionDots";
import type { Content } from "@/lib/content";

export default function Deliverables({ t }: { t: Content["deliverables"] }) {
  return (
    <section className="relative isolate on-blueprint bg-blueprint-deep" aria-labelledby="deliverables-title">
      <SectionDots />
      <div className="shell band">
        {/* this band stays brand dark blue in both themes, so colors are static */}
        <Reveal>
          <header className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 border-b border-white/15 pb-3 text-white/70">
              <RegistrationMark className="h-3 w-3 shrink-0 text-coral" />
              <p className="mono-label">{t.kicker}</p>
            </div>
            <h2 id="deliverables-title" className="display-tight mt-8 max-w-3xl text-display-lg text-white">
              {t.title}
            </h2>
          </header>
        </Reveal>

        {/* cells stay opaque so the hairline grid never shows through as pale
            slabs mid-reveal; the content rises inside each clipped cell */}
        <SpotlightCells className="grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((item, i) => (
            <li key={item.ext} className="spot-cell group overflow-hidden bg-blueprint-deep">
              {/*
                A row on a phone, a tile from sm up.

                As tiles the six formats were a single column of 187px blocks
                with the extension at the top and its description at the
                bottom of an otherwise empty card — 1,125px to name six file
                types. Two columns is not the fix either: ".E57 · RCP · RCS"
                does not fit a 174px cell at this size. Laid out as a row the
                pair reads as one line of a delivery schedule, which is what
                it is, at a third of the height.
              */}
              <Reveal
                delay={i * 0.05}
                className="flex h-full flex-row items-baseline justify-between gap-4 px-5 py-4 sm:flex-col sm:items-start sm:justify-between sm:gap-8 sm:px-6 sm:py-7"
              >
                <p className="font-mono text-lg font-semibold tracking-tight text-sky transition-colors duration-500 group-hover:text-white sm:text-xl md:text-2xl">
                  {item.ext}
                </p>
                <p className="shrink-0 text-right text-sm text-white/80 sm:text-left">
                  {item.format}
                </p>
              </Reveal>
            </li>
          ))}
        </SpotlightCells>
      </div>
    </section>
  );
}
