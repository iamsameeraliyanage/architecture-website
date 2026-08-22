"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, invalidate } from "@react-three/fiber";
import * as THREE from "three";
import {
  exteriorWalls,
  interiorWalls,
  glazing,
  furniture,
  floorSlab,
  ceilingSlab,
  type Box,
} from "./apartmentModel";

/*
  The apartment as built matter — the thing the drone is scanning. Same box
  lists the pipeline orbit renders, but here every material carries a dissolve:
  fragments behind the scan front (the cloud shader's uReveal, passed in as the
  same live uniform object) are discarded through a screen-space dither, so the
  building crumbles into the resolving point cloud right at the beam and
  re-materialises when the front sweeps home. Discard keeps the solids opaque —
  no sorting fights with the additive points; only the glazing blends.
*/

/** Softness of the dissolve band, in apartment-local x units. */
const FRONT_WIDTH = 2.5;
/** Beyond the last solid face + band — everything discarded, skip the draws. */
const X_GONE = 10;

const SOLID_PALETTE = {
  dark: {
    walls: "#8c98a6",
    furniture: "#8a7f70",
    glazing: "#9fd8f2",
    floor: "#6b6055",
    ceiling: "#5d6b7a",
  },
  light: {
    walls: "#c7d0d8",
    furniture: "#b8ab99",
    glazing: "#cfeaf8",
    floor: "#c2b6a5",
    ceiling: "#b6c2cd",
  },
} as const;

type SolidTheme = keyof typeof SOLID_PALETTE;
type SolidKey = keyof (typeof SOLID_PALETTE)["dark"];

/** Inject the scan-front dissolve; `reveal` is shared with the point shader. */
function withDissolve(m: THREE.MeshStandardMaterial, reveal: { value: number }) {
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uScanReveal = reveal;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vScanLocal;")
      .replace(
        "#include <project_vertex>",
        /* glsl */ `
        vec4 scanP = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          scanP = instanceMatrix * scanP;
        #endif
        vScanLocal = scanP.xyz; // apartment-local — the same space as the cloud's aTarget
        #include <project_vertex>`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        uniform float uScanReveal;
        varying vec3 vScanLocal;
        float scanHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`,
      )
      .replace(
        "#include <clipping_planes_fragment>",
        /* glsl */ `
        float scanD = (uScanReveal - vScanLocal.x) / ${FRONT_WIDTH.toFixed(2)};
        if (scanD >= 1.0 || (scanD > 0.0 && scanD > scanHash(gl_FragCoord.xy))) discard;
        #include <clipping_planes_fragment>`,
      );
  };
  m.customProgramCacheKey = () => "scan-dissolve";
  return m;
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

export default function SolidApartment({
  reveal,
  animated,
  theme,
}: {
  /** The cloud material's live uReveal uniform — one write drives both shaders. */
  reveal: { value: number };
  animated: boolean;
  theme: SolidTheme;
}) {
  const group = useRef<THREE.Group>(null);

  const built = useMemo(() => {
    const mat = (opts?: THREE.MeshStandardMaterialParameters) =>
      withDissolve(
        new THREE.MeshStandardMaterial({
          roughness: 0.85,
          metalness: 0,
          side: THREE.DoubleSide,
          ...opts,
        }),
        reveal,
      );

    const materials: Record<SolidKey, THREE.MeshStandardMaterial> = {
      walls: mat(),
      furniture: mat({ roughness: 0.95 }),
      glazing: mat({
        roughness: 0.12,
        metalness: 0.1,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
      floor: mat(),
      // ceiling closes the building; it dissolves into nothing — the scan
      // "exposes" the interior, since the cloud carries no ceiling points
      ceiling: mat(),
    };

    const objects = [
      instanced([...exteriorWalls(), ...interiorWalls()], materials.walls),
      instanced(furniture(), materials.furniture),
      instanced(glazing(), materials.glazing),
      instanced(floorSlab(), materials.floor),
      instanced(ceilingSlab(), materials.ceiling),
    ];

    return { materials, objects };
    // reveal is a stable uniform object owned by the cloud's memo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      built.objects.forEach((o) => o.geometry.dispose());
      Object.values(built.materials).forEach((m) => m.dispose());
    };
  }, [built]);

  // theme palette — mirrors the cloud's uniform swap
  useEffect(() => {
    const palette = SOLID_PALETTE[theme];
    (Object.keys(palette) as SolidKey[]).forEach((key) => {
      built.materials[key].color.set(palette[key]);
    });
    invalidate();
  }, [built, theme]);

  // fully dissolved (or reduced motion) → skip the draws entirely
  useFrame(() => {
    if (group.current) group.current.visible = animated && reveal.value < X_GONE;
  });

  return (
    <group ref={group} visible={animated}>
      {built.objects.map((object, i) => (
        <primitive key={i} object={object} />
      ))}
    </group>
  );
}
