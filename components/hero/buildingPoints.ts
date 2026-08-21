/*
  Scan-target geometry for the hero point cloud.

  The hero scans the same apartment the pipeline orbit models — same plan, same
  openings, same partitions — read as laser returns instead of solid geometry.
  Points are sampled across the real box faces from apartmentModel, so the
  dotted massing and the modelled one are provably the same building.

  Flat-topped: the roof/ceiling slab is deliberately omitted, so the scan reads
  as an open plan seen from above, the way a cut-away survey does.
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

/** Overall massing, for the static fallback drawing. Flat top — no ridge. */
export const BUILDING = {
  W: PLAN.W,
  D: PLAN.D,
  H: PLAN.H + PLAN.SLAB,
};

type Rng = () => number;

/** Deterministic RNG so server fallback + client scene agree and re-renders are stable. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussianish(rng: Rng, sigma: number) {
  // cheap approximate gaussian (sum of uniforms)
  return (rng() + rng() + rng() - 1.5) * sigma * 2;
}

/**
 * One sampleable face of a box. The scanner never sees undersides, so the
 * -Y face of every box is skipped when the face list is built.
 */
type Face = {
  area: number;
  /** map two uniform randoms onto a point on the face */
  at: (u: number, v: number) => [number, number, number];
  intensity: number;
};

/** Faces of one box, minus the floor-facing one, weighted by true area. */
function facesOf(b: Box, intensity: number, includeTop = true): Face[] {
  const [px, py, pz] = b.pos;
  const [sx, sy, sz] = b.size;
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;
  const faces: Face[] = [];

  // ±X
  for (const s of [1, -1]) {
    faces.push({
      area: sy * sz,
      intensity,
      at: (u, v) => [px + s * hx, py - hy + u * sy, pz - hz + v * sz],
    });
  }
  // ±Z
  for (const s of [1, -1]) {
    faces.push({
      area: sx * sy,
      intensity,
      at: (u, v) => [px - hx + u * sx, py - hy + v * sy, pz + s * hz],
    });
  }
  // top only — a scan gets strong returns off horizontal upward faces
  if (includeTop) {
    faces.push({
      area: sx * sz,
      intensity: intensity * 0.8,
      at: (u, v) => [px - hx + u * sx, py + hy, pz - hz + v * sz],
    });
  }
  return faces;
}

/** Perimeter segments of a glazing pane — the bright frame returns. */
function paneOutline(b: Box): Array<[number, number, number]> {
  const [px, py, pz] = b.pos;
  const [sx, sy, sz] = b.size;
  // panes are thin in one axis; the frame runs in the other two
  const alongX = sx >= sz;
  const hu = (alongX ? sx : sz) / 2;
  const hv = sy / 2;
  const pts: Array<[number, number, number]> = [];
  const push = (u: number, v: number) =>
    pts.push(alongX ? [px + u, py + v, pz] : [px, py + v, pz + u]);
  push(-hu, -hv);
  push(hu, -hv);
  push(hu, hv);
  push(-hu, hv);
  return pts;
}

export function generatePoints(count: number, seed = 1337) {
  const rng = mulberry32(seed);
  const targets = new Float32Array(count * 3);
  const starts = new Float32Array(count * 3);
  const rands = new Float32Array(count);
  // pseudo scan-return intensity per point — what makes the massing read as
  // 3D form: each surface family gets its own brightness
  const intensities = new Float32Array(count);

  // Surface families, brightest first. Exterior envelope carries the read;
  // partitions and furniture sit behind it; the slab is the faintest.
  const faces: Face[] = [
    ...exteriorWalls().flatMap((b) => facesOf(b, 1.0)),
    ...interiorWalls().flatMap((b) => facesOf(b, 0.6)),
    ...furniture().flatMap((b) => facesOf(b, 0.78)),
    ...floorSlab().flatMap((b) => facesOf(b, 0.3)),
  ];

  // cumulative area table for weighted face picking
  const cumulative = new Float32Array(faces.length);
  let total = 0;
  faces.forEach((f, i) => {
    total += f.area;
    cumulative[i] = total;
  });

  const pickFace = (): Face => {
    const target = rng() * total;
    let lo = 0;
    let hi = faces.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    return faces[lo];
  };

  const panes = glazing().map(paneOutline);

  const setPoint = (i: number, x: number, y: number, z: number, intensity = 1) => {
    intensities[i] = intensity * (0.85 + rng() * 0.3);
    const noise = 0.02;
    targets[i * 3] = x + gaussianish(rng, noise);
    targets[i * 3 + 1] = y + gaussianish(rng, noise);
    targets[i * 3 + 2] = z + gaussianish(rng, noise);
    // start: random shell around the scene
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    const radius = 11 + rng() * 5;
    starts[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starts[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) * 0.85 + 0.2;
    starts[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    rands[i] = rng();
  };

  const groundShare = 0.05;
  const windowShare = 0.13;
  let i = 0;
  const nGround = Math.floor(count * groundShare);
  const nWindow = Math.floor(count * windowShare);
  const nSurface = count - nGround - nWindow;

  // ground returns — sparse disc around the footprint, faint
  const groundR = Math.max(PLAN.W, PLAN.D) * 0.62;
  for (let g = 0; g < nGround; g++, i++) {
    const angle = rng() * Math.PI * 2;
    const radius = Math.sqrt(rng()) * groundR + 1.4;
    setPoint(i, Math.cos(angle) * radius, 0, Math.sin(angle) * radius, 0.22);
  }

  // window frames — bright outlines around the openings
  for (let w = 0; w < nWindow; w++, i++) {
    const outline = panes[Math.floor(rng() * panes.length)];
    const edge = Math.floor(rng() * 4);
    const a = outline[edge];
    const b = outline[(edge + 1) % 4];
    const t = rng();
    setPoint(
      i,
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
      1.35,
    );
  }

  // building surfaces, weighted by true face area
  for (let s = 0; s < nSurface; s++, i++) {
    const face = pickFace();
    const [x, y, z] = face.at(rng(), rng());
    setPoint(i, x, y, z, face.intensity);
  }

  return { targets, starts, rands, intensities };
}

/**
 * Edge list of the massing for the resolved wireframe overlay: the flat-topped
 * envelope plus the partition lines, so the plan reads without a roof.
 */
export function buildingEdges(): number[] {
  const { W, D } = PLAN;
  const H = PLAN.H + PLAN.SLAB;
  const hw = W / 2;
  const hd = D / 2;
  // prettier-ignore
  const v = {
    a: [-hw, 0, hd], b: [hw, 0, hd], c: [hw, 0, -hd], d: [-hw, 0, -hd],
    e: [-hw, H, hd], f: [hw, H, hd], g: [hw, H, -hd], h: [-hw, H, -hd],
  };
  const pairs: Array<[number[], number[]]> = [
    [v.a, v.b], [v.b, v.c], [v.c, v.d], [v.d, v.a], // base
    [v.a, v.e], [v.b, v.f], [v.c, v.g], [v.d, v.h], // corners
    [v.e, v.f], [v.f, v.g], [v.g, v.h], [v.h, v.e], // flat parapet — no ridge
  ];

  // partition head lines, so the interior plan is legible from outside
  const t = PLAN.H;
  for (const [ax, az, bx, bz] of [
    [-2.2, -hd, -2.2, 0.6],
    [-hw, -1.9, -2.2, -1.9],
    [2.2, 1.4, 2.2, hd],
    [2.2, 1.4, hw, 1.4],
  ] as const) {
    pairs.push([
      [ax, t, az],
      [bx, t, bz],
    ]);
  }

  return pairs.flatMap(([p, q]) => [...p, ...q]);
}
