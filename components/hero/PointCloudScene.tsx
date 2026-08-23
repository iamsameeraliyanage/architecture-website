"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, invalidate } from "@react-three/fiber";
import * as THREE from "three";
import { generatePoints, buildingEdges } from "./buildingPoints";
import ScanDrone, { type ScanState } from "./ScanDrone";
import SolidApartment from "./SolidApartment";

/*
  The page's single Three.js moment, as a ~20s loop that tells the actual
  Scan-to-BIM story: the solid apartment sits whole → the drone sweeps across
  and surfaces dissolve into point cloud right behind its beam → the cloud
  holds → the drone flies home → the front sweeps back and the building
  re-materialises. One shared uReveal uniform drives both the point shader and
  the solid dissolve, so the two worlds always agree on where the front is.
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

/* the loop, in seconds per phase — sums to TOTAL */
const DUR = { solid: 2.5, scan: 8, cloud: 4, ret: 2.5, restore: 2.5 } as const;
const TOTAL = DUR.solid + DUR.scan + DUR.cloud + DUR.ret + DUR.restore;
/* front x extents in apartment-local space: X_SOLID leaves every point
   unresolved (min aTarget.x − stagger ≈ −8.4); X_CLOUD resolves the farthest
   ground point (x ≈ 9.5 + 1.1 stagger + 1.8 band) and clears every solid face */
const X_SOLID = -9;
const X_CLOUD = 13;

/* per-theme scene palette: on dark ground the scan glows; on light it reads
   like blueprint ink on paper, with the beam as the darkest element */
const SCENE_COLORS = {
  dark: {
    dim: "#1d3345", resolved: "#4fc3f7", beam: "#c9ecff", wire: "#2a6ea3",
    drone: "#9fb6c9", droneAccent: "#ff5a4d",
  },
  /* re-picked against the tinted light ground (#e6ecf2): every element has to
     sit DARKER than the paper, or the scan reads as a white-on-white ghost */
  light: {
    dim: "#a4b8c8", resolved: "#0d6ea8", beam: "#0b3b60", wire: "#7e9db6",
    drone: "#3a5c76", droneAccent: "#b31d10",
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
  // loopT wraps and drives the phase machine; animT never wraps and drives
  // jitter/drift, so nothing hitches at the loop seam. Both accumulate delta:
  // the r3f clock keeps running while the demand-mode canvas is paused
  // offscreen, so elapsedTime would jump phases on scroll-back.
  const loopT = useRef(0);
  const animT = useRef(0);
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
        uReveal: { value: X_SOLID },
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

  useFrame((state, delta) => {
    material.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    if (!animated) return;

    // clamp so a paused-offscreen resume can't jump phases
    const dt = Math.min(delta, 0.05);
    animT.current += dt;
    loopT.current = (loopT.current + dt) % TOTAL;
    const t = loopT.current;
    material.uniforms.uTime.value = animT.current;

    let reveal = X_SOLID;
    let beam = -999;
    let lineO = 0;

    if (t < DUR.solid) {
      // SOLID HOLD — the building sits whole, drone parked at the start
      scan.current.active = false;
      scan.current.p = 0;
    } else if (t < DUR.solid + DUR.scan) {
      // SCAN — the front tracks the drone; solids dissolve, points resolve
      const p = (t - DUR.solid) / DUR.scan;
      reveal = THREE.MathUtils.lerp(X_SOLID, X_CLOUD, p);
      beam = reveal;
      scan.current.active = true;
      scan.current.p = p;
      lineO = THREE.MathUtils.smoothstep(p, 0.85, 1) * 0.35;
    } else if (t < DUR.solid + DUR.scan + DUR.cloud) {
      // CLOUD HOLD — today's resolved look; drone hovers at the far end
      reveal = X_CLOUD;
      scan.current.active = true;
      scan.current.p = 1;
      lineO = 0.35;
    } else if (t < TOTAL - DUR.restore) {
      // RETURN — drone flies home, lasers fade (ScanDrone handles both)
      reveal = X_CLOUD;
      scan.current.active = false;
      lineO = 0.35;
    } else {
      // RESTORE — the front sweeps back; the building re-materialises
      const p = (t - (TOTAL - DUR.restore)) / DUR.restore;
      const e = p * p * (3 - 2 * p);
      reveal = THREE.MathUtils.lerp(X_CLOUD, X_SOLID, e);
      scan.current.active = false;
      lineO = 0.35 * (1 - e);
    }

    material.uniforms.uReveal.value = reveal;
    material.uniforms.uBeam.value = beam;
    lineMaterial.opacity = lineO;

    // slow authored drift + gentle pointer parallax
    if (group.current) {
      const targetY = -0.3 + Math.sin(animT.current * 0.05) * 0.06 + pointer.x * 0.05;
      const targetX = pointer.y * 0.02;
      group.current.rotation.y += (targetY - group.current.rotation.y) * 0.04;
      group.current.rotation.x += (targetX - group.current.rotation.x) * 0.04;
    }
  });

  return (
    <group ref={group} position={[0.3, -1.0, 0]} scale={0.56}>
      {/* lights touch only the solid apartment — points, lines and the drone
          are all shader/basic materials that ignore them */}
      {/* light mode used to run hot (1.5/1.5), which blew the solid to near-white
          against the paper ground — dial it back so the building keeps its form */}
      <ambientLight intensity={theme === "light" ? 0.95 : 0.95} />
      <directionalLight position={[9, 16, 7]} intensity={theme === "light" ? 1.05 : 1.9} />
      <directionalLight position={[-11, 7, -6]} intensity={0.5} color="#7fd4f5" />
      <SolidApartment
        reveal={material.uniforms.uReveal as { value: number }}
        animated={animated}
        theme={theme}
      />
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
