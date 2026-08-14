"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/motion";

/*
  ERA-style nav rollover: two stacked copies of the label; on hover the chars
  roll up and out while the duplicate rolls in from below, staggered left to
  right. Falls back to the parent's plain color transition when hover/motion
  aren't available. Visual layers are aria-hidden; a sr-only span carries the
  accessible name.
*/
export default function RollText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches)
      return;

    registerGsap();

    const top = Array.from(el.querySelectorAll<HTMLElement>("[data-roll-top] [data-char]"));
    const bottom = Array.from(el.querySelectorAll<HTMLElement>("[data-roll-bottom] [data-char]"));
    if (!top.length) return;

    gsap.set(bottom, { yPercent: 100 });

    const conf = { duration: 0.5, ease: "authored", stagger: 0.022, overwrite: true } as const;
    const onEnter = () => {
      gsap.to(top, { yPercent: -100, ...conf });
      gsap.to(bottom, { yPercent: 0, ...conf });
    };
    const onLeave = () => {
      gsap.to(top, { yPercent: 0, ...conf });
      gsap.to(bottom, { yPercent: 100, ...conf });
    };

    // hover on the whole link, not just the text
    const trigger = el.closest("a") ?? el;
    trigger.addEventListener("mouseenter", onEnter);
    trigger.addEventListener("mouseleave", onLeave);
    return () => {
      trigger.removeEventListener("mouseenter", onEnter);
      trigger.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf([...top, ...bottom]);
    };
  }, [text]);

  const chars = () =>
    text.split("").map((ch, i) => (
      <span key={i} data-char="" className="inline-block will-change-transform">
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));

  return (
    <span ref={ref} className={`relative inline-block overflow-hidden align-bottom ${className}`}>
      <span className="sr-only">{text}</span>
      <span data-roll-top aria-hidden="true" className="block whitespace-nowrap">
        {chars()}
      </span>
      <span data-roll-bottom aria-hidden="true" className="absolute inset-0 block whitespace-nowrap">
        {chars()}
      </span>
    </span>
  );
}
