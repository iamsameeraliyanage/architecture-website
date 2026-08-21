/*
  Extra readings of the apartment, one per pipeline stage.

  The plan geometry in apartmentModel.ts is the single source of truth; each
  function here re-reads it a different way — as scan returns, as a dimensioned
  drawing, as a checked drawing, or as the parcel it ships in — so every stage
  is provably the same building rather than five unrelated drawings.
*/

import {
  PLAN,
  exteriorWalls,
  interiorWalls,
  furniture,
  floorSlab,
  boxEdges,
  type Box,
} from "./apartmentModel";

const { W, D, H } = PLAN;
const hw = W / 2;
const hd = D / 2;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ ST-02 */

/**
 * Scan returns across the model's own surfaces — the same sampling idea the
 * hero uses, so the pipeline's cloud stage and the hero cloud are one dataset.
 */
export function samplePointCloud(count: number, seed = 90210): Float32Array {
  const rng = mulberry32(seed);
  const out = new Float32Array(count * 3);

  type Face = { area: number; at: (u: number, v: number) => [number, number, number] };
  const faces: Face[] = [];

  const addBox = (b: Box, withTop = true) => {
    const [px, py, pz] = b.pos;
    const [sx, sy, sz] = b.size;
    const hx = sx / 2;
    const hy = sy / 2;
    const hz = sz / 2;
    for (const s of [1, -1])
      faces.push({
        area: sy * sz,
        at: (u, v) => [px + s * hx, py - hy + u * sy, pz - hz + v * sz],
      });
    for (const s of [1, -1])
      faces.push({
        area: sx * sy,
        at: (u, v) => [px - hx + u * sx, py - hy + v * sy, pz + s * hz],
      });
    if (withTop)
      faces.push({
        area: sx * sz,
        at: (u, v) => [px - hx + u * sx, py + hy, pz - hz + v * sz],
      });
  };

  [...exteriorWalls(), ...interiorWalls(), ...furniture(), ...floorSlab()].forEach((b) =>
    addBox(b),
  );

  const cum = new Float32Array(faces.length);
  let total = 0;
  faces.forEach((f, i) => {
    total += f.area;
    cum[i] = total;
  });

  for (let i = 0; i < count; i++) {
    const target = rng() * total;
    let lo = 0;
    let hi = faces.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const [x, y, z] = faces[lo].at(rng(), rng());
    const jitter = () => (rng() - 0.5) * 0.05;
    out[i * 3] = x + jitter();
    out[i * 3 + 1] = y + jitter();
    out[i * 3 + 2] = z + jitter();
  }
  return out;
}

/* ------------------------------------------------------------------ ST-03 */

const TICK = 0.28;

/** A dimension string: witness lines, the run itself, and 45° station ticks. */
function dimensionRun(
  out: number[],
  axis: "x" | "z",
  stations: number[],
  offset: number,
  y: number,
) {
  const at = (along: number, off: number): [number, number, number] =>
    axis === "x" ? [along, y, off] : [off, y, along];

  const lo = stations[0];
  const hi = stations[stations.length - 1];
  out.push(...at(lo, offset), ...at(hi, offset));

  for (const s of stations) {
    // witness line back to the measured face
    const inner = offset > 0 ? offset - 0.85 : offset + 0.85;
    out.push(...at(s, inner), ...at(s, offset + (offset > 0 ? 0.34 : -0.34)));
    // 45° tick through the dimension line
    const d = TICK;
    out.push(...at(s - d, offset - d), ...at(s + d, offset + d));
  }
}

/** The measured drawing: overall and intermediate dimensions, plus a height. */
export function dimensionLines(): Float32Array {
  const out: number[] = [];
  const off = 1.9;

  // width string along the south facade, broken at the structural grid
  dimensionRun(out, "x", [-hw, ...PLAN.GRID_X.slice(1, -1), hw], hd + off, 0.02);
  // depth string along the east gable
  dimensionRun(out, "z", [-hd, 0, hd], hw + off, 0.02);

  // clear-height dimension at the north-west corner
  const cx = -hw - 1.2;
  const cz = -hd;
  out.push(cx, 0, cz, cx, H, cz);
  for (const y of [0, H]) {
    out.push(cx - TICK, y - TICK, cz, cx + TICK, y + TICK, cz);
    out.push(cx, y, cz, -hw, y, cz); // witness back to the wall
  }

  return new Float32Array(out);
}

/* ------------------------------------------------------------------ ST-04 */

/**
 * Check ticks floating over the grid. Drawn flat in the plan rather than
 * upright: the camera orbits, and an upright ✓ goes edge-on twice a turn.
 */
export function qcTicks(): Float32Array {
  const out: number[] = [];
  const y = H + 1.0;
  const s = 0.62;
  const tick = (x: number, z: number) => {
    out.push(x - s, y, z + s * 0.1, x - s * 0.2, y, z - s * 0.6);
    out.push(x - s * 0.2, y, z - s * 0.6, x + s, y, z + s * 0.9);
  };
  PLAN.GRID_X.forEach((x, i) =>
    PLAN.GRID_Z.forEach((z, j) => {
      if (i === 2 && j === 1) return; // the flagged station, boxed below
      tick(x, z);
    }),
  );
  return new Float32Array(out);
}

/** The one flagged station: a box round it in the alert colour, with a leader. */
export function qcFlag(): Float32Array {
  const out: number[] = [];
  const x = PLAN.GRID_X[2];
  const z = PLAN.GRID_Z[1];
  const y = H + 1.0;
  const s = 0.85;
  const c: number[][] = [
    [x - s, y, z - s],
    [x + s, y, z - s],
    [x + s, y, z + s],
    [x - s, y, z + s],
  ];
  for (let i = 0; i < 4; i++) out.push(...c[i], ...c[(i + 1) % 4]);
  out.push(x, y, z, x, H, z); // leader down to the column it refers to
  return new Float32Array(out);
}

/* ------------------------------------------------------------------ ST-05 */

const ENV_W = W * 0.94;
const ENV_D = D * 0.78;
const ENV_Y = 0.5;
const ENV_T = 0.42; // body thickness, so it reads as an object not a decal
const FLAP_H = 3.0;

/**
 * The parcel the model ships in: an envelope sitting in the building's own
 * footprint, its flap standing open and the delivered sheet lifting clear.
 * Given as a solid with a tall flap because the camera orbits — a flat outline
 * with folds meeting at a centre apex just reads as a crossed rectangle.
 */
export function envelopeLines(): Float32Array {
  const out: number[] = [];
  const ew = ENV_W / 2;
  const ed = ENV_D / 2;
  const yb = ENV_Y;
  const yt = ENV_Y + ENV_T;

  const ring = (y: number) => {
    const c: number[][] = [
      [-ew, y, ed],
      [ew, y, ed],
      [ew, y, -ed],
      [-ew, y, -ed],
    ];
    for (let i = 0; i < 4; i++) out.push(...c[i], ...c[(i + 1) % 4]);
    return c;
  };
  const bottom = ring(yb);
  const top = ring(yt);
  for (let i = 0; i < 4; i++) out.push(...bottom[i], ...top[i]);

  // flap, hinged on the back edge and standing open
  const tip = [0, yt + FLAP_H, -ed + ENV_D * 0.5];
  out.push(...top[3], ...tip);
  out.push(...top[2], ...tip);
  out.push(...tip, 0, yt, -ed + ENV_D * 0.16); // fold crease

  // the sheet being delivered — lifted clear and pushed out the front
  const sw = ew * 0.68;
  const sd = ed * 0.6;
  const sy = yt + 1.5;
  const sz = ed * 0.95;
  const sheet: number[][] = [
    [-sw, sy, sz + sd],
    [sw, sy, sz + sd],
    [sw, sy + 0.5, sz - sd],
    [-sw, sy + 0.5, sz - sd],
  ];
  for (let i = 0; i < 4; i++) out.push(...sheet[i], ...sheet[(i + 1) % 4]);
  // ruled lines, so the sheet reads as a drawing rather than a blank card
  for (const f of [0.34, 0.56, 0.78]) {
    const lz = sz + sd - f * sd * 2;
    const ly = sy + f * 0.5;
    out.push(-sw * 0.7, ly, lz, sw * 0.7, ly, lz);
  }
  // it is coming out of the envelope, not floating beside it
  out.push(-sw, sy, sz + sd * 0.2, -sw * 0.8, yt, ed * 0.2);
  out.push(sw, sy, sz + sd * 0.2, sw * 0.8, yt, ed * 0.2);

  // stamp, back-right corner of the face
  const stx = ew - 1.4;
  const stz = -ed + 0.95;
  const ss = 0.55;
  const st: number[][] = [
    [stx - ss, yt, stz + ss],
    [stx + ss, yt, stz + ss],
    [stx + ss, yt, stz - ss],
    [stx - ss, yt, stz - ss],
  ];
  for (let i = 0; i < 4; i++) out.push(...st[i], ...st[(i + 1) % 4]);

  return new Float32Array(out);
}

/** Solid body under the outline, so it reads as paper not a wireframe. */
export function envelopePanel(): Box[] {
  return [{ pos: [0, ENV_Y + ENV_T / 2, 0], size: [ENV_W, ENV_T, ENV_D] }];
}

/** Edges of the delivered box — a thin slab standing in for the model file. */
export function deliveryEdges(): Float32Array {
  const out: number[] = [];
  envelopePanel().forEach((b) => boxEdges(b, out));
  return new Float32Array(out);
}
