"use client";

import { useEffect, useRef } from "react";

/*
  Survey-marker cursor: a coral core dot with a cerulean ring trailing it.
  Over anything clickable the ring gives way to a coral survey reticle while
  the core dot stays put, so the pointer's exact hit point never moves.

  Desktop pointers only, and never over text fields — the caret has to stay
  legible there, so the native I-beam comes back and the marker hides.
*/

const INTERACTIVE = 'a, button, [role="button"], summary, label, [data-cursor="target"]';
const TEXT_FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]), textarea';

export default function ScanCursor() {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const reticle = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    if (!fine.matches) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = root.current;
    const core = dot.current;
    const halo = ring.current;
    const cross = reticle.current;
    if (!el || !core || !halo || !cross) return;

    document.documentElement.classList.add("scan-cursor");

    // pointer target, and the two chasers running at different lags
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let dotX = mx;
    let dotY = my;
    let ringX = mx;
    let ringY = my;

    let press = 1; // ring scale multiplier, dips while the button is down
    let pressTarget = 1;
    let lock = 0; // 0 = idle ring, 1 = reticle
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

      lockTarget = target?.closest?.(INTERACTIVE) ? 1 : 0;

      if (reduced) {
        // no chase — snap everything to the pointer
        dotX = ringX = mx;
        dotY = ringY = my;
      }
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown = () => (pressTarget = 0.72);
    const onUp = () => (pressTarget = 1);

    const render = () => {
      lock += (lockTarget - lock) * (reduced ? 1 : 0.16);
      press += (pressTarget - press) * (reduced ? 1 : 0.2);

      dotX += (mx - dotX) * (reduced ? 1 : 0.42);
      dotY += (my - dotY) * (reduced ? 1 : 0.42);
      ringX += (mx - ringX) * (reduced ? 1 : 0.18);
      ringY += (my - ringY) * (reduced ? 1 : 0.18);

      core.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;

      // ring widens a touch as it hands off to the reticle, then fades out
      const ringScale = press * (1 + lock * 0.5);
      halo.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${ringScale})`;
      halo.style.opacity = String(1 - lock);

      // reticle rides the core, not the ring, so the hairlines stay centred on the hit point
      cross.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%) scale(${
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
      {/* cerulean ring — the loose outer marker, trailing the core */}
      <span
        ref={ring}
        className="absolute left-0 top-0 rounded-full border border-cerulean"
        style={{ width: 26, height: 26, boxShadow: "0 0 0 0.5px rgba(0,0,0,0.25)" }}
      />

      {/* coral core — the exact hit point, present in both states */}
      <span
        ref={dot}
        className="absolute left-0 top-0 rounded-full bg-coral"
        style={{ width: 6, height: 6, boxShadow: "0 0 0 0.5px rgba(0,0,0,0.3)" }}
      />

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
