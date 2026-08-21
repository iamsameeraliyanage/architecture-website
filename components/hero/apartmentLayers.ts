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
  glazing,
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

/*
  What actually ships: the drawing sheet. The model is laid flat as a scaled
  plan — walls filled, openings shown, dimensioned, in a bordered sheet with a
  title block. A flat sheet also happens to be the one thing that stays legible
  under an orbiting camera, which an upright drawing would not.
*/

const SHEET_W = 20;
const SHEET_D = 15;
const SHEET_Y = 0.34;
/** Poché sits a hair above the paper so it never z-fights with it. */
const POCHE_Y = SHEET_Y + 0.03;

/** The paper itself. */
export function sheetPanel(): Box[] {
  return [{ pos: [0, SHEET_Y - 0.04, 0], size: [SHEET_W, 0.08, SHEET_D] }];
}

/** Walls filled solid — the poché that makes a plan read as a plan. */
export function planPoche(): Box[] {
  return [...exteriorWalls(), ...interiorWalls()].map((b) => ({
    pos: [b.pos[0], POCHE_Y, b.pos[2]] as [number, number, number],
    size: [b.size[0], 0.02, b.size[2]] as [number, number, number],
  }));
}

function rect(out: number[], x0: number, z0: number, x1: number, z1: number, y: number) {
  const c = [
    [x0, y, z0],
    [x1, y, z0],
    [x1, y, z1],
    [x0, y, z1],
  ];
  for (let i = 0; i < 4; i++) out.push(...c[i], ...c[(i + 1) % 4]);
}

/**
 * Door swings. These mirror the openings cut in exteriorWalls/interiorWalls —
 * an annotation layer over the same plan, drawn the way a door is drawn.
 */
const DOORS: Array<{ x: number; z: number; w: number; a0: number; dir: 1 | -1 }> = [
  // entry, north facade
  { x: 3.9, z: -PLAN.D / 2, w: 1.1, a0: 0, dir: 1 },
  // bedroom corridor, on the x = -2.2 partition
  { x: -2.2, z: -1.2, w: 0.9, a0: Math.PI / 2, dir: 1 },
  // bathroom, on the x = 2.2 partition
  { x: 2.2, z: 3.4, w: 0.85, a0: Math.PI / 2, dir: -1 },
];

/** Wall outlines, door swings and the structural grid, all at sheet level. */
export function planInk(): Float32Array {
  const out: number[] = [];
  const y = POCHE_Y + 0.01;

  // outline every wall footprint, so the poché reads crisply
  for (const b of [...exteriorWalls(), ...interiorWalls()]) {
    const [px, , pz] = b.pos;
    const [sx, , sz] = b.size;
    rect(out, px - sx / 2, pz - sz / 2, px + sx / 2, pz + sz / 2, y);
  }

  // door leaf + quarter-circle swing
  for (const d of DOORS) {
    const hingeX = d.a0 === 0 ? d.x - (d.w / 2) * d.dir : d.x;
    const hingeZ = d.a0 === 0 ? d.z : d.z - (d.w / 2) * d.dir;
    const leafA = d.a0 + (Math.PI / 2) * d.dir;
    out.push(
      hingeX,
      y,
      hingeZ,
      hingeX + Math.cos(leafA) * d.w,
      y,
      hingeZ + Math.sin(leafA) * d.w,
    );
    const STEPS = 9;
    for (let i = 0; i < STEPS; i++) {
      const a1 = d.a0 + ((Math.PI / 2) * i * d.dir) / STEPS;
      const a2 = d.a0 + ((Math.PI / 2) * (i + 1) * d.dir) / STEPS;
      out.push(
        hingeX + Math.cos(a1) * d.w,
        y,
        hingeZ + Math.sin(a1) * d.w,
        hingeX + Math.cos(a2) * d.w,
        y,
        hingeZ + Math.sin(a2) * d.w,
      );
    }
  }

  // windows: a line across each opening on the wall centreline
  for (const g of glazing()) {
    const [px, , pz] = g.pos;
    const [sx, , sz] = g.size;
    if (sx >= sz) out.push(px - sx / 2, y, pz, px + sx / 2, y, pz);
    else out.push(px, y, pz - sz / 2, px, y, pz + sz / 2);
  }

  return new Float32Array(out);
}

/** Dimension strings placed clear of the title block. */
export function planDimensions(): Float32Array {
  const out: number[] = [];
  const y = POCHE_Y + 0.01;
  // overall + grid along the top edge, depth down the left edge
  dimensionRun(out, "x", [-hw, ...PLAN.GRID_X.slice(1, -1), hw], hd + 1.5, y);
  dimensionRun(out, "z", [-hd, 0, hd], -hw - 1.5, y);
  return new Float32Array(out);
}

/**
 * Sheet border, title block, north point and scale bar. The title block and
 * north point take the far edge — the orbit foreshortens it heavily, so the
 * near edge is reserved for the dimension strings that have to stay readable.
 */
export function sheetFrame(): Float32Array {
  const out: number[] = [];
  const y = SHEET_Y + 0.02;
  const sw = SHEET_W / 2;
  const sd = SHEET_D / 2;
  const inset = 0.45;

  rect(out, -sw, -sd, sw, sd, y);
  rect(out, -sw + inset, -sd + inset, sw - inset, sd - inset, y);

  // title block, far-right
  const tx0 = 3.4;
  const tz0 = -sd + inset;
  const tx1 = sw - inset;
  const tz1 = -5.2;
  rect(out, tx0, tz0, tx1, tz1, y);
  for (const f of [0.36, 0.66]) {
    const lz = tz0 + (tz1 - tz0) * f;
    out.push(tx0, y, lz, tx1, y, lz);
  }
  out.push(tx0 + (tx1 - tx0) * 0.44, y, tz0 + (tz1 - tz0) * 0.66, tx0 + (tx1 - tx0) * 0.44, y, tz1);

  // north point — triangle in a circle, far-left
  const nx = -sw + 1.6;
  const nz = -sd + 1.5;
  const r = 0.72;
  const STEPS = 20;
  for (let i = 0; i < STEPS; i++) {
    const a1 = (i / STEPS) * Math.PI * 2;
    const a2 = ((i + 1) / STEPS) * Math.PI * 2;
    out.push(nx + Math.cos(a1) * r, y, nz + Math.sin(a1) * r, nx + Math.cos(a2) * r, y, nz + Math.sin(a2) * r);
  }
  const tip: number[] = [nx, y, nz - r * 0.92];
  out.push(...tip, nx - r * 0.42, y, nz + r * 0.72);
  out.push(...tip, nx + r * 0.42, y, nz + r * 0.72);
  out.push(nx - r * 0.42, y, nz + r * 0.72, nx + r * 0.42, y, nz + r * 0.72);

  // scale bar, near-left, clear of the width string above it
  const bx = -sw + 1.4;
  const bz = sd - 1.0;
  const seg = 0.82;
  const bh = 0.28;
  rect(out, bx, bz - bh / 2, bx + seg * 4, bz + bh / 2, y);
  for (let i = 1; i < 4; i++) out.push(bx + seg * i, y, bz - bh / 2, bx + seg * i, y, bz + bh / 2);

  return new Float32Array(out);
}
