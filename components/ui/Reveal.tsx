"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/*
  Framer Motion's single job below the hero: quiet, once-only section reveals.
  Degrades to opacity-only under prefers-reduced-motion.
*/
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
  immediate = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
  /** animate on mount (page-load sequence) instead of on scroll into view */
  immediate?: boolean;
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  const visible = reduced ? { opacity: 1 } : { opacity: 1, y: 0 };

  return (
    <Tag
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
      {...(immediate
        ? { animate: visible }
        : { whileInView: visible, viewport: { once: true, margin: "-12% 0px" } })}
      transition={{ duration: reduced ? 0.3 : 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
}
