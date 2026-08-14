"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, registerGsap } from "@/lib/motion";

/*
  ERA-style magnetic hover: the wrapped element leans toward the cursor
  (em-based so it scales with type) and snaps back elastically on leave.
  Desktop pointer devices only; no-op under reduced motion.
*/
export default function Magnetic({
  children,
  strength = 24,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !window.matchMedia(
        "(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)",
      ).matches
    )
      return;

    registerGsap();

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * (strength / 16);
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * (strength / 16);
      gsap.to(el, { x: `${x}em`, y: `${y}em`, force3D: true, ease: "power4.out", duration: 1.6 });
    };
    const onLeave = () => {
      gsap.killTweensOf(el);
      gsap.to(el, { x: 0, y: 0, ease: "elastic.out(1, 0.3)", duration: 1.6 });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength]);

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}
