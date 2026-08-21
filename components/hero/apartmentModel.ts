/*
  Procedural apartment geometry for the hero orbit.

  One apartment, described once, read three ways: as a furnished home, as a
  BIM model, and as the structural frame holding it up. Every layer shares the
  same plan grid, so a column in the structural pass sits exactly where the
  pier is in the architectural pass — which is the whole point of the rotation.

  Boxes only, axis-aligned, so each layer renders as a single InstancedMesh
  plus one merged LineSegments pass for edges. No model files.
*/

export type Box = {
  pos: [number, number, number];
  size: [number, number, number];
};

export const PLAN = {
  W: 13, // exterior width along x
  D: 9, // exterior depth along z
  H: 3, // clear wall height
  T: 0.24, // wall thickness
  SLAB: 0.32,
  /** column grid — structural bays, and what the partitions align to */
  GRID_X: [-6.5, -2.2, 2.2, 6.5],
  GRID_Z: [-4.5, 0, 4.5],
} as const;

const { W, D, H, T } = PLAN;
const hw = W / 2;
const hd = D / 2;

type Opening = { center: number; width: number; sill: number; head: number };

/**
 * A wall run broken by openings: piers between them, a sill below each and a
 * header above. `axis` is the direction the wall runs; `fixed` is its other
 * coordinate.
 */
function wallRun(
  axis: "x" | "z",
  fixed: number,
  from: number,
  to: number,
  openings: Opening[],
  thickness: number = T,
  height: number = H,
): Box[] {
  const boxes: Box[] = [];
  const sorted = [...openings].sort((a, b) => a.center - b.center);

  const place = (mid: number, len: number, y: number, h: number) => {
    if (len <= 0.001 || h <= 0.001) return;
    boxes.push(
      axis === "x"
        ? { pos: [mid, y, fixed], size: [len, h, thickness] }
        : { pos: [fixed, y, mid], size: [thickness, h, len] },
    );
  };

  let cursor = from;
  for (const o of sorted) {
    const start = o.center - o.width / 2;
    const end = o.center + o.width / 2;
    // solid pier up to this opening
    place((cursor + start) / 2, start - cursor, height / 2, height);
    // sill under, header over
    place(o.center, o.width, o.sill / 2, o.sill);
    place(o.center, o.width, (o.head + height) / 2, height - o.head);
    cursor = end;
  }
  place((cursor + to) / 2, to - cursor, height / 2, height);
  return boxes;
}

const WINDOW = { sill: 0.85, head: 2.45 };
const DOOR = { sill: 0, head: 2.1 };

/** Exterior envelope — glazed to the south and west, mostly solid to the north. */
export function exteriorWalls(): Box[] {
  return [
    // south facade — the glazed living side
    ...wallRun("x", hd, -hw, hw, [
      { center: -4.2, width: 2.4, ...WINDOW },
      { center: 0.4, width: 3.6, ...WINDOW },
      { center: 4.6, width: 2.2, ...WINDOW },
    ]),
    // north facade — service side, one small window and the entry door
    ...wallRun("x", -hd, -hw, hw, [
      { center: -3.4, width: 1.4, ...WINDOW },
      { center: 3.9, width: 1.1, ...DOOR },
    ]),
    // west gable
    ...wallRun("z", -hw, -hd, hd, [{ center: -1.6, width: 1.8, ...WINDOW }]),
    // east gable
    ...wallRun("z", hw, -hd, hd, [{ center: 2.1, width: 2.6, ...WINDOW }]),
  ];
}

/** Partitions: two bedrooms west, bathroom east, open living/kitchen south. */
export function interiorWalls(): Box[] {
  const t = T * 0.75;
  return [
    // bedroom corridor wall, with a door
    ...wallRun("z", -2.2, -hd, 0.6, [{ center: -1.2, width: 0.9, ...DOOR }], t),
    // divider between the two bedrooms
    ...wallRun("x", -1.9, -hw, -2.2, [], t),
    // bathroom box
    ...wallRun("z", 2.2, 1.4, hd, [{ center: 3.4, width: 0.85, ...DOOR }], t),
    ...wallRun("x", 1.4, 2.2, hw, [], t),
    // kitchen back wall, half height — reads as a counter run in the arch pass
    ...wallRun("x", -1.4, 2.6, hw, [], t, 1.1),
  ];
}

/** Glass panes sitting in the exterior openings. */
export function glazing(): Box[] {
  const h = WINDOW.head - WINDOW.sill;
  const y = (WINDOW.head + WINDOW.sill) / 2;
  const g = 0.06;
  return [
    { pos: [-4.2, y, hd], size: [2.4, h, g] },
    { pos: [0.4, y, hd], size: [3.6, h, g] },
    { pos: [4.6, y, hd], size: [2.2, h, g] },
    { pos: [-3.4, y, -hd], size: [1.4, h, g] },
    { pos: [-hw, y, -1.6], size: [g, h, 1.8] },
    { pos: [hw, y, 2.1], size: [g, h, 2.6] },
  ];
}

/** Furniture — only present in the architectural read. */
export function furniture(): Box[] {
  return [
    // living: sofa, back cushion, coffee table, rug
    { pos: [1.1, 0.34, 2.2], size: [3.4, 0.68, 1.0] },
    { pos: [1.1, 0.78, 2.62], size: [3.4, 0.5, 0.22] },
    { pos: [1.1, 0.19, 0.5], size: [1.5, 0.38, 0.8] },
    { pos: [1.1, 0.02, 1.5], size: [4.6, 0.04, 3.0] },
    // dining
    { pos: [-0.4, 0.36, -2.6], size: [1.9, 0.72, 0.95] },
    { pos: [-1.1, 0.23, -1.9], size: [0.42, 0.46, 0.42] },
    { pos: [0.3, 0.23, -1.9], size: [0.42, 0.46, 0.42] },
    { pos: [-1.1, 0.23, -3.3], size: [0.42, 0.46, 0.42] },
    { pos: [0.3, 0.23, -3.3], size: [0.42, 0.46, 0.42] },
    // kitchen run along the half wall
    { pos: [4.6, 0.46, -1.85], size: [3.6, 0.92, 0.68] },
    { pos: [4.6, 2.15, -3.9], size: [3.2, 0.7, 0.38] },
    // primary bedroom
    { pos: [-4.6, 0.28, -2.4], size: [2.1, 0.56, 1.9] },
    { pos: [-4.6, 0.62, -3.3], size: [2.1, 0.7, 0.18] },
    { pos: [-3.2, 0.3, -1.2], size: [0.5, 0.6, 0.5] },
    // second bedroom
    { pos: [-4.9, 0.26, 1.2], size: [1.9, 0.52, 1.7] },
    { pos: [-3.3, 0.55, 2.6], size: [0.55, 1.1, 1.4] },
    // bathroom fixtures
    { pos: [3.1, 0.28, 3.3], size: [0.7, 0.56, 1.5] },
    { pos: [5.4, 0.42, 2.0], size: [0.9, 0.84, 0.5] },
  ];
}

/** Columns, beams and slabs — the frame that survives when the walls go. */
export function structure(): Box[] {
  const boxes: Box[] = [];
  const col = 0.42;
  const beam = 0.3;
  const beamY = H + PLAN.SLAB / 2 - 0.1;

  for (const x of PLAN.GRID_X) {
    for (const z of PLAN.GRID_Z) {
      boxes.push({ pos: [x, H / 2, z], size: [col, H, col] });
    }
  }
  // beams spanning x at each grid line in z
  for (const z of PLAN.GRID_Z) {
    boxes.push({ pos: [0, beamY, z], size: [W, beam, beam] });
  }
  // beams spanning z at each grid line in x
  for (const x of PLAN.GRID_X) {
    boxes.push({ pos: [x, beamY, 0], size: [beam, beam, D] });
  }
  return boxes;
}

export function floorSlab(): Box[] {
  return [{ pos: [0, -PLAN.SLAB / 2, 0], size: [W + 0.5, PLAN.SLAB, D + 0.5] }];
}

/**
 * Kept off in the architectural read so the plan is legible from above — the
 * dollhouse cutaway every apartment visualisation uses — and switched on for
 * the BIM and structural reads, where the slab is a real element.
 */
export function ceilingSlab(): Box[] {
  return [{ pos: [0, H + PLAN.SLAB / 2, 0], size: [W + 0.5, PLAN.SLAB, D + 0.5] }];
}

/** 12 edges of an axis-aligned box, as flat line-segment vertex pairs. */
export function boxEdges(b: Box, out: number[]) {
  const [cx, cy, cz] = b.pos;
  const [sx, sy, sz] = b.size;
  const x0 = cx - sx / 2, x1 = cx + sx / 2;
  const y0 = cy - sy / 2, y1 = cy + sy / 2;
  const z0 = cz - sz / 2, z1 = cz + sz / 2;

  const c: [number, number, number][] = [
    [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
    [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
  ];
  const pairs = [
    [0, 1], [1, 2], [2, 3], [3, 0], // bottom
    [4, 5], [5, 6], [6, 7], [7, 4], // top
    [0, 4], [1, 5], [2, 6], [3, 7], // verticals
  ];
  for (const [a, b2] of pairs) {
    out.push(...c[a], ...c[b2]);
  }
}

export function edgesFor(boxes: Box[]): Float32Array {
  const out: number[] = [];
  for (const b of boxes) boxEdges(b, out);
  return new Float32Array(out);
}
