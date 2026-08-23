"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/motion";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import RegistrationMark from "./ui/RegistrationMark";
import SectionDots from "./ui/SectionDots";

/*
  The step sequence on the service pages — a survey traverse rather than a
  numbered list. A hairline runs through the stations and is drawn by scroll
  as the section crosses the viewport; each station's tick lands as the line
  reaches it.

  Progressive enhancement matters here: the section is server-rendered with the
  line already at full length, so with JavaScript off (or reduced motion on)
  it reads as a finished diagram rather than an empty rule. GSAP only ever
  takes a complete thing and animates it into place.
*/
export default function ProcessChain({
  kicker,
  title,
  intro,
  steps,
  id = "chain-title",
}: {
  kicker: string;
  title: string;
  intro?: string;
  steps: Array<{ code: string; name: string; body: string }>;
  id?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    /* only from lg up: below that the traverse line is hidden and the steps
       stack, so scrubbing the tick opacities would leave them half-faded */
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      registerGsap();
      const line = el.querySelector<HTMLElement>("[data-chain-line]");
      const ticks = gsap.utils.toArray<HTMLElement>("[data-chain-tick]", el);
      if (!line) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          end: "bottom 72%",
          scrub: 0.6,
        },
      });

      tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);

      // each tick resolves just after the line front passes it
      ticks.forEach((tick, i) => {
        const at = steps.length > 1 ? i / steps.length : 0;
        tl.fromTo(
          tick,
          { scale: 0.35, opacity: 0.25 },
          { scale: 1, opacity: 1, duration: 0.12, ease: "authored" },
          at,
        );
      });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });

    return () => mm.revert();
  }, [steps.length]);

  return (
    <section className="relative isolate bg-ground" aria-labelledby={id}>
      <SectionDots />
      <div className="shell band">
        <Reveal>
          <SectionHeader id={id} kicker={kicker} title={title} intro={intro} tone="dark" />
        </Reveal>

        <div ref={root} className="relative">
          {/* the traverse line: horizontal across the stations from lg up,
              hidden below that where the steps stack vertically */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[7px] hidden lg:block">
            <div className="h-px w-full bg-line-dark" />
            <div
              data-chain-line
              className="h-px w-full origin-left bg-cerulean/70"
              style={{ marginTop: "-1px" }}
            />
          </div>

          {/* literal class strings — Tailwind cannot see an interpolated one */}
          <ol
            className={`grid gap-10 lg:gap-6 ${
              steps.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"
            }`}
          >
            {steps.map((step, i) => (
              <Reveal as="li" key={step.code} delay={i * 0.08}>
                {/*
                  Below lg the traverse turns through 90 degrees.

                  The horizontal rule that joins the stations is `hidden
                  lg:block` — five columns cannot survive a phone — so stacked,
                  the steps lost the one thing that made them a sequence and
                  became a list of unrelated headings under hairlines. The
                  connector below is the same line running down the left
                  instead of across the top, matching the pipeline on the home
                  page. From lg it is hidden again and the scrubbed horizontal
                  line takes over.
                */}
                <div className="group relative flex h-full flex-col pl-9 lg:pl-0">
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-[-2.5rem] left-[7px] top-4 w-px bg-line-dark lg:hidden"
                    />
                  )}
                  <div className="flex items-center gap-3 lg:border-t-0 lg:pt-0">
                    <span
                      data-chain-tick
                      className="absolute left-0 top-0 flex h-[15px] w-[15px] shrink-0 items-center justify-center bg-ground lg:relative lg:-mt-px"
                    >
                      <RegistrationMark className="h-[15px] w-[15px] text-coral" />
                    </span>
                    {/* the label masks the traverse line behind it, so the
                        rule reads as an annotated survey line rather than
                        striking through its own station name */}
                    <span className="mono-label bg-ground pr-3 text-steel">{step.code}</span>
                  </div>
                  <h3 className="display-tight mt-4 text-xl text-frost md:text-2xl lg:mt-5">
                    {step.name}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-mist">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
