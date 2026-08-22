"use client";

import { useEffect, useRef } from "react";

/*
  Scan-marker cursor: a loose scatter of point-cloud samples that swarms after
  the pointer, tightening into a coral survey reticle over anything clickable.

  Desktop pointers only, and never over text fields — the caret has to stay
  legible there, so the native I-beam comes back and the marker hides.
*/

// Fixed offsets, not random: the cluster must look identical every mount.
const SAMPLES = [
  { x: -14, y: -9, s: 3, o: 0.95, lag: 0.2 },
  { x: 9, y: -15, s: 2, o: 0.55, lag: 0.13 },
  { x: 16, y: 4, s: 3, o: 0.8, lag: 0.16 },
  { x: -6, y: 14, s: 2, o: 0.5, lag: 0.11 },
  { x: 12, y: 13, s: 2, o: 0.7, lag: 0.18 },
  { x: -17, y: 3, s: 2, o: 0.45, lag: 0.1 },
  { x: 2, y: -20, s: 2, o: 0.4, lag: 0.09 },
  { x: -10, y: -18, s: 2, o: 0.6, lag: 0.15 },
  { x: 20, y: -6, s: 2, o: 0.35, lag: 0.08 },
  { x: 5, y: 8, s: 3, o: 1, lag: 0.24 },
  { x: -3, y: -5, s: 2, o: 0.85, lag: 0.26 },
  { x: -20, y: 12, s: 2, o: 0.3, lag: 0.07 },
  { x: 18, y: 17, s: 2, o: 0.3, lag: 0.09 },
  { x: -12, y: 20, s: 2, o: 0.35, lag: 0.12 },
];

const INTERACTIVE = 'a, button, [role="button"], summary, label, [data-cursor="target"]';
const TEXT_FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]), textarea';

export default function ScanCursor() {
  const root = useRef<HTMLDivElement>(null);
  const reticle = useRef<HTMLDivElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    if (!fine.matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = root.current;
    const cross = reticle.current;
    if (!el || !cross) return;

    document.documentElement.classList.add("scan-cursor");

    // pointer target, and the per-dot positions chasing it
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    const pos = SAMPLES.map(() => ({ x: mx, y: my }));
    let crossX = mx;
    let crossY = my;

    let spread = 1; // 1 = scattered, →0.35 when locked onto a target
    let spreadTarget = 1;
    let lock = 0; // 0 = idle cluster, 1 = reticle
    let lockTarget = 0;
    let visible = false;
    let frame = 0;

    const setVisible = (next: boolean) => {
      if (next === visible) return;
      visible = next;
      el.style.opacity = next ? "1" : "0";
    };

    const onMove = (event: PointerEvent) => {
      mx = event.clientX;
      my = event.clientY;

      const target = event.target as Element | null;
      // text fields keep the native caret; the marker steps aside entirely
      const overText = Boolean(target?.closest?.(TEXT_FIELD));
      document.documentElement.classList.toggle("scan-cursor-off", overText);
      setVisible(!overText);

      const hot = Boolean(target?.closest?.(INTERACTIVE));
      lockTarget = hot ? 1 : 0;
      spreadTarget = hot ? 0.35 : 1;

      if (reduced) {
        // no chase, no swarm — snap everything to the pointer
        crossX = mx;
        crossY = my;
        pos.forEach((p) => {
          p.x = mx;
          p.y = my;
        });
      }
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown = () => (spreadTarget = 0.2);
    const onUp = () => (spreadTarget = lockTarget ? 0.35 : 1);

    const render = () => {
      spread += (spreadTarget - spread) * (reduced ? 1 : 0.12);
      lock += (lockTarget - lock) * (reduced ? 1 : 0.16);

      // slow breathing so an idle cluster still reads as live scan data
      const t = reduced ? 0 : performance.now() / 1000;

      pos.forEach((p, i) => {
        const s = SAMPLES[i];
        const drift = reduced ? 0 : Math.sin(t * 1.1 + i * 1.7) * 2.2;
        const targetX = mx + (s.x + drift) * spread;
        const targetY = my + (s.y - drift) * spread;
        const lag = reduced ? 1 : s.lag;
        p.x += (targetX - p.x) * lag;
        p.y += (targetY - p.y) * lag;

        const dot = dots.current[i];
        if (dot) dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
      });

      const crossLag = reduced ? 1 : 0.3;
      crossX += (mx - crossX) * crossLag;
      crossY += (my - crossY) * crossLag;
      cross.style.transform = `translate3d(${crossX}px, ${crossY}px, 0) translate(-50%, -50%) scale(${
        0.7 + lock * 0.3
      }) rotate(${(1 - lock) * 45}deg)`;
      cross.style.opacity = String(lock);

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.documentElement.classList.remove("scan-cursor", "scan-cursor-off");
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] opacity-0 transition-opacity duration-200 max-[1023px]:hidden"
    >
      {SAMPLES.map((s, i) => (
        <span
          key={i}
          ref={(node) => {
            dots.current[i] = node;
          }}
          className="absolute left-0 top-0 bg-cerulean"
          style={{ width: s.s, height: s.s, opacity: s.o }}
        />
      ))}

      {/* survey reticle — coral hairlines with an open centre, like a registration mark */}
      <div
        ref={reticle}
        className="absolute left-0 top-0 opacity-0"
        style={{ filter: "drop-shadow(0 0 1.5px rgba(0,0,0,0.55))" }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" className="block">
          <g stroke="var(--color-coral)" strokeWidth="1.4" shapeRendering="crispEdges">
            <line x1="20" y1="0.5" x2="20" y2="13" />
            <line x1="20" y1="27" x2="20" y2="39.5" />
            <line x1="0.5" y1="20" x2="13" y2="20" />
            <line x1="27" y1="20" x2="39.5" y2="20" />
            <rect x="14.5" y="14.5" width="11" height="11" fill="none" opacity="0.55" />
          </g>
        </svg>
      </div>
    </div>
  );
}
