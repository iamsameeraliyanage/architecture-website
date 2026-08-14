"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap, registerGsap } from "@/lib/motion";

/*
  ERA-style scrubbed parallax: drifts the wrapped layer between two yPercent
  values as its parent crosses the viewport. Overscan the layer (e.g. absolute
  -inset-y-[12%]) so edges never show. No-op under reduced motion.
*/
export default function Parallax({
  children,
  className = "",
  from = -8,
  to = 8,
}: {
  children?: ReactNode;
  className?: string;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      registerGsap();
      const tween = gsap.fromTo(
        el,
        { yPercent: from },
        {
          yPercent: to,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        },
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [from, to]);

  return (
    <div ref={ref} className={className} aria-hidden={children ? undefined : true}>
      {children}
    </div>
  );
}
