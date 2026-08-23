"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { buildingEdges } from "./buildingPoints";
// `frame` is aliased: the name is already the requestAnimationFrame handle here
import {
  CAM_DIST,
  COS_P,
  FOCAL,
  LOOK_Y,
  MAX_COUNT,
  POINTS,
  SIN_P,
  frame as fitFrame,
} from "./heroFit";
import { useTheme } from "../ThemeSwitcher";

/*
  The hero point cloud, for phones.

  The desktop hero opens a WebGL context and renders 15,000 animated points
  (components/hero/PointCloudScene). That is the right answer at 1024px and the
  wrong one on a phone: three.js is ~150KB of parse before a single point is
  drawn, and a live GL context is the largest single battery cost a landing page
  can incur. So below the desktop line the site rendered no visual at all — the
  hero was type on a grid, 583px tall on a 844px screen, and the section below
  it edged into view before the headline had finished being read.

  This is the same building, drawn the cheap way: the SAME point set from
  buildingPoints.generatePoints — so the massing on a phone is provably the
  massing on a laptop — projected by hand and painted into a 2D canvas as
  1px rects. No 3D library, no GL context, ~9KB of logic.

  What it costs, and why that is affordable:

  - POINT COUNT scales with the bitmap, not with the device's ambition:
    ~2,600 on a phone against the desktop scene's 15,000. Fill rate, not point
    count, is the constraint on a mobile GPU, and these are single pixels.
  - THE PROJECTION IS FLAT MATHS. One rotation and one divide per point per
    frame over a Float32Array — no matrices, no allocation in the loop.
  - IT ONLY RUNS WHILE IT IS LOOKED AT. An IntersectionObserver parks the loop
    the moment the hero leaves the viewport, and `visibilitychange` parks it
    when the tab is backgrounded.
  - IT DOES NOT RUN AT ALL when the device says not to: reduced motion, Save
    Data, or a device reporting <= 4 CPU cores gets one static frame — which is
    the drawing, just not turning.

  The static SVG (HeroFallback) stays underneath as the no-JS floor and as the
  first paint, and this fades in over it, so there is no layout shift and no
  empty box while the points are being generated.
*/

/**
 * Canvas pixels per drawn point.
 *
 * Density has to track area, not the device. The band is ~99k px on a 390px
 * phone and ~540k on a 768px tablet, so a fixed count that reads as a scanned
 * building on the phone reads as scattered dust on the tablet. Calibrated from
 * the phone: 99k / 2,350 points.
 */
const PX_PER_POINT = 42;
/** Floor and ceiling on that: legible on a tiny band, affordable on a big one. */
const MIN_POINTS = 2200;
/**
 * Seconds for one full revolution.
 *
 * It always turned a full 360; at 44s that is 8 degrees a second, slow enough
 * that a glance reads it as a still image sitting at one odd angle rather than
 * as a survey in progress. 30s keeps the unhurried register and makes the
 * rotation legible without waiting for it.
 */
const TURN_SECONDS = 30;
/* Camera, frame and fit all come from ./heroFit — shared with the layout so
   the band and the projection cannot disagree about how tall the stage is. */

type Palette = { ink: [number, number, number]; accent: [number, number, number] };

function readPalette(el: HTMLElement): Palette {
  const styles = getComputedStyle(el);
  const parse = (name: string, fallback: [number, number, number]): [number, number, number] => {
    const raw = styles.getPropertyValue(name).trim();
    const parts = raw.split(",").map((n) => Number.parseInt(n, 10));
    return parts.length === 3 && parts.every(Number.isFinite)
      ? (parts as [number, number, number])
      : fallback;
  };
  return {
    ink: parse("--dots-ink", [143, 165, 184]),
    accent: parse("--dots-accent", [0, 174, 239]),
  };
}

/** True when the device or the user has asked us not to animate. */
function shouldHoldStill(reduced: boolean): boolean {
  if (reduced) return true;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return true;
  if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) {
    return true;
  }
  return false;
}

export default function MobilePointCloud({
  className = "",
  onPainted,
}: {
  className?: string;
  /** fired once the first frame is on the canvas, so the SVG under it can go */
  onPainted?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const theme = useTheme();
  const [painted, setPainted] = useState(false);
  // kept in a ref so the effect does not re-run when the parent re-renders
  const painting = useRef(onPainted);
  painting.current = onPainted;

  useEffect(() => {
    const wrap = host.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const still = shouldHoldStill(Boolean(reduced));
    const { ink, accent } = readPalette(wrap);

    /* The geometry, generated once in ./heroFit and shared with the fit that
       frames it — so the box the stage reserves is measured from exactly the
       points this loop draws, not from a proxy for them. */
    const { targets, intensities } = POINTS;
    /* The massing as a line list, drawn over the cloud.

       At 390px the cloud on its own is a texture: 2,600 specks spread over a
       13m facade average four pixels apart, and the eye reads dust rather than
       a building. The envelope and the partition heads are 16 line segments
       that cost nothing and do all the work of saying what the dust is of —
       the same job the resolved wireframe does in the desktop scene, and the
       same lines the static SVG fallback draws. */
    const edges = buildingEdges();
    const EDGE_COUNT = edges.length / 6;


    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let running = false;
    let visible = false;
    let angle = -0.72; // opening three-quarter view
    let last = 0;

    /* Depth-sorted painting without sorting: points are bucketed by their
       distance from the camera and each bucket is filled in one pass, back to
       front. Eight buckets is enough to read as depth and turns 2,600
       fillStyle assignments into eight. */
    const BUCKETS = 8;
    const bx = new Float32Array(MAX_COUNT);
    const by = new Float32Array(MAX_COUNT);
    const depths = new Float32Array(MAX_COUNT);
    const bucketOf = new Uint8Array(MAX_COUNT);
    const alive = new Uint8Array(MAX_COUNT);
    /** every Nth generated point is drawn; recomputed whenever the box changes */
    let stride = 1;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      // 2 is plenty for 1px specks and halves the fill cost against a 3x phone
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // density follows the box: a tablet band is five times a phone's
      const wanted = Math.min(
        MAX_COUNT,
        Math.max(MIN_POINTS, Math.round((width * height) / PX_PER_POINT)),
      );
      stride = Math.max(1, Math.round(MAX_COUNT / wanted));
      return true;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // scale and centre for the whole revolution, from the shared fit
      const { scale, cx, cy } = fitFrame(width, height);

      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const sinP = SIN_P;
      const cosP = COS_P;

      /** Model space to canvas space. Shared by the cloud and the wireframe so
          the two can never drift out of register. */
      const project = (x: number, y: number, z: number) => {
        const rx = x * cos - z * sin;
        const rz0 = x * sin + z * cos;
        const ty = y * cosP - rz0 * sinP;
        const rz = rz0 * cosP + y * sinP;
        const depth = CAM_DIST - rz;
        if (depth <= 0.6) return null;
        const p = (FOCAL / depth) * scale;
        return { x: cx + rx * p, y: cy - ty * p, depth };
      };

      let minDepth = Infinity;
      let maxDepth = -Infinity;

      for (let i = 0; i < MAX_COUNT; i += stride) {
        const x = targets[i * 3];
        const y = targets[i * 3 + 1] - LOOK_Y;
        const z = targets[i * 3 + 2];

        // turn about the building's own vertical axis...
        const rx = x * cos - z * sin;
        const rz0 = x * sin + z * cos;
        // ...then tip the scene forward, which is the camera looking down on it
        const ty = y * cosP - rz0 * sinP;
        const rz = rz0 * cosP + y * sinP;

        const depth = CAM_DIST - rz;
        if (depth <= 0.6) {
          alive[i] = 0;
          continue;
        }
        // one perspective divide, shared by both axes
        const p = (FOCAL / depth) * scale;
        const px = cx + rx * p;
        const py = cy - ty * p;

        if (px < -8 || px > width + 8 || py < -8 || py > height + 8) {
          alive[i] = 0;
          continue;
        }
        alive[i] = 1;
        bx[i] = px;
        by[i] = py;
        depths[i] = depth;
        if (depth < minDepth) minDepth = depth;
        if (depth > maxDepth) maxDepth = depth;
      }

      const span = maxDepth - minDepth || 1;
      for (let i = 0; i < MAX_COUNT; i += stride) {
        if (!alive[i]) continue;
        const t = (depths[i] - minDepth) / span; // 0 near .. 1 far
        bucketOf[i] = Math.min(BUCKETS - 1, (t * BUCKETS) | 0);
      }

      // far bucket first so near points paint over them
      for (let b = BUCKETS - 1; b >= 0; b--) {
        const t = b / (BUCKETS - 1); // 1 = farthest
        // near points are brighter, larger and lean cerulean; far points
        // recede toward the mist ink at low alpha — the whole depth cue
        const near = 1 - t;
        const r = Math.round(ink[0] + (accent[0] - ink[0]) * near);
        const g = Math.round(ink[1] + (accent[1] - ink[1]) * near);
        const bl = Math.round(ink[2] + (accent[2] - ink[2]) * near);
        const alpha = 0.16 + near * 0.5;
        ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, ${alpha})`;
        const size = near > 0.62 ? 1.7 : 1.1;

        for (let i = 0; i < MAX_COUNT; i += stride) {
          if (!alive[i] || bucketOf[i] !== b) continue;
          // intensity is the scan-return brightness baked into the geometry:
          // it is what makes the envelope read in front of the furniture
          if (intensities[i] < 0.34 && near < 0.5) continue;
          ctx.fillRect(bx[i], by[i], size, size);
        }
      }

      /* The massing, over the cloud. Dashed rather than solid — a survey
         drawing's construction line, and it keeps the edge from reading as a
         solid box sitting on top of a point cloud instead of through it. */
      ctx.save();
      ctx.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, 0.55)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([0.5, 5]);
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let e = 0; e < EDGE_COUNT; e++) {
        const o = e * 6;
        const a = project(edges[o], edges[o + 1] - LOOK_Y, edges[o + 2]);
        const bpt = project(edges[o + 3], edges[o + 4] - LOOK_Y, edges[o + 5]);
        if (!a || !bpt) continue;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(bpt.x, bpt.y);
      }
      ctx.stroke();
      ctx.restore();
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      angle += (dt * Math.PI * 2) / TURN_SECONDS;
      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || still || !visible || document.hidden) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    if (!resize()) return;
    draw();
    setPainted(true);
    painting.current?.();

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0.01 },
    );
    io.observe(wrap);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const ro = new ResizeObserver(() => {
      if (resize()) draw();
    });
    ro.observe(wrap);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, theme]);

  return (
    <div ref={host} aria-hidden="true" className={`absolute inset-0 ${className}`}>
      <canvas
        ref={canvasRef}
        className={`block h-full w-full transition-opacity duration-1000 ${
          painted ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
