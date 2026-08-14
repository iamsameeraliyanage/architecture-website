"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/motion";

/*
  Global smooth scrolling (ERA-style: Lenis driven by the GSAP ticker so
  ScrollTrigger scrubs stay in lockstep). Skipped entirely under
  prefers-reduced-motion — the CSS scroll-behavior fallback still applies.
*/
export default function LenisProvider() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    registerGsap();

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: -72 }, // keep anchor targets clear of the fixed nav
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Lenis takes over anchor scrolling; native smooth behavior would fight it
    document.documentElement.style.scrollBehavior = "auto";

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return null;
}
