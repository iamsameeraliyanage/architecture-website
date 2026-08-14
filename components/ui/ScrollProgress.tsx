"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/*
  Page progress as a hairline at the very top — the quiet cousin of ERA's
  draggable scrollbar, in the site's technical register.
*/
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 32, mass: 0.4 });
  const reduced = useReducedMotion();

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-cerulean"
    />
  );
}
