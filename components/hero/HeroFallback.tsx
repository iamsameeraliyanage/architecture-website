import { BUILDING } from "./buildingPoints";

/*
  Static drawing standing in for the WebGL scene: the same building massing
  as a dotted survey wireframe. Server-renderable, zero JS, theme-aware via
  tokens. Positioned by its parent (the container-aligned hero stage) and
  faded out once the live canvas is ready — so there is no layout shift.
*/

function project([x, y, z]: number[]): [number, number] {
  // simple axonometric projection matching the 3D camera's general view
  const sx = (x - z) * 0.72;
  const sy = -y * 0.82 + (x + z) * 0.22;
  return [sx * 16 + 330, sy * 16 + 330];
}

function line(a: number[], b: number[]) {
  const [x1, y1] = project(a);
  const [x2, y2] = project(b);
  return { x1, y1, x2, y2 };
}

export default function HeroFallback({ dimmed = false }: { dimmed?: boolean }) {
  const { W, D, H, RIDGE } = BUILDING;
  const hw = W / 2;
  const hd = D / 2;
  // prettier-ignore
  const v = {
    a: [-hw, 0, hd], b: [hw, 0, hd], c: [hw, 0, -hd], d: [-hw, 0, -hd],
    e: [-hw, H, hd], f: [hw, H, hd], g: [hw, H, -hd], h: [-hw, H, -hd],
    r1: [-hw, RIDGE, 0], r2: [hw, RIDGE, 0],
  };
  const edges: Array<[number[], number[]]> = [
    [v.a, v.b], [v.b, v.c], [v.d, v.a],
    [v.a, v.e], [v.b, v.f], [v.c, v.g], [v.d, v.h],
    [v.e, v.f], [v.f, v.g], [v.g, v.h], [v.h, v.e],
    [v.e, v.r1], [v.h, v.r1], [v.f, v.r2], [v.g, v.r2],
    [v.r1, v.r2],
  ];

  return (
    <svg
      viewBox="0 0 660 560"
      aria-hidden="true"
      className={`absolute left-1/2 top-1/2 h-[78%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ${
        dimmed ? "opacity-0" : "opacity-70"
      }`}
    >
      {edges.map(([a, b], i) => {
        const { x1, y1, x2, y2 } = line(a, b);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--color-cerulean)"
            strokeWidth="1.5"
            strokeDasharray="0.1 7"
            strokeLinecap="round"
            opacity="0.75"
          />
        );
      })}
      {/* scan station marker on the ground */}
      <g transform="translate(150, 470)" stroke="var(--color-coral)" fill="none" strokeWidth="1.5">
        <circle r="10" />
        <line x1="0" y1="-16" x2="0" y2="-6" />
        <line x1="0" y1="6" x2="0" y2="16" />
        <line x1="-16" y1="0" x2="-6" y2="0" />
        <line x1="6" y1="0" x2="16" y2="0" />
      </g>
    </svg>
  );
}
