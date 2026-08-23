"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "../ThemeSwitcher";

/*
  The constellation dot field, generalised from the hero to every band on the
  page. Derived from the 21st.dev "constellation grid", rebuilt around three
  constraints this site imposes:

  1. TWO REGISTERS, CHOSEN BY SURFACE — NOT BY THEME.
     The page alternates ground / paper / blueprint, and only ground flips
     with the theme: paper is light in both themes, blueprint is dark in
     both. So the colours are not props — they are read from --dots-* custom
     properties on the host, which globals.css sets per surface (:root,
     [data-theme="light"], .on-paper, .on-blueprint). Drop the layer into any
     band and it dresses itself correctly.

  2. IT MUST COST NOTHING WHEN NOT LOOKED AT.
     A canvas per band would mean a dozen live bitmaps and a dozen rAF loops.
     Instead each layer allocates its bitmap only while it is near the
     viewport, releases it on the way out, and parks its loop the moment the
     nodes have settled and the cursor has left its neighbourhood.

  3. IT MUST SIT UNDER THE CONTENT, OVER THE BAND.
     The host section carries `relative isolate`; this layer is z-index -1,
     so it paints above the section's own background and below every word.

  Tall bands (the pinned pipeline is 3+ viewports) would need a 3-viewport
  bitmap, so above a threshold the canvas sticks at viewport height and the
  grid is phase-shifted by the scroll offset — dots stay locked to the page,
  the bitmap stays one screen big.

  Desktop only. The field is cursor-driven texture: without a pointer there is
  nothing to reveal it, and on a phone or tablet it is pure cost — bitmaps,
  paint and battery for a few specks nobody can interact with. Below the same
  1024px line the hero uses for WebGL, nothing mounts at all.
*/

type Node = { x: number; y: number; vx: number; vy: number; baseX: number; baseY: number };

const SPACING = 46; // px between anchors
const REPEL_RADIUS = 150; // cursor influence
const MAX_PUSH = 260; // impulse scale — displacement peaks under ~8px
const SPRING_K = 14;
const DAMPING = 0.86;
const TALL_FACTOR = 2.2; // host taller than this many viewports -> sticky mode
// matches components/hero/HeroVisual.tsx — one desktop line for the whole site
const DESKTOP_QUERY = "(min-width: 1024px)";

/** Reads an "r, g, b" custom property, falling back when it is missing. */
function readRgb(styles: CSSStyleDeclaration, name: string, fallback: string): string {
  const raw = styles.getPropertyValue(name).trim();
  return /^\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}$/.test(raw) ? raw : fallback;
}

function readNum(styles: CSSStyleDeclaration, name: string, fallback: number): number {
  const n = Number.parseFloat(styles.getPropertyValue(name));
  return Number.isFinite(n) ? n : fallback;
}

export default function SectionDots({
  className = "",
  spacing = SPACING,
  /** z-index for the layer. -1 (default) paints under the content of an
      `isolate` host; pass 0 when the parent is already a background layer. */
  z = -1,
}: {
  className?: string;
  spacing?: number;
  z?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const reduced = useReducedMotion();
  // starts false so phones and tablets never render the canvas at all, and
  // the server markup matches the first client pass
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!desktop) return;
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ---- palette, read off the host so the surface picks the register ----
    const styles = getComputedStyle(host);
    const ink = readRgb(styles, "--dots-ink", "143, 165, 184");
    const accent = readRgb(styles, "--dots-accent", "0, 174, 239");
    const baseAlpha = readNum(styles, "--dots-base", 0.22);
    const peakAlpha = readNum(styles, "--dots-peak", 0.5);
    const linkAlpha = readNum(styles, "--dots-link", 0.12);
    const baseRadius = readNum(styles, "--dots-radius", 0.9);

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let nodes: Node[] = [];
    let rect = new DOMRect();
    let sticky = false;
    let phase = 0; // grid offset in sticky mode — keeps the dots page-anchored

    let frame = 0;
    let running = false;
    let queued = false;
    let last = 0;
    let visible = false;
    let built = false;

    const mouse = { x: -9999, y: -9999 };
    const interactive = !reduced && window.matchMedia("(pointer: fine)").matches;

    const measure = () => {
      rect = host.getBoundingClientRect();
    };

    const updatePhase = () => {
      if (!sticky) return;
      const p = rect.top % spacing;
      phase = p > 0 ? p - spacing : p;
    };

    const draw = () => {
      if (!built) return;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(0, phase);

      const my = mouse.y - phase;

      // threads first, so each dot sits on top of its own
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const n = nodes[i * rows + j];
          const near = 1 - Math.min(Math.hypot(mouse.x - n.x, my - n.y) / REPEL_RADIUS, 1);
          if (near <= 0) continue;

          ctx.strokeStyle = `rgba(${accent}, ${near * linkAlpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          if (i + 1 < cols) {
            const right = nodes[(i + 1) * rows + j];
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(right.x, right.y);
          }
          if (j + 1 < rows) {
            const below = nodes[i * rows + j + 1];
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(below.x, below.y);
          }
          ctx.stroke();
        }
      }

      for (let k = 0; k < nodes.length; k++) {
        const n = nodes[k];
        const near = 1 - Math.min(Math.hypot(mouse.x - n.x, my - n.y) / REPEL_RADIUS, 1);
        ctx.fillStyle =
          near > 0.05
            ? `rgba(${accent}, ${baseAlpha + near * peakAlpha})`
            : `rgba(${ink}, ${baseAlpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, baseRadius + near * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const build = () => {
      measure();
      if (rect.width === 0 || rect.height === 0) return;

      sticky = rect.height > window.innerHeight * TALL_FACTOR;
      width = Math.round(rect.width);
      height = Math.round(sticky ? window.innerHeight : rect.height);

      // 1.5 is the ceiling: these are 1px specks, and a 2x bitmap on a tall
      // band costs tens of MB for texture nobody is meant to stare at
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + (sticky ? 2 : 1);
      nodes = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          nodes.push({ x, y, vx: 0, vy: 0, baseX: x, baseY: y });
        }
      }
      built = true;
      updatePhase();
      draw();
    };

    const release = () => {
      if (!built) return;
      cancelAnimationFrame(frame);
      running = false;
      built = false;
      nodes = [];
      canvas.width = 0; // hand the bitmap back
      canvas.height = 0;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const my = mouse.y - phase;

      let moving = false;
      for (let k = 0; k < nodes.length; k++) {
        const n = nodes[k];
        const dx = mouse.x - n.x;
        const dy = my - n.y;
        const dist = Math.hypot(dx, dy);

        if (dist < REPEL_RADIUS && dist > 0.01) {
          const power = 1 - dist / REPEL_RADIUS;
          const force = power * power * MAX_PUSH;
          n.vx -= (dx / dist) * force * dt;
          n.vy -= (dy / dist) * force * dt;
        }

        n.vx += (n.baseX - n.x) * SPRING_K * dt;
        n.vy += (n.baseY - n.y) * SPRING_K * dt;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x += n.vx * dt * 60;
        n.y += n.vy * dt * 60;

        if (!moving && Math.abs(n.x - n.baseX) + Math.abs(n.y - n.baseY) > 0.05) moving = true;
      }

      draw();

      if (!moving && mouse.x < -1000) {
        running = false; // settled and the cursor is elsewhere — stop
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || !built) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    /** A single repaint on the next frame — used by scroll in sticky mode. */
    const requestDraw = () => {
      if (running || queued || !built) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (running) return;
        updatePhase();
        draw();
      });
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!built) return;
      const inside =
        e.clientX >= rect.left - REPEL_RADIUS &&
        e.clientX <= rect.right + REPEL_RADIUS &&
        e.clientY >= rect.top - REPEL_RADIUS &&
        e.clientY <= rect.bottom + REPEL_RADIUS;

      if (inside) {
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - (sticky ? 0 : rect.top);
        start();
      } else if (mouse.x > -1000) {
        mouse.x = -9999;
        mouse.y = -9999;
        start(); // let the nodes spring home; the loop parks itself after
      }
    };

    const onScroll = () => {
      measure();
      if (sticky) requestDraw();
    };

    // ---- allocate only while the band is near the viewport ----
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === visible) return;
        visible = entry.isIntersecting;
        if (visible) {
          build();
          if (interactive) window.addEventListener("pointermove", onPointerMove, { passive: true });
          window.addEventListener("scroll", onScroll, { passive: true });
        } else {
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("scroll", onScroll);
          release();
        }
      },
      { rootMargin: "25%" },
    );
    io.observe(host);

    const ro = new ResizeObserver(() => {
      if (visible) build();
    });
    ro.observe(host);

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      release();
    };
  }, [desktop, theme, reduced, spacing]);

  if (!desktop) return null;

  // note: no overflow-clip anywhere on this wrapper — an overflow-hidden
  // ancestor would become the sticky canvas's scroll container and the
  // tall-band mode would silently stop tracking the scroll
  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{ zIndex: z }}
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      {/* sticky only bites on bands taller than TALL_FACTOR viewports; on a
          normal band the canvas fills the host and never has room to stick */}
      <canvas ref={canvasRef} className="sticky left-0 top-0 block" />
    </div>
  );
}
