"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import HeroFallback from "./HeroFallback";
import { useTheme } from "../ThemeSwitcher";

const PointCloudScene = dynamic(() => import("./PointCloudScene"), { ssr: false });

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
  const reduced = useReducedMotion();
  const theme = useTheme();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [particles, setParticles] = useState(15000);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    setWebgl(webglAvailable());
    setParticles(window.innerWidth < 768 ? 6500 : 15000);
  }, []);

  // pause the render loop when the hero is scrolled out of view
  useEffect(() => {
    const node = wrapper.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0" aria-hidden="true">
      {/* full-bleed coordinate grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line-dark) 1px, transparent 1px), linear-gradient(90deg, var(--color-line-dark) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* the scan stage, aligned to the content container */}
      <div className="absolute inset-0">
        <div className="relative mx-auto h-full max-w-7xl px-5 md:px-8">
          <div className="absolute bottom-0 left-5 right-5 top-0 md:left-8 md:right-8 lg:left-auto lg:w-[58%]">
            <HeroFallback dimmed={ready} />
            {webgl && (
              <div
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  ready ? "opacity-100" : "opacity-0"
                }`}
              >
                <PointCloudScene
                  count={particles}
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

      {/* legibility gradients above everything */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-ground via-ground/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-ground to-transparent" />
    </div>
  );
}
