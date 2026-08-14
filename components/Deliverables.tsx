import Reveal from "./ui/Reveal";
import RegistrationMark from "./ui/RegistrationMark";
import type { Content } from "@/lib/content";

export default function Deliverables({ t }: { t: Content["deliverables"] }) {
  return (
    <section className="bg-blueprint-deep" aria-labelledby="deliverables-title">
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

        <ul className="grid gap-px border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((item, i) => (
            <Reveal as="li" key={item.ext} delay={i * 0.05} className="bg-blueprint-deep">
              <div className="flex h-full flex-col justify-between gap-8 px-6 py-7">
                <p className="font-mono text-xl font-semibold tracking-tight text-sky md:text-2xl">
                  {item.ext}
                </p>
                <p className="text-sm text-white/80">{item.format}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
