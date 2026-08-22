/*
  Generates the case-study plate images in public/cases/ as procedural
  point-cloud renders, matching the hero's visual language (per-surface
  intensity families, bright window-frame returns, faint ground disc, coral
  scan-station marker). Deterministic — same seeds, same images.

  Usage: node scripts/generate-case-images.mjs
*/
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "public/cases";
const W = 1600;
const H = 1200;
mkdirSync(OUT, { recursive: true });

const DRAW = String.raw`
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (rng, s) => (rng() + rng() + rng() - 1.5) * s * 2;

/* ---- geometry builders (world coords, y up) ---- */

// faces of a box minus the underside; holes are [u0,v0,u1,v1] per face key
function boxFaces({ pos: [px, py, pz], size: [sx, sy, sz] }, intensity, opts = {}) {
  const { top = true, holes = {} } = opts;
  const hx = sx / 2, hy = sy / 2, hz = sz / 2;
  const faces = [];
  for (const s of [1, -1]) {
    faces.push({
      area: sy * sz, intensity, holes: holes[s > 0 ? "px" : "nx"] ?? [],
      at: (u, v) => [px + s * hx, py - hy + v * sy, pz - hz + u * sz],
    });
    faces.push({
      area: sx * sy, intensity, holes: holes[s > 0 ? "pz" : "nz"] ?? [],
      at: (u, v) => [px - hx + u * sx, py - hy + v * sy, pz + s * hz],
    });
  }
  if (top) {
    faces.push({
      area: sx * sz, intensity: intensity * 0.8, holes: [],
      at: (u, v) => [px - hx + u * sx, py + hy, pz - hz + v * sz],
    });
  }
  return faces;
}

// a parallelogram patch (roof slopes, gable planes): origin + u·eu + v·ev
function patch(origin, eu, ev, intensity, triangle = false) {
  const len = (v) => Math.hypot(...v);
  return {
    area: len(eu) * len(ev) * (triangle ? 0.5 : 1), intensity, holes: [], triangle,
    at: (u, v) => {
      if (triangle && u + v > 1) { u = 1 - u; v = 1 - v; }
      return [
        origin[0] + eu[0] * u + ev[0] * v,
        origin[1] + eu[1] * u + ev[1] * v,
        origin[2] + eu[2] * u + ev[2] * v,
      ];
    },
  };
}

// windows on a ±Z or ±X face of a box: returns { holes, segments }
function windows(box, axis, s, cols, rows, w, h) {
  const [px, py, pz] = box.pos, [sx, sy, sz] = box.size;
  const holes = [], segments = [];
  const faceLen = axis === "z" ? sx : sz;
  const lo = (axis === "z" ? px - sx / 2 : pz - sz / 2);
  for (const c of cols) {
    for (const r of rows) {
      const u0 = (c - w / 2 - lo) / faceLen, u1 = (c + w / 2 - lo) / faceLen;
      const v0 = (r - h / 2 - (py - sy / 2)) / sy, v1 = (r + h / 2 - (py - sy / 2)) / sy;
      holes.push([u0, v0, u1, v1]);
      const plane = axis === "z" ? pz + s * (sz / 2) : px + s * (sx / 2);
      const P = (a, b) => (axis === "z" ? [a, b, plane] : [plane, b, a]);
      const corners = [P(c - w / 2, r - h / 2), P(c + w / 2, r - h / 2), P(c + w / 2, r + h / 2), P(c - w / 2, r + h / 2)];
      for (let k = 0; k < 4; k++) segments.push({ a: corners[k], b: corners[(k + 1) % 4], intensity: 1.35 });
    }
  }
  return { holes, segments };
}

const seg = (a, b, intensity) => ({ a, b, intensity });

// horizontal rectangle outline (parapets, base lines) at height y
function rectOutline(cx, cz, sx, sz, y, intensity) {
  const hx = sx / 2, hz = sz / 2;
  const c = [[cx - hx, y, cz - hz], [cx + hx, y, cz - hz], [cx + hx, y, cz + hz], [cx - hx, y, cz + hz]];
  return c.map((p, k) => seg(p, c[(k + 1) % 4], intensity));
}

/* ---- sampling + render ---- */

function samplePoints(def) {
  const rng = mulberry32(def.seed);
  const pts = [];
  const N = def.N;
  const nGround = Math.floor(N * 0.06);
  const nSeg = Math.floor(N * (def.segShare ?? 0.17));
  const nSurf = N - nGround - nSeg;

  const cumulative = [];
  let total = 0;
  for (const f of def.faces) { total += f.area; cumulative.push(total); }
  const pickFace = () => {
    const t = rng() * total;
    let lo = 0, hi = def.faces.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cumulative[m] < t) lo = m + 1; else hi = m; }
    return def.faces[lo];
  };

  const push = (x, y, z, i) => {
    const n = 0.05;
    pts.push([x + gauss(rng, n), y + gauss(rng, n), z + gauss(rng, n), i * (0.85 + rng() * 0.3)]);
  };

  for (let g = 0; g < nGround; g++) {
    const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * def.groundR + 1.5;
    push(def.groundC[0] + Math.cos(a) * r, 0, def.groundC[1] + Math.sin(a) * r, 0.2);
  }

  const segTotal = def.segments.reduce((s, g) => s + Math.hypot(g.b[0] - g.a[0], g.b[1] - g.a[1], g.b[2] - g.a[2]), 0);
  for (const g of def.segments) {
    const len = Math.hypot(g.b[0] - g.a[0], g.b[1] - g.a[1], g.b[2] - g.a[2]);
    const n = Math.max(2, Math.round((len / segTotal) * nSeg));
    for (let k = 0; k < n; k++) {
      const t = rng();
      push(g.a[0] + (g.b[0] - g.a[0]) * t, g.a[1] + (g.b[1] - g.a[1]) * t, g.a[2] + (g.b[2] - g.a[2]) * t, g.intensity);
    }
  }

  for (let s = 0; s < nSurf; s++) {
    const f = pickFace();
    let u = rng(), v = rng(), ok = true;
    for (let tries = 0; tries < 8; tries++) {
      ok = !f.holes.some(([u0, v0, u1, v1]) => u > u0 && u < u1 && v > v0 && v < v1);
      if (ok) break;
      u = rng(); v = rng();
    }
    if (!ok) continue;
    const [x, y, z] = f.at(u, v);
    push(x, y, z, f.intensity);
  }
  return pts;
}

function render(canvas, def) {
  const ctx = canvas.getContext("2d");
  const cw = canvas.width, ch = canvas.height;

  // ground + survey grid
  ctx.fillStyle = "#05090f";
  ctx.fillRect(0, 0, cw, ch);
  ctx.strokeStyle = "rgba(26,40,54,0.55)";
  ctx.lineWidth = 1;
  for (let x = 0.5; x < cw; x += 96) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke(); }
  for (let y = 0.5; y < ch; y += 96) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke(); }

  const pts = samplePoints(def);
  const cos = Math.cos(def.theta), sin = Math.sin(def.theta);
  const proj = pts.map(([x, y, z, i]) => {
    const rx = x * cos - z * sin, rz = x * sin + z * cos;
    return { sx: (rx - rz) * 0.72, sy: -y * 0.82 + (rx + rz) * 0.22, d: rx + rz, i };
  });

  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minD = 1e9, maxD = -1e9;
  for (const p of proj) {
    if (p.sx < minX) minX = p.sx; if (p.sx > maxX) maxX = p.sx;
    if (p.sy < minY) minY = p.sy; if (p.sy > maxY) maxY = p.sy;
    if (p.d < minD) minD = p.d; if (p.d > maxD) maxD = p.d;
  }
  const margin = 120;
  const scale = Math.min((cw - margin * 2) / (maxX - minX), (ch - margin * 2) / (maxY - minY));
  const ox = (cw - (maxX - minX) * scale) / 2 - minX * scale;
  const oy = (ch - (maxY - minY) * scale) / 2 - minY * scale;

  proj.sort((a, b) => a.d - b.d);
  ctx.globalCompositeOperation = "lighter";
  for (const p of proj) {
    const dn = (p.d - minD) / (maxD - minD);
    const t = Math.min(1, p.i);
    const bright = p.i > 1.05;
    const r = bright ? 127 : 0;
    const g = bright ? 212 : Math.round(80 + 94 * t);
    const b = bright ? 245 : Math.round(120 + 119 * t);
    const alpha = (0.2 + 0.5 * Math.min(p.i, 1.3) / 1.3) * (0.5 + 0.5 * dn);
    const size = (1.15 + 1.15 * dn) * (bright ? 1.3 : 1);
    ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + alpha.toFixed(3) + ")";
    ctx.fillRect(p.sx * scale + ox - size / 2, p.sy * scale + oy - size / 2, size, size);
  }

  // scan-station marker on the ground, in coral
  ctx.globalCompositeOperation = "source-over";
  const [mx, mz] = def.station;
  const rx = mx * cos - mz * sin, rz = mx * sin + mz * cos;
  const px = ((rx - rz) * 0.72) * scale + ox;
  const py = (0 + (rx + rz) * 0.22) * scale + oy;
  ctx.strokeStyle = "rgba(213,43,30,0.95)";
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI * 2); ctx.stroke();
  for (const [dx1, dy1, dx2, dy2] of [[0, -24, 0, -9], [0, 9, 0, 24], [-24, 0, -9, 0], [9, 0, 24, 0]]) {
    ctx.beginPath(); ctx.moveTo(px + dx1, py + dy1); ctx.lineTo(px + dx2, py + dy2); ctx.stroke();
  }
}

/* ---- the three buildings ---- */

function residentialSlab() {
  const main = { pos: [0, 7.5, 0], size: [26, 15, 10] };
  const cols = [-11, -7.33, -3.67, 0, 3.67, 7.33, 11];
  const rows = [2.5, 5.3, 8.1, 10.9, 13.7];
  const front = windows(main, "z", 1, cols, rows, 2.1, 1.6);
  const back = windows(main, "z", -1, cols, rows, 2.1, 1.6);
  const side = windows(main, "x", 1, [-2.5, 2.5], rows, 1.5, 1.6);
  const faces = [
    ...boxFaces(main, 1.0, { holes: { pz: front.holes, nz: back.holes, px: side.holes } }),
    ...boxFaces({ pos: [-8, 2.0, 5.6], size: [4.2, 0.35, 1.8] }, 0.8),
    ...boxFaces({ pos: [6, 15.7, -1], size: [3.2, 1.4, 2.6] }, 0.62),
  ];
  const segments = [
    ...front.segments, ...back.segments, ...side.segments,
    ...rectOutline(0, 0, 26, 10, 15, 1.2),
    ...[3.95, 6.85, 9.75, 12.65].flatMap((y) => [
      seg([-13, y, 5], [13, y, 5], 0.7),
      seg([13, y, -5], [13, y, 5], 0.7),
    ]),
  ];
  return { seed: 101, theta: -0.5, N: 24000, segShare: 0.3, faces, segments, groundR: 17, groundC: [0, 0], station: [8, 13] };
}

function industrialHall() {
  const hall = { pos: [3, 4, 0], size: [30, 8, 16] };
  const annex = { pos: [-16, 2.75, 3], size: [8, 5.5, 10] };
  const cCols = [-9.5, -5, -0.5, 4, 8.5, 13];
  const clereF = windows(hall, "z", 1, cCols, [6.3], 3.0, 1.2);
  const clereB = windows(hall, "z", -1, cCols, [6.3], 3.0, 1.2);
  const gate = windows(hall, "x", 1, [0], [2.5], 4.8, 5.0);
  const annexWin = windows(annex, "z", 1, [-18.5, -16, -13.5], [1.6, 4.0], 1.6, 1.2);
  const faces = [
    ...boxFaces(hall, 1.0, { holes: { pz: clereF.holes, nz: clereB.holes, px: gate.holes } }),
    ...boxFaces(annex, 0.88, { holes: { pz: annexWin.holes } }),
  ];
  const segments = [
    ...clereF.segments, ...clereB.segments, ...gate.segments, ...annexWin.segments,
    ...rectOutline(3, 0, 30, 16, 8, 1.15),
    ...rectOutline(-16, 3, 8, 10, 5.5, 1.0),
    ...[-4, 0, 4].map((z) => seg([-11, 8.05, z], [17, 8.05, z], 1.1)),
  ];
  return { seed: 202, theta: -0.55, N: 17000, faces, segments, groundR: 21, groundC: [-2, 0], station: [-4, 14] };
}

function townhouse() {
  const body = { pos: [0, 5.5, 0], size: [9, 11, 13] };
  const front = windows(body, "z", 1, [-2.6, 0, 2.6], [3.2, 6.1, 9.0], 1.25, 1.7);
  const door = windows(body, "z", 1, [-2.2], [1.35], 1.5, 2.7);
  const side = windows(body, "x", 1, [-4.2, -1.4, 1.4, 4.2], [3.2, 6.1, 9.0], 1.25, 1.7);
  const ridgeY = 14.6, eaveY = 10.9, halfW = 4.9, halfD = 6.9;
  const faces = [
    ...boxFaces(body, 1.0, { top: false, holes: { pz: [...front.holes, ...door.holes], px: side.holes } }),
    // roof slopes eaves→ridge
    patch([-halfW, eaveY, -halfD], [halfW, ridgeY - eaveY, 0], [0, 0, halfD * 2], 0.78),
    patch([halfW, eaveY, -halfD], [-halfW, ridgeY - eaveY, 0], [0, 0, halfD * 2], 0.78),
    // gable triangles
    patch([-4.5, 11, 6.5], [9, 0, 0], [4.5, ridgeY - 11, 0], 1.0, true),
    patch([-4.5, 11, -6.5], [9, 0, 0], [4.5, ridgeY - 11, 0], 1.0, true),
  ];
  const segments = [
    ...front.segments, ...door.segments, ...side.segments,
    seg([0, ridgeY, -halfD], [0, ridgeY, halfD], 1.35),
    seg([-halfW, eaveY, -halfD], [-halfW, eaveY, halfD], 1.0),
    seg([halfW, eaveY, -halfD], [halfW, eaveY, halfD], 1.0),
    // gable rakes
    seg([-halfW, eaveY, 6.9], [0, ridgeY, 6.9], 1.15),
    seg([halfW, eaveY, 6.9], [0, ridgeY, 6.9], 1.15),
    seg([-halfW, eaveY, -6.9], [0, ridgeY, -6.9], 1.15),
    seg([halfW, eaveY, -6.9], [0, ridgeY, -6.9], 1.15),
  ];
  return { seed: 303, theta: 0.5, N: 15000, faces, segments, groundR: 11, groundC: [0, 0], station: [7, 9.5] };
}

window.BUILDINGS = { "case-01": residentialSlab(), "case-02": industrialHall(), "case-03": townhouse() };
window.renderCase = (id) => {
  const canvas = document.getElementById(id);
  render(canvas, window.BUILDINGS[id]);
};
`;

const html = `<!doctype html><body style="margin:0;background:#000">
<canvas id="case-01" width="${W}" height="${H}"></canvas>
<canvas id="case-02" width="${W}" height="${H}"></canvas>
<canvas id="case-03" width="${W}" height="${H}"></canvas>
<script>${DRAW}</script></body>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(html);
for (const id of ["case-01", "case-02", "case-03"]) {
  await page.evaluate((caseId) => window.renderCase(caseId), id);
  const el = await page.$(`#${id}`);
  await el.screenshot({ path: `${OUT}/${id}.png` });
  console.log(`rendered ${OUT}/${id}.png`);
}
await browser.close();
