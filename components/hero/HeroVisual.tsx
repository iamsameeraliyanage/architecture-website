"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import HeroFallback from "./HeroFallback";
import { useTheme } from "../ThemeSwitcher";
import SectionDots from "../ui/SectionDots";

const PointCloudScene = dynamic(() => import("./PointCloudScene"), { ssr: false });

// the scan stage only has room to read from lg up; below that the hero is
// type on the grid, and no WebGL is downloaded or rendered at all
const DESKTOP_QUERY = "(min-width: 1024px)";

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function HeroVisual() {
  const wrapper = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const theme = useTheme();
  const [desktop, setDesktop] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (desktop) setWebgl(webglAvailable());
  }, [desktop]);

  // pause the render loop when the hero is scrolled out of view
  useEffect(() => {
    const node = wrapper.current;
    if (!node || !desktop) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [desktop]);

  // pointer depth: the grid and the scan stage lean toward the cursor at
  // different rates, layering with the point cloud's own internal tilt.
  // Distances are single-digit px — depth, not a game. Desktop pointers only.
  useEffect(() => {
    if (!desktop || !active || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const gridEl = grid.current;
    const stageEl = stage.current;
    if (!gridEl || !stageEl) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    let idle = true;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      if (idle) {
        idle = false;
        frame = requestAnimationFrame(render);
      }
    };

    const render = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      gridEl.style.transform = `translate3d(${x * 8}px, ${y * 6}px, 0)`;
      stageEl.style.transform = `translate3d(${x * 16}px, ${y * 12}px, 0)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) < 0.001) {
        idle = true; // settled — stop burning frames until the pointer moves
        return;
      }
      frame = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      gridEl.style.transform = "";
      stageEl.style.transform = "";
    };
  }, [desktop, active, reduced]);

  return (
    <div ref={wrapper} className="absolute inset-0" aria-hidden="true">
      {/* full-bleed coordinate grid — overscanned so pointer drift never shows an edge */}
      <div
        ref={grid}
        className="absolute -inset-3 opacity-40 will-change-transform"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line-dark) 1px, transparent 1px), linear-gradient(90deg, var(--color-line-dark) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* faint constellation dots over the grid — texture only: the field sits
          at low alpha and only lifts toward cerulean inside a small cursor
          radius, so the point cloud stays the hero's subject. z=0 rather than
          the default -1: this wrapper is already the hero's background layer,
          and the scan stage below is a later sibling, so it still covers. */}
      <SectionDots z={0} />

      {/* Below lg the scan stage is a band of the hero's own layout rather
          than part of this background wash — see components/hero/MobileHeroStage,
          rendered in the flow by components/Hero. */}

      {/* the scan stage, aligned to the content container */}
      <div className="absolute inset-0 hidden lg:block">
        <div className="relative shell h-full">
          <div
            ref={stage}
            className="absolute bottom-0 left-5 right-5 top-0 will-change-transform md:left-8 md:right-8 lg:left-auto lg:w-[58%]"
          >
            <HeroFallback dimmed={ready} />
            {desktop && webgl && (
              <div
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  ready ? "opacity-100" : "opacity-0"
                }`}
              >
                <PointCloudScene
                  count={15000}
                  animated={!reduced}
                  active={active}
                  theme={theme}
                  onReady={() => setReady(true)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/*
        Legibility gradient, desktop only.

        It darkens the left of the frame so the copy column reads over the
        cloud, which on a wide screen sits beside it. Below lg the copy is no
        longer over the drawing at all — the stage has its own band above it —
        so there is nothing to protect, and the same wipe would only be a
        veil over the top half of the apartment.
      */}
      <div className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-ground via-ground/55 to-transparent lg:block" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-ground to-transparent" />
    </div>
  );
}
