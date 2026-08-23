import { buildingEdges, generatePoints } from "./buildingPoints";

/*
  The camera for the phone/tablet scan stage, and the frame it needs.

  This lives apart from the component that draws with it because the LAYOUT has
  to agree with the PROJECTION about how tall the stage is. Getting that wrong
  is what produced every earlier version of this: a band handed `flex-1` left
  40% of its height empty in every frame because the drawing was fitted to the
  width; a band cut to a guessed 1.8:1 was too short, so the height became the
  binding axis and the apartment shrank to 77% of the width it had room for.

  Both are the same mistake — choosing the frame and the fit independently. The
  ratio at which neither axis wastes the other is a property of the geometry
  and the camera, so it is computed here, once, and the stage takes it as its
  aspect-ratio. Change PITCH and the band reshapes itself to match.
*/

/** Camera distance and focal length, in the model's own units. */
export const CAM_DIST = 21;
export const FOCAL = 12.4;

/**
 * How far the camera looks down, in radians.
 *
 * The apartment is 13m x 9m on plan and only 3m tall, so this angle decides
 * what the drawing is of. Near eye level it projects as a flat smear and reads
 * as noise; at 32 degrees the open top dominates and it reads as a floor plan
 * tipped over — correct information, but an odd object, with the walls
 * carrying none of the form.
 *
 * 23 degrees is the three-quarter the desktop scene takes: enough plan for the
 * partitions and the room divisions, enough elevation that the facades and the
 * window openings still stand up as walls.
 */
export const PITCH = 0.4;
export const SIN_P = Math.sin(PITCH);
export const COS_P = Math.cos(PITCH);

/** The height the camera aims at — mid-wall, so the model sits in the frame. */
export const LOOK_Y = 1.5;

/**
 * Share of each axis the widest/tallest moment of the turn may occupy.
 *
 * This is the only size control: the band's own box is set by STAGE_ASPECT and
 * does not move with it, so lowering FILL shrinks the apartment inside a
 * canvas that stays exactly as wide. At 0.97 the drawing very nearly touched
 * the top of the band, which sits directly under the fixed header — 0.86
 * gives it room to sit in.
 */
const FILL = 0.86;

/**
 * Ink the geometry does not account for, in CSS pixels per side.
 *
 * The bounds above are where the model's *coordinates* land. What gets painted
 * is wider: a point is a fillRect up to 1.7px square drawn from its coordinate,
 * the wireframe is a 1px stroke with round caps, and both antialias. Fitting
 * into a box inset by this leaves the ink somewhere to go, which is why FILL
 * can then be as high as it is.
 */
const PAINT_PAD = 4;

/** Rotation samples used to find that worst case. 48 is 7.5 degrees apart. */
const FIT_STEPS = 48;

/**
 * Points generated for the stage. The number actually drawn is a stride
 * through these, set from the canvas area by the component; the whole set is
 * generated here so the bounds below are the bounds of the drawn geometry
 * itself rather than of something standing in for it.
 */
export const MAX_COUNT = 7000;
const SEED = 20260823;
export const POINTS = generatePoints(MAX_COUNT, SEED);

/**
 * Signed projected bounds over a full revolution, in the units where a screen
 * position is `centre + u * scale`.
 *
 * Signed, not a single max-magnitude, because the projection is not symmetric
 * about the camera axis: the near-bottom corner of the slab projects roughly
 * twice as far below the axis as the far parapet does above it. Treating it as
 * symmetric both reserved height that could never be used and hung the drawing
 * off the bottom of its box.
 */
function bounds() {
  const { targets } = POINTS;
  const edges = buildingEdges();
  let uMin = Infinity;
  let uMax = -Infinity;
  let vMin = Infinity;
  let vMax = -Infinity;

  for (let s = 0; s < FIT_STEPS; s++) {
    const a = (s / FIT_STEPS) * Math.PI * 2;
    const sn = Math.sin(a);
    const cs = Math.cos(a);
    const consider = (x: number, y: number, z: number) => {
      const rx = x * cs - z * sn;
      const rz0 = x * sn + z * cs;
      const ty = y * COS_P - rz0 * SIN_P;
      const rz = rz0 * COS_P + y * SIN_P;
      const depth = CAM_DIST - rz;
      if (depth <= 0.6) return;
      const k = FOCAL / depth;
      const u = rx * k;
      const v = ty * k;
      if (u < uMin) uMin = u;
      if (u > uMax) uMax = u;
      if (v < vMin) vMin = v;
      if (v > vMax) vMax = v;
    };

    // every third drawn point — the hull converges long before the full set —
    // plus every wireframe vertex, which is the outermost thing on the canvas
    for (let i = 0; i < MAX_COUNT; i += 3) {
      consider(targets[i * 3], targets[i * 3 + 1] - LOOK_Y, targets[i * 3 + 2]);
    }
    for (let o = 0; o < edges.length; o += 3) {
      consider(edges[o], edges[o + 1] - LOOK_Y, edges[o + 2]);
    }
  }
  return { uMin, uMax, vMin, vMax };
}

const B = bounds();
const SPAN_U = B.uMax - B.uMin || 1;
const SPAN_V = B.vMax - B.vMin || 1;
/** Where the drawing's own centre sits relative to the camera axis. */
const MID_U = (B.uMin + B.uMax) / 2;
const MID_V = (B.vMin + B.vMax) / 2;

/**
 * The stage's width:height. At this ratio the widest moment of the turn and
 * the tallest moment reach the frame together, so neither axis is spent
 * reserving room the other will never use.
 */
export const STAGE_ASPECT = SPAN_U / SPAN_V;

/**
 * Scale and centre for a box of this size: the largest the whole revolution
 * fits in, with the drawing's own midpoint — not the camera axis — placed at
 * the middle of the box.
 */
export function frame(width: number, height: number) {
  const w = Math.max(1, width - PAINT_PAD * 2);
  const h = Math.max(1, height - PAINT_PAD * 2);
  const scale = Math.min((w * FILL) / SPAN_U, (h * FILL) / SPAN_V);
  return {
    scale,
    cx: width / 2 - MID_U * scale,
    cy: height / 2 + MID_V * scale,
  };
}
