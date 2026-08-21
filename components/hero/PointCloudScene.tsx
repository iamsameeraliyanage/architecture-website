"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, invalidate } from "@react-three/fiber";
import * as THREE from "three";
import { generatePoints, buildingEdges } from "./buildingPoints";
import ScanDrone, { type ScanState } from "./ScanDrone";

/*
  The page's single Three.js moment: scattered scan points resolve into a
  building as a scan front passes through them, then a beam keeps sweeping.
  One draw call for the cloud, one for the resolved wireframe.
*/

const VERT = /* glsl */ `
  attribute vec3 aTarget;
  attribute float aRand;
  attribute float aInt;
  uniform float uReveal;     // world-x position of the resolving scan front
  uniform float uBeam;       // world-x position of the looping beam
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vResolve;
  varying float vBeam;
  varying float vDim;

  void main() {
    vDim = aInt;
    float front = uReveal - aRand * 1.1;
    float e = clamp((front - aTarget.x) / 1.8, 0.0, 1.0);
    e = e * e * (3.0 - 2.0 * e);

    vec3 pos = mix(position, aTarget, e);
    pos += (1.0 - e) * 0.16 * vec3(
      sin(uTime * 0.7 + aRand * 43.0),
      cos(uTime * 0.5 + aRand * 29.0),
      sin(uTime * 0.6 + aRand * 17.0)
    );

    vResolve = e;
    vBeam = smoothstep(0.5, 0.0, abs(pos.x - uBeam)) * e;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.9 + 0.9 * e + 0.6 * vBeam) * uPixelRatio * (36.0 / -mv.z);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColorDim;
  uniform vec3 uColorResolved;
  uniform vec3 uColorBeam;
  varying float vResolve;
  varying float vBeam;
  varying float vDim;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    vec3 col = mix(uColorDim, uColorResolved, vResolve * min(vDim, 1.0));
    col = mix(col, uColorBeam, vBeam * 0.7);
    float alpha = (0.2 + 0.68 * vResolve) * min(vDim, 1.2);
    gl_FragColor = vec4(col * vDim, alpha);
  }
`;

const REVEAL_START = -9;
const REVEAL_SPEED = 7.2; // world units / second for the first pass
const REVEAL_END = 10;
const BEAM_PERIOD = 9; // seconds per beam cycle after the first pass

/* per-theme scene palette: on dark ground the scan glows; on light it reads
   like blueprint ink on paper, with the beam as the darkest element */
const SCENE_COLORS = {
  dark: {
    dim: "#1d3345", resolved: "#4fc3f7", beam: "#c9ecff", wire: "#2a6ea3",
    drone: "#9fb6c9", droneAccent: "#ff5a4d",
  },
  light: {
    dim: "#c3d3de", resolved: "#1273ad", beam: "#0b3b60", wire: "#9cb9cd",
    drone: "#41637d", droneAccent: "#c22315",
  },
} as const;

type SceneTheme = keyof typeof SCENE_COLORS;

function Cloud({
  count,
  animated,
  theme,
}: {
  count: number;
  animated: boolean;
  theme: SceneTheme;
}) {
  const points = useRef<THREE.Points>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const group = useRef<THREE.Group>(null);
  // written here each frame, read by the drone so its flight matches the beam
  const scan = useRef<ScanState>({ p: 0, active: false });
  const { camera, pointer } = useThree();

  const { geometry, material, lineGeometry, lineMaterial } = useMemo(() => {
    const { targets, starts, rands, intensities } = generatePoints(count);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(starts, 3));
    geometry.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
    geometry.setAttribute("aRand", new THREE.BufferAttribute(rands, 1));
    geometry.setAttribute("aInt", new THREE.BufferAttribute(intensities, 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 3, 0), 24);

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uReveal: { value: REVEAL_START },
        uBeam: { value: -999 },
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uColorDim: { value: new THREE.Color("#1d3345") },
        uColorResolved: { value: new THREE.Color("#4fc3f7") },
        uColorBeam: { value: new THREE.Color("#c9ecff") },
      },
    });

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(buildingEdges()), 3),
    );
    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color("#2a6ea3"),
      transparent: true,
      opacity: 0,
    });

    return { geometry, material, lineGeometry, lineMaterial };
  }, [count]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, [geometry, material, lineGeometry, lineMaterial]);

  useEffect(() => {
    camera.position.set(12.5, 4.2, 15.5);
    camera.lookAt(0, 2.7, 0);
  }, [camera]);

  // follow the site theme; additive glow only works against a dark ground
  useEffect(() => {
    const colors = SCENE_COLORS[theme];
    (material.uniforms.uColorDim.value as THREE.Color).set(colors.dim);
    (material.uniforms.uColorResolved.value as THREE.Color).set(colors.resolved);
    (material.uniforms.uColorBeam.value as THREE.Color).set(colors.beam);
    material.blending = theme === "light" ? THREE.NormalBlending : THREE.AdditiveBlending;
    material.needsUpdate = true;
    lineMaterial.color.set(colors.wire);
    invalidate();
  }, [theme, material, lineMaterial]);

  // Static frame for reduced-motion / non-animated mode
  useEffect(() => {
    if (!animated) {
      material.uniforms.uReveal.value = 999;
      material.uniforms.uBeam.value = -999;
      scan.current = { p: 0.42, active: false };
      lineMaterial.opacity = 0.35;
      if (group.current) group.current.rotation.y = -0.3;
      invalidate();
    }
  }, [animated, material, lineMaterial]);

  useFrame((state) => {
    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    if (!animated) return;

    const t = state.clock.elapsedTime;
    material.uniforms.uTime.value = t;

    // first pass: the scan front resolves the building left → right
    const firstPassDuration = (REVEAL_END - REVEAL_START) / REVEAL_SPEED;
    const reveal = REVEAL_START + Math.min(t, firstPassDuration) * REVEAL_SPEED;
    material.uniforms.uReveal.value = t < firstPassDuration ? reveal : 999;

    // beam: rides the front during the first pass, then loops with a rest phase
    if (t < firstPassDuration) {
      material.uniforms.uBeam.value = reveal;
    } else {
      const cycle = ((t - firstPassDuration) % BEAM_PERIOD) / BEAM_PERIOD;
      material.uniforms.uBeam.value =
        cycle < 0.62 ? REVEAL_START + (cycle / 0.62) * (REVEAL_END - REVEAL_START) : -999;
    }

    const beamX = material.uniforms.uBeam.value as number;
    scan.current.active = beamX > -900;
    if (scan.current.active) {
      scan.current.p = (beamX - REVEAL_START) / (REVEAL_END - REVEAL_START);
    }

    // wireframe fades in as the first pass completes
    const lineIn = THREE.MathUtils.clamp((t - firstPassDuration + 0.6) / 1.6, 0, 1);
    lineMaterial.opacity = lineIn * 0.35;

    // slow authored drift + gentle pointer parallax
    if (group.current) {
      const targetY = -0.3 + Math.sin(t * 0.05) * 0.06 + pointer.x * 0.05;
      const targetX = pointer.y * 0.02;
      group.current.rotation.y += (targetY - group.current.rotation.y) * 0.04;
      group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
    }
  });

  return (
    <group ref={group} position={[0.3, -1.0, 0]} scale={0.56}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
      <lineSegments ref={lines} geometry={lineGeometry} material={lineMaterial} />
      <ScanDrone
        scan={scan}
        animated={animated}
        additive={theme !== "light"}
        colors={{
          body: SCENE_COLORS[theme].drone,
          accent: SCENE_COLORS[theme].droneAccent,
          beam: SCENE_COLORS[theme].beam,
        }}
      />
    </group>
  );
}

export default function PointCloudScene({
  count,
  animated,
  active,
  theme = "dark",
  onReady,
}: {
  count: number;
  animated: boolean;
  active: boolean;
  theme?: SceneTheme;
  onReady?: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={animated && active ? "always" : "demand"}
      camera={{ fov: 42, near: 0.1, far: 80 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
      className="absolute! inset-0!"
      aria-hidden="true"
    >
      <Cloud count={count} animated={animated} theme={theme} />
    </Canvas>
  );
}
