"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap, SplitText, registerGsap, durL, lineStagger } from "@/lib/motion";

/*
  ERA-style masked line reveal: text is split into lines, each clipped by its
  own mask and slid up from yPercent 110. Splitting waits for fonts so line
  breaks are final. Reduced motion (or any failure) simply shows the text.
*/
export default function SplitReveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  /** animate on mount instead of when scrolled into view */
  immediate = false,
  id,
}: {
  children: ReactNode;
  as?: "div" | "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  immediate?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => gsap.set(el, { visibility: "visible" });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show();
      return;
    }

    registerGsap();

    let split: SplitText | null = null;
    let cancelled = false;

    const fontsReady: Promise<unknown> = document.fonts?.ready ?? Promise.resolve();

    fontsReady.then(() => {
      if (cancelled) return;
      try {
        split = new SplitText(el, {
          type: "lines",
          linesClass: "split-line",
          mask: "lines",
        });
        show();
        gsap.fromTo(
          split.lines,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: durL,
            delay,
            stagger: lineStagger,
            ease: "authored",
            ...(immediate
              ? {}
              : { scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
          },
        );
      } catch {
        show();
      }
    });

    return () => {
      cancelled = true;
      split?.revert();
    };
  }, [delay, immediate]);

  return (
    // hidden until GSAP takes over — mirrors how the rest of the page reveals
    <Tag
      ref={ref as never}
      id={id}
      className={className}
      style={{ visibility: "hidden" }}
    >
      {children}
    </Tag>
  );
}
