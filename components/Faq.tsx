"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import SectionDots from "./ui/SectionDots";

/*
  Accordion FAQ. Structurally typed rather than bound to `Content["faq"]`, so
  the per-service FAQs in lib/services.ts render through the same component —
  which matters because each one is also emitted as FAQPage structured data and
  the two must stay in step.
*/
export type FaqContent = {
  kicker: string;
  title: string;
  items: ReadonlyArray<{ q: string; a: string }>;
};

export default function Faq({
  t,
  dim = false,
  id = "faq-title",
}: {
  t: FaqContent;
  /** step down to the dim paper surface when the section above is also light */
  dim?: boolean;
  id?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <section
      className={`relative isolate on-paper ${dim ? "bg-paper-dim" : "bg-paper"}`}
      aria-labelledby={id}
    >
      <SectionDots />
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeader id={id} kicker={t.kicker} title={t.title} tone="light" />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mx-auto max-w-3xl border-t rule-light">
            {t.items.map((item, i) => {
              const open = openIndex === i;
              return (
                <div key={item.q} className="border-b rule-light">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(open ? null : i)}
                      aria-expanded={open}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      className="flex w-full items-baseline gap-5 py-5 text-left"
                    >
                      <span className="mono-label shrink-0 text-coral">
                        Q{String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 text-base font-medium text-ink md:text-lg">{item.q}</span>
                      <span
                        aria-hidden="true"
                        className={`font-mono text-lg text-ink-soft transition-transform duration-300 ${
                          open ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-button-${i}`}
                        initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                        exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pl-[3.4rem] pr-10 text-[0.95rem] leading-relaxed text-ink-soft">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
