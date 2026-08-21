"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  type Box,
  edgesFor,
  ceilingSlab,
  exteriorWalls,
  floorSlab,
  furniture,
  glazing,
  interiorWalls,
  structure,
} from "./apartmentModel";
import {
  samplePointCloud,
  dimensionLines,
  qcTicks,
  qcFlag,
  sheetPanel,
  planPoche,
  planInk,
  planDimensions,
  sheetFrame,
} from "./apartmentLayers";

/*
  The hero orbit. Scroll drives one full turn around the apartment, and the
  turn is what changes the drawing: furnished home → BIM model → structural
  frame → BIM model → home. Because the sequence is keyed to the angle and
  both ends are the same state, 0° and 360° are the identical frame — the loop
  closes exactly, which a generated video can't promise.

  Every element group exists once. A quarter-turn doesn't swap geometry, it
  re-reads the same geometry with different opacity and colour, so the column
  in the structural pass is provably the pier from the architectural pass.
*/

/**
 * One state per pipeline stage, in ST-01…ST-05 order. The scroll that advances
 * the stage text advances this too, so the drawing beside a stage is always
 * that stage's own output.
 */
const STAGES = ["capture", "cloud", "bim", "qc", "delivery"] as const;
type StageKey = (typeof STAGES)[number];
type Weights = Record<StageKey, number>;

const ZERO: Weights = { capture: 0, cloud: 0, bim: 0, qc: 0, delivery: 0 };

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Hold each stage through most of its segment, then morph quickly — a straight
 * crossfade would leave every boundary as an unreadable 50/50 double image.
 */
function stageWeights(progress: number): Weights {
  const p = THREE.MathUtils.clamp(progress, 0, 1) * (STAGES.length - 1);
  const seg = Math.min(STAGES.length - 2, Math.floor(p));
  const t = smoothstep(0.45, 0.95, p - seg);
  const w: Weights = { ...ZERO };
  w[STAGES[seg]] += 1 - t;
  w[STAGES[seg + 1]] += t;
  return w;
}

type Five<T> = [T, T, T, T, T];
type GroupStyle = {
  /** opacity contribution per stage */
  o: Five<number>;
  colors: Five<string>;
};

/* dark ground: the scan/blueprint register. light: ink on paper. */
const PALETTE = {
  dark: {
    walls:       { o: [1, 0.05, 0.22, 0.18, 0],    colors: ["#8c98a6", "#1a2836", "#2f7fb8", "#2f7fb8", "#1a2836"] },
    furniture:   { o: [1, 0.04, 0.08, 0.06, 0],    colors: ["#8a7f70", "#1a2836", "#2b6f9e", "#2b6f9e", "#1a2836"] },
    glazing:     { o: [0.34, 0.03, 0.16, 0.12, 0], colors: ["#9fd8f2", "#7fd4f5", "#7fd4f5", "#7fd4f5", "#7fd4f5"] },
    structure:   { o: [0, 0.05, 0.5, 0.44, 0],     colors: ["#4a5c6e", "#1d3345", "#00aeef", "#00aeef", "#1a2836"] },
    floor:       { o: [1, 0.06, 0.3, 0.24, 0],     colors: ["#6b6055", "#1d3345", "#256d9e", "#256d9e", "#1a2836"] },
    ceiling:     { o: [0, 0, 0.1, 0.08, 0],        colors: ["#5d6b7a", "#1d3345", "#256d9e", "#256d9e", "#1a2836"] },
    wallEdges:   { o: [0.12, 0.14, 1, 0.92, 0],    colors: ["#7fd4f5", "#4fc3f7", "#7fd4f5", "#7fd4f5", "#7fd4f5"] },
    structEdges: { o: [0, 0.06, 0.42, 0.38, 0],    colors: ["#00aeef", "#4fc3f7", "#7fd4f5", "#7fd4f5", "#7fd4f5"] },
    cloud:       { o: [0.16, 1, 0.1, 0.06, 0],     colors: ["#4fc3f7", "#4fc3f7", "#7fd4f5", "#7fd4f5", "#4fc3f7"] },
    dims:        { o: [0, 0, 1, 0.7, 0],           colors: ["#c9ecff", "#c9ecff", "#c9ecff", "#9fb6c9", "#c9ecff"] },
    qcTick:      { o: [0, 0, 0, 1, 0],             colors: ["#4fc3f7", "#4fc3f7", "#4fc3f7", "#5ce0a8", "#4fc3f7"] },
    qcFlag:      { o: [0, 0, 0, 1, 0],             colors: ["#ff5a4d", "#ff5a4d", "#ff5a4d", "#ff5a4d", "#ff5a4d"] },
    paper:       { o: [0, 0, 0, 0, 0.92],          colors: ["#12202e", "#12202e", "#12202e", "#12202e", "#12202e"] },
    poche:       { o: [0, 0, 0, 0, 1],             colors: ["#7fd4f5", "#7fd4f5", "#7fd4f5", "#7fd4f5", "#7fd4f5"] },
    planInk:     { o: [0, 0, 0, 0, 1],             colors: ["#c9ecff", "#c9ecff", "#c9ecff", "#c9ecff", "#c9ecff"] },
    planDims:    { o: [0, 0, 0, 0, 0.85],          colors: ["#9fd8f2", "#9fd8f2", "#9fd8f2", "#9fd8f2", "#9fd8f2"] },
    sheetFrame:  { o: [0, 0, 0, 0, 0.42],          colors: ["#2f7fb8", "#2f7fb8", "#2f7fb8", "#2f7fb8", "#2f7fb8"] },
  },
  light: {
    walls:       { o: [1, 0.05, 0.2, 0.16, 0],     colors: ["#c7d0d8", "#d5dde4", "#7fb0d0", "#7fb0d0", "#d5dde4"] },
    furniture:   { o: [1, 0.04, 0.08, 0.06, 0],    colors: ["#b8ab99", "#d5dde4", "#8fb8d4", "#8fb8d4", "#d5dde4"] },
    glazing:     { o: [0.3, 0.03, 0.14, 0.1, 0],   colors: ["#cfeaf8", "#a9d8ef", "#a9d8ef", "#a9d8ef", "#a9d8ef"] },
    structure:   { o: [0, 0.05, 0.48, 0.42, 0],    colors: ["#9aa8b4", "#c3d3de", "#0077b3", "#0077b3", "#d5dde4"] },
    floor:       { o: [1, 0.06, 0.28, 0.22, 0],    colors: ["#c2b6a5", "#c3d3de", "#8ab4d2", "#8ab4d2", "#d5dde4"] },
    ceiling:     { o: [0, 0, 0.1, 0.08, 0],        colors: ["#b6c2cd", "#c3d3de", "#8ab4d2", "#8ab4d2", "#d5dde4"] },
    wallEdges:   { o: [0.12, 0.14, 1, 0.92, 0],    colors: ["#0b3b60", "#1273ad", "#0b3b60", "#0b3b60", "#0b3b60"] },
    structEdges: { o: [0, 0.06, 0.4, 0.36, 0],     colors: ["#0077b3", "#1273ad", "#0b3b60", "#0b3b60", "#0b3b60"] },
    cloud:       { o: [0.16, 1, 0.1, 0.06, 0],     colors: ["#1273ad", "#1273ad", "#0b3b60", "#0b3b60", "#1273ad"] },
    dims:        { o: [0, 0, 1, 0.7, 0],           colors: ["#0b3b60", "#0b3b60", "#0b3b60", "#6b7680", "#0b3b60"] },
    qcTick:      { o: [0, 0, 0, 1, 0],             colors: ["#1273ad", "#1273ad", "#1273ad", "#12855c", "#1273ad"] },
    qcFlag:      { o: [0, 0, 0, 1, 0],             colors: ["#c22315", "#c22315", "#c22315", "#c22315", "#c22315"] },
    paper:       { o: [0, 0, 0, 0, 1],             colors: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"] },
    poche:       { o: [0, 0, 0, 0, 1],             colors: ["#0b3b60", "#0b3b60", "#0b3b60", "#0b3b60", "#0b3b60"] },
    planInk:     { o: [0, 0, 0, 0, 1],             colors: ["#0b3b60", "#0b3b60", "#0b3b60", "#0b3b60", "#0b3b60"] },
    planDims:    { o: [0, 0, 0, 0, 0.85],          colors: ["#1273ad", "#1273ad", "#1273ad", "#1273ad", "#1273ad"] },
    sheetFrame:  { o: [0, 0, 0, 0, 0.5],           colors: ["#8fa5b8", "#8fa5b8", "#8fa5b8", "#8fa5b8", "#8fa5b8"] },
  },
} as const;

type SceneTheme = keyof typeof PALETTE;
type GroupKey = keyof (typeof PALETTE)["dark"];

/** Blend the per-stage colours by weight; weights always sum to 1. */
function applyStyle(
  material: THREE.Material & { color: THREE.Color; opacity: number },
  style: GroupStyle,
  w: Weights,
  scratch: THREE.Color,
) {
  let opacity = 0;
  for (let i = 0; i < STAGES.length; i++) opacity += style.o[i] * w[STAGES[i]];
  material.opacity = opacity;
  material.visible = opacity > 0.004;
  material.depthWrite = opacity > 0.92;

  material.color.setRGB(0, 0, 0);
  for (let i = 0; i < STAGES.length; i++) {
    const weight = w[STAGES[i]];
    if (weight <= 0) continue;
    scratch.set(style.colors[i]).multiplyScalar(weight);
    material.color.add(scratch);
  }
}

function instanced(boxes: Box[], material: THREE.Material) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.InstancedMesh(geometry, material, boxes.length);
  const m = new THREE.Matrix4();
  boxes.forEach((b, i) => {
    m.compose(
      new THREE.Vector3(...b.pos),
      new THREE.Quaternion(),
      new THREE.Vector3(...b.size),
    );
    mesh.setMatrixAt(i, m);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  return mesh;
}

function points(verts: Float32Array, material: THREE.Material) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  const p = new THREE.Points(g, material);
  p.frustumCulled = false;
  return p;
}

function lines(verts: Float32Array, material: THREE.Material) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  const l = new THREE.LineSegments(g, material);
  l.frustumCulled = false;
  return l;
}

const ORBIT_RADIUS = 23;
const ORBIT_HEIGHT = 12.5;
const ORBIT_LIFT = 2.6; // extra elevation at the half-turn, back to 0 at both ends
const TARGET = new THREE.Vector3(0, 1.4, 0);

function Apartment({
  progressRef,
  theme,
}: {
  progressRef: React.MutableRefObject<number>;
  theme: SceneTheme;
}) {
  const { camera } = useThree();
  const scratch = useMemo(() => new THREE.Color(), []);
  const applied = useRef(-1);

  const built = useMemo(() => {
    const mat = (opts?: THREE.MeshStandardMaterialParameters) =>
      new THREE.MeshStandardMaterial({
        transparent: true,
        roughness: 0.85,
        metalness: 0,
        side: THREE.DoubleSide,
        ...opts,
      });

    const wallBoxes = [...exteriorWalls(), ...interiorWalls()];
    const structBoxes = structure();

    const materials: Record<GroupKey, THREE.Material & { color: THREE.Color; opacity: number }> = {
      walls: mat(),
      furniture: mat({ roughness: 0.95 }),
      glazing: mat({ roughness: 0.12, metalness: 0.1 }),
      structure: mat({ roughness: 0.6 }),
      floor: mat(),
      ceiling: mat(),
      wallEdges: new THREE.LineBasicMaterial({ transparent: true }),
      structEdges: new THREE.LineBasicMaterial({ transparent: true }),
      cloud: new THREE.PointsMaterial({
        size: 0.075,
        transparent: true,
        depthWrite: false,
        sizeAttenuation: true,
      }),
      dims: new THREE.LineBasicMaterial({ transparent: true }),
      qcTick: new THREE.LineBasicMaterial({ transparent: true }),
      qcFlag: new THREE.LineBasicMaterial({ transparent: true }),
      paper: mat({ roughness: 0.98 }),
      poche: mat({ roughness: 0.9 }),
      planInk: new THREE.LineBasicMaterial({ transparent: true }),
      planDims: new THREE.LineBasicMaterial({ transparent: true }),
      sheetFrame: new THREE.LineBasicMaterial({ transparent: true }),
    };

    const objects = [
      instanced(wallBoxes, materials.walls),
      instanced(furniture(), materials.furniture),
      instanced(glazing(), materials.glazing),
      instanced(structBoxes, materials.structure),
      instanced(floorSlab(), materials.floor),
      instanced(ceilingSlab(), materials.ceiling),
      lines(edgesFor(wallBoxes), materials.wallEdges),
      lines(edgesFor(structBoxes), materials.structEdges),
      points(samplePointCloud(7000), materials.cloud),
      lines(dimensionLines(), materials.dims),
      lines(qcTicks(), materials.qcTick),
      lines(qcFlag(), materials.qcFlag),
      instanced(sheetPanel(), materials.paper),
      instanced(planPoche(), materials.poche),
      lines(planInk(), materials.planInk),
      lines(planDimensions(), materials.planDims),
      lines(sheetFrame(), materials.sheetFrame),
    ];

    return { materials, objects };
  }, []);

  useEffect(() => {
    const { materials, objects } = built;
    return () => {
      Object.values(materials).forEach((m) => m.dispose());
      objects.forEach((o) => o.geometry.dispose());
    };
  }, [built]);

  // re-apply on theme flip
  useEffect(() => {
    applied.current = -1;
  }, [theme]);

  useFrame(() => {
    const p = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    if (Math.abs(p - applied.current) < 0.0002) return;
    applied.current = p;

    const angle = p * Math.PI * 2;
    // periodic lift: 0 at both ends, so the closing frame matches the opening
    const lift = (ORBIT_LIFT * (1 - Math.cos(angle))) / 2;
    camera.position.set(
      Math.sin(angle) * ORBIT_RADIUS,
      ORBIT_HEIGHT + lift,
      Math.cos(angle) * ORBIT_RADIUS,
    );
    camera.lookAt(TARGET);

    const w = stageWeights(p);
    const palette = PALETTE[theme];
    (Object.keys(palette) as GroupKey[]).forEach((key) => {
      applyStyle(built.materials[key], palette[key] as GroupStyle, w, scratch);
    });
  });

  return (
    <>
      <ambientLight intensity={theme === "light" ? 1.5 : 0.95} />
      <directionalLight position={[9, 16, 7]} intensity={theme === "light" ? 1.5 : 1.9} />
      <directionalLight position={[-11, 7, -6]} intensity={0.5} color="#7fd4f5" />
      <group>
        {built.objects.map((o, i) => (
          <primitive key={i} object={o} />
        ))}
      </group>
    </>
  );
}

export default function ApartmentOrbitScene({
  progressRef,
  theme = "dark",
  onReady,
}: {
  progressRef: React.MutableRefObject<number>;
  theme?: SceneTheme;
  onReady?: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop="demand"
      camera={{ fov: 38, near: 0.1, far: 260, position: [0, ORBIT_HEIGHT, ORBIT_RADIUS] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
      className="absolute! inset-0!"
      aria-hidden="true"
    >
      <Apartment progressRef={progressRef} theme={theme} />
    </Canvas>
  );
}
