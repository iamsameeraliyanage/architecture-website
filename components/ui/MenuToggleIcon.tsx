"use client";

/*
  Burger that morphs into a close mark rather than swapping icons: the outer
  rules rotate into the cross while the middle one collapses. Pure CSS
  transitions, so it costs nothing per frame and honours reduced motion.
*/
export default function MenuToggleIcon({ open }: { open: boolean }) {
  const bar = "origin-center transition-transform duration-300 ease-authored motion-reduce:transition-none";
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <line
        x1="2.5" y1="7" x2="21.5" y2="7"
        stroke="currentColor" strokeWidth="1.5"
        className={bar}
        style={{ transform: open ? "translateY(5px) rotate(45deg)" : undefined }}
      />
      <line
        x1="2.5" y1="12" x2="21.5" y2="12"
        stroke="currentColor" strokeWidth="1.5"
        className="origin-center transition-opacity duration-200 ease-authored motion-reduce:transition-none"
        style={{ opacity: open ? 0 : 1 }}
      />
      <line
        x1="2.5" y1="17" x2="21.5" y2="17"
        stroke="currentColor" strokeWidth="1.5"
        className={bar}
        style={{ transform: open ? "translateY(-5px) rotate(-45deg)" : undefined }}
      />
    </svg>
  );
}
