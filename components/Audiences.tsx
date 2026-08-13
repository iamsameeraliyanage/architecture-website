import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import type { Content } from "@/lib/content";

export default function Audiences({ t }: { t: Content["audiences"] }) {
  return (
    <section className="bg-ground" aria-labelledby="audiences-title">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeader id="audiences-title" kicker={t.kicker} title={t.title} tone="dark" />
        </Reveal>
        <ul className="grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {t.blocks.map((block, i) => (
            <Reveal as="li" key={block.who} delay={i * 0.07}>
              <div className="flex h-full flex-col border-t rule-dark pt-5">
                <p className="mono-label text-cerulean">A-{String(i + 1).padStart(2, "0")}</p>
                <h3 className="display-tight mt-3 text-xl text-frost md:text-2xl">{block.who}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-mist">{block.need}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
