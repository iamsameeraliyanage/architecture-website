import Reveal from "./ui/Reveal";
import RegistrationMark from "./ui/RegistrationMark";
import SpotlightCells from "./ui/SpotlightCells";
import SectionDots from "./ui/SectionDots";
import type { Content } from "@/lib/content";

export default function Deliverables({ t }: { t: Content["deliverables"] }) {
  return (
    <section className="relative isolate on-blueprint bg-blueprint-deep" aria-labelledby="deliverables-title">
      <SectionDots />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
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
