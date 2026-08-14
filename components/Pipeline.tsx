"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionHeader from "./ui/SectionHeader";
import StageGlyph from "./pipeline/StageGlyph";
import type { Content } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

/*
  The five-stage pipeline. Server-rendered as a stacked, fully readable list;
  on desktop without reduced-motion, GSAP pins the section and scroll drives
  the sequence stage by stage (data-pin-enhanced flips the CSS to panels).
*/
export default function Pipeline({ t }: { t: Content["pipeline"] }) {
  const section = useRef<HTMLElement>(null);
  const pinArea = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.matchMedia();

    ctx.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const root = section.current;
        const pin = pinArea.current;
        if (!root || !pin) return;

        root.dataset.pinEnhanced = "true";
        const panels = Array.from(pin.querySelectorAll<HTMLElement>(".stage-panel"));
        const markers = Array.from(pin.querySelectorAll<HTMLElement>(".rail-marker"));
        const steps = panels.length - 1;

        const setActiveMarker = (index: number) => {
          markers.forEach((marker, i) => {
            marker.dataset.active = i <= index ? "true" : "false";
          });
        };
        setActiveMarker(0);

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: `+=${steps * 90}%`,
            pin: true,
            scrub: 0.6,
            onUpdate(self) {
              setActiveMarker(Math.round(self.progress * steps));
            },
          },
        });

        panels.forEach((panel, i) => {
          if (i === 0) return;
          tl.to(panels[i - 1], { autoAlpha: 0, y: -30, duration: 0.42 }, (i - 1) * 1);
          tl.fromTo(
            panel,
            { autoAlpha: 0, y: 34 },
            { autoAlpha: 1, y: 0, duration: 0.5 },
            (i - 1) * 1 + 0.35,
          );
          if (fill.current) {
            tl.to(fill.current, { scaleX: i / steps, duration: 0.5 }, (i - 1) * 1 + 0.2);
          }
        });
        // pad the timeline so the last stage holds for a beat before unpinning
        tl.to({}, { duration: 0.5 });

        return () => {
          delete root.dataset.pinEnhanced;
        };
      },
    );

    return () => ctx.revert();
  }, [t.stages.length]);

  return (
    <section id="process" ref={section} className="scroll-mt-20 bg-ground" aria-labelledby="pipeline-title">
      <div className="mx-auto max-w-7xl px-5 pt-20 md:px-8 md:pt-28">
        <SectionHeader id="pipeline-title" kicker={t.kicker} title={t.title} intro={t.intro} tone="dark" />
      </div>

      <div ref={pinArea} className="pipeline-pin">
        <div className="mx-auto max-w-7xl px-5 pb-20 md:px-8 lg:pb-10">
          {/* progress rail — visible only in the pinned experience */}
          <div className="pipeline-rail mb-12 hidden">
            <div className="relative w-full">
              <div className="absolute inset-x-0 top-[5px] h-px bg-line-dark" />
              <div
                ref={fill}
                className="absolute inset-x-0 top-[5px] h-px origin-left scale-x-0 bg-cerulean"
              />
              <ol className="relative grid grid-cols-5">
                {t.stages.map((stage) => (
                  <li key={stage.code} className="rail-marker group" data-active="false">
                    <span className="block h-[11px] w-[11px] border border-line-dark bg-ground transition-colors duration-300 group-data-[active=true]:border-cerulean group-data-[active=true]:bg-cerulean/20" />
                    <span className="mono-label mt-3 block text-steel transition-colors duration-300 group-data-[active=true]:text-cerulean">
                      {stage.code}
                    </span>
                    <span className="mt-1 block text-xs text-steel transition-colors duration-300 group-data-[active=true]:text-frost">
                      {stage.name}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* stage panels — stacked list by default, crossfading panels when pinned */}
          <div className="stage-stack relative">
            {t.stages.map((stage, i) => (
              <article
                key={stage.code}
                className="stage-panel border-t rule-dark py-12 lg:border-t-0 lg:py-0"
                data-first={i === 0 ? "true" : undefined}
              >
                <div className="grid gap-10 lg:h-full lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-6">
                    <div className="flex items-baseline gap-4">
                      <span className="mono-label text-cerulean">{stage.code}</span>
                      <span
                        aria-hidden="true"
                        className="display-tight text-6xl text-frost/10 md:text-7xl"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="display-tight mt-4 text-display-md text-frost">{stage.name}</h3>
                    <p className="mt-5 max-w-lg text-base leading-relaxed text-mist md:text-lg">
                      {stage.body}
                    </p>
                    <ul className="mt-7 flex flex-wrap gap-2">
                      {stage.specs.map((spec) => (
                        <li
                          key={spec}
                          className="mono-label border rule-dark px-3 py-1.5 text-mist"
                        >
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="hidden lg:col-span-5 lg:col-start-8 lg:block">
                    <div className="aspect-[4/3]">
                      <StageGlyph index={i} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
