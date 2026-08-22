"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { invalidate } from "@react-three/fiber";
import SectionHeader from "./ui/SectionHeader";
import { useTheme } from "./ThemeSwitcher";
import type { Content } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

const ApartmentOrbitScene = dynamic(() => import("./hero/ApartmentOrbitScene"), { ssr: false });

/** Scroll distance per stage transition, as a % of viewport height. */
const STEP_VH = 48;
/** Angle held when motion is reduced — a legible three-quarter view. */
const STATIC_PROGRESS = 0.07;

/** What the model is showing at each stage, in ST-01…ST-05 order. */
const ORBIT_STATES = [
  "AS-BUILT",
  "POINT CLOUD",
  "DIMENSIONED MODEL",
  "CHECKED / ±20 MM",
  "IFC · RVT · DWG",
] as const;

/**
 * The scene holds each stage through most of its segment then morphs, crossing
 * the halfway point at 0.7 of the segment. The label flips there too, so the
 * caption and the drawing always agree.
 */
function orbitLabel(progress: number): string {
  const q = Math.min(ORBIT_STATES.length - 1.001, Math.max(0, progress) * (ORBIT_STATES.length - 1));
  const seg = Math.floor(q);
  return ORBIT_STATES[q - seg > 0.7 ? seg + 1 : seg];
}

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/*
  The five-stage pipeline. Server-rendered as a stacked, fully readable list;
  on desktop without reduced-motion, GSAP pins the section and scroll drives
  the sequence stage by stage (data-pin-enhanced flips the CSS to panels).

  The same scroll drives one full orbit of the apartment on the right: the
  model turns from furnished architecture through BIM to structure and back,
  so the drawing beside each stage is the deliverable that stage produces.
*/
export default function Pipeline({ t }: { t: Content["pipeline"] }) {
  const section = useRef<HTMLElement>(null);
  const pinArea = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const progress = useRef(STATIC_PROGRESS);
  const theme = useTheme();
  const [desktop, setDesktop] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [orbitState, setOrbitState] = useState<string>(orbitLabel(STATIC_PROGRESS));

  // the orbit column only exists from lg up — don't load three.js or open a
  // WebGL context inside the display:none container on smaller screens
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (desktop) setWebgl(webglAvailable());
  }, [desktop]);

  // the scene renders on demand; a theme flip needs an explicit repaint
  useEffect(() => {
    invalidate();
  }, [theme]);

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
            end: `+=${steps * STEP_VH}%`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate(self) {
              setActiveMarker(Math.round(self.progress * steps));
              // one full turn of the model across the pinned scroll
              progress.current = self.progress;
              setOrbitState(orbitLabel(self.progress));
              invalidate();
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
          progress.current = STATIC_PROGRESS;
          invalidate();
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

          <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
            {/* stage panels — stacked list by default, crossfading panels when pinned */}
            <div className="stage-stack relative lg:col-span-6">
              {t.stages.map((stage, i) => (
                <article
                  key={stage.code}
                  className="stage-panel border-t rule-dark py-12 lg:border-t-0 lg:py-0"
                  data-first={i === 0 ? "true" : undefined}
                >
                  <span className="mono-label block text-cerulean">{stage.code}</span>
                  <h3 className="display-tight mt-4 text-display-md text-frost">{stage.name}</h3>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-mist md:text-lg">
                    {stage.body}
                  </p>
                  <ul className="mt-7 flex flex-wrap gap-2">
                    {stage.specs.map((spec) => (
                      <li key={spec} className="mono-label border rule-dark px-3 py-1.5 text-mist">
                        {spec}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            {/* the apartment, orbited by the same scroll that advances the stages */}
            <div
              aria-hidden="true"
              className="hidden lg:col-span-5 lg:col-start-8 lg:block"
            >
              <div className="relative aspect-[4/3]">
                {desktop && webgl && (
                  <div
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      ready ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <ApartmentOrbitScene
                      progressRef={progress}
                      theme={theme}
                      onReady={() => setReady(true)}
                    />
                  </div>
                )}
                <p
                  className={`mono-label absolute bottom-0 right-0 border-r-2 border-cerulean pr-3 text-cerulean transition-opacity duration-700 ${
                    ready ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {orbitState}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
