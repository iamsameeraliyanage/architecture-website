/*
  Procedural scan-target geometry for the hero point cloud:
  a simple gabled Swiss building massing, sampled across its surfaces the way
  a laser scan would land on them — plus window outlines and sparse ground returns.
  No model files; everything is generated.
*/

export const BUILDING = {
  W: 11, // width along x (ridge axis)
  D: 7, // depth along z
  H: 5.2, // eaves height
  RIDGE: 7.5, // ridge height
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

export function generatePoints(count: number, seed = 1337) {
  const { W, D, H, RIDGE } = BUILDING;
  const rng = mulberry32(seed);
  const targets = new Float32Array(count * 3);
  const starts = new Float32Array(count * 3);
  const rands = new Float32Array(count);
  // pseudo scan-return intensity per point — this is what makes the massing
  // read as 3D form: each surface family gets its own brightness
  const intensities = new Float32Array(count);

  const hw = W / 2;
  const hd = D / 2;
  const gable = RIDGE - H;
  const slopeLen = Math.hypot(hd, gable);

  // surface areas → sampling weights
  const areaFront = W * H; // ×2 (front/back)
  const areaEnd = D * H + (D * gable) / 2; // ×2 (left/right incl. gable triangle)
  const areaRoof = W * slopeLen; // ×2 (two pitches)
  const totalWall = 2 * areaFront + 2 * areaEnd + 2 * areaRoof;

  const groundShare = 0.045;
  const windowShare = 0.16;
  const surfaceShare = 1 - groundShare - windowShare;

  // window grid on front & back walls
  const winCols = 5;
  const winRows = 2;
  const winW = 1.15;
  const winH = 1.4;
  const windows: Array<[number, number, number]> = []; // cx, cy, z-side
  for (const side of [1, -1]) {
    for (let c = 0; c < winCols; c++) {
      for (let r = 0; r < winRows; r++) {
        const cx = -hw + ((c + 0.5) / winCols) * W;
        const cy = 1.4 + r * 2.1;
        windows.push([cx, cy, side]);
      }
    }
  }

  const setPoint = (i: number, x: number, y: number, z: number, intensity = 1) => {
    intensities[i] = intensity * (0.85 + rng() * 0.3);
    const noise = 0.02;
    targets[i * 3] = x + gaussianish(rng, noise);
    targets[i * 3 + 1] = y + gaussianish(rng, noise);
    targets[i * 3 + 2] = z + gaussianish(rng, noise);
    // start: random shell around the scene
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    const radius = 10 + rng() * 5;
    starts[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starts[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) * 0.85 + 0.2;
    starts[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    rands[i] = rng();
  };

  let i = 0;
  const nGround = Math.floor(count * groundShare);
  const nWindow = Math.floor(count * windowShare);
  const nSurface = count - nGround - nWindow;

  // ground returns — sparse disc around the footprint, faint
  for (let g = 0; g < nGround; g++, i++) {
    const angle = rng() * Math.PI * 2;
    const radius = Math.sqrt(rng()) * 7 + 1.2;
    setPoint(i, Math.cos(angle) * radius, 0, Math.sin(angle) * radius, 0.22);
  }

  // window outlines — bright frame lines around otherwise-empty openings
  for (let w = 0; w < nWindow; w++, i++) {
    const [cx, cy, side] = windows[Math.floor(rng() * windows.length)];
    const perim = rng() * 2 * (winW + winH);
    let x = 0;
    let y = 0;
    if (perim < winW) {
      x = -winW / 2 + perim;
      y = -winH / 2;
    } else if (perim < winW + winH) {
      x = winW / 2;
      y = -winH / 2 + (perim - winW);
    } else if (perim < 2 * winW + winH) {
      x = winW / 2 - (perim - winW - winH);
      y = winH / 2;
    } else {
      x = -winW / 2;
      y = winH / 2 - (perim - 2 * winW - winH);
    }
    setPoint(i, cx + x, cy + y, side * hd, 1.35);
  }

  const inWindow = (x: number, y: number) => {
    for (const [cx, cy] of windows) {
      if (Math.abs(x - cx) < winW / 2 && Math.abs(y - cy) < winH / 2) return true;
    }
    return false;
  };

  // building surfaces, weighted by area; brightness per surface family
  // (front facade bright, end walls mid, roof dim) fakes scan-return shading
  for (let s = 0; s < nSurface; s++, i++) {
    const pick = rng() * totalWall;
    if (pick < 2 * areaFront) {
      // front/back walls — windows are holes, not denser texture
      const side = pick < areaFront ? 1 : -1;
      let x = -hw + rng() * W;
      let y = rng() * H;
      let guard = 0;
      while (inWindow(x, y) && guard < 8) {
        x = -hw + rng() * W;
        y = rng() * H;
        guard++;
      }
      setPoint(i, x, y, side * hd, side === 1 ? 1.0 : 0.55);
    } else if (pick < 2 * areaFront + 2 * areaEnd) {
      // end walls incl. gable triangle
      const side = pick < 2 * areaFront + areaEnd ? 1 : -1;
      const wallArea = D * H;
      const triArea = (D * gable) / 2;
      const endIntensity = side === 1 ? 0.62 : 0.45;
      if (rng() * (wallArea + triArea) < wallArea) {
        setPoint(i, side * hw, rng() * H, -hd + rng() * D, endIntensity);
      } else {
        // gable triangle: width shrinks toward the ridge
        const yy = H + (1 - Math.sqrt(rng())) * gable;
        const halfWidth = hd * (1 - (yy - H) / gable);
        setPoint(i, side * hw, yy, -halfWidth + rng() * (halfWidth * 2), endIntensity);
      }
    } else {
      // roof pitches — dimmest family, so the roof stops swallowing the form
      const side = rng() < 0.5 ? 1 : -1;
      const along = rng(); // eaves → ridge
      const x = -hw + rng() * W;
      const y = H + along * gable;
      const z = side * hd * (1 - along);
      setPoint(i, x, y, z, side === 1 ? 0.4 : 0.3);
    }
  }

  return { targets, starts, rands, intensities };
}

/** Edge list of the massing, for the resolved wireframe overlay. */
export function buildingEdges(): number[] {
  const { W, D, H, RIDGE } = BUILDING;
  const hw = W / 2;
  const hd = D / 2;
  // prettier-ignore
  const v = {
    a: [-hw, 0, hd], b: [hw, 0, hd], c: [hw, 0, -hd], d: [-hw, 0, -hd],
    e: [-hw, H, hd], f: [hw, H, hd], g: [hw, H, -hd], h: [-hw, H, -hd],
    r1: [-hw, RIDGE, 0], r2: [hw, RIDGE, 0],
  };
  const pairs: Array<[number[], number[]]> = [
    [v.a, v.b], [v.b, v.c], [v.c, v.d], [v.d, v.a], // base
    [v.a, v.e], [v.b, v.f], [v.c, v.g], [v.d, v.h], // columns
    [v.e, v.f], [v.f, v.g], [v.g, v.h], [v.h, v.e], // eaves
    [v.e, v.r1], [v.h, v.r1], [v.f, v.r2], [v.g, v.r2], // gables
    [v.r1, v.r2], // ridge
  ];
  return pairs.flatMap(([p, q]) => [...p, ...q]);
}
