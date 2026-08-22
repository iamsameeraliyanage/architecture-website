"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/*
  Page progress as a hairline at the very top — the quiet cousin of ERA's
  draggable scrollbar, in the site's technical register.

  Reduced motion hides the bar in CSS rather than returning null: useReducedMotion
  reads false during SSR and true on the client, so branching the tree here left
  the server and client markup out of step and broke hydration.
*/
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 32, mass: 0.4 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-cerulean motion-reduce:hidden"
    />
  );
}
