"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PLAN } from "./apartmentModel";

/*
  The drone that does the scanning.

  It flies the same line the scan front travels, so the resolving point cloud
  reads as a consequence of the flight rather than a decorative effect: the
  laser fan drops into the open-topped apartment and the points behind it are
  already resolved. Built from lines and a couple of flat boxes — the scene has
  no lights, so everything is basic/line material, which also keeps it in the
  survey-drawing register the rest of the page uses.
*/

/**
 * Live scan state, written by the point cloud each frame. `p` is normalised
 * progress along the sweep (0→1) rather than a world x, so the drone always
 * flies the length of the building however far the shader's front travels.
 */
export type ScanState = { p: number; active: boolean };

const RAYS = 15;
const ROTOR_R = 0.3;
const ARM = 0.46;
const FLY_HEIGHT = 5.5;
/** Half the drone's flight line — just past each gable, never off over nothing. */
const FLY_SPAN = PLAN.W / 2 + 0.8;
const PARK = { x: 0, y: 6.1 };
/** Top of the floor slab — where rays that clear the walls land. */
const FLOOR_Y = PLAN.SLAB;

function ringGeometry(radius: number, segments = 28) {
  const pts: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/** Two crossed blades; spinning these is what reads as rotor motion. */
function bladeGeometry(radius: number) {
  const r = radius * 0.86;
  // prettier-ignore
  const pts = [-r, 0, 0, r, 0, 0, 0, 0, -r, 0, 0, r];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/** Body shell + arms, as one edge pass. */
function frameGeometry() {
  const pts: number[] = [];
  const edge = (a: number[], b: number[]) => pts.push(...a, ...b);

  // body box
  const bx = 0.3;
  const by = 0.075;
  const bz = 0.2;
  const c: number[][] = [
    [-bx, -by, -bz], [bx, -by, -bz], [bx, -by, bz], [-bx, -by, bz],
    [-bx, by, -bz], [bx, by, -bz], [bx, by, bz], [-bx, by, bz],
  ];
  for (const [i, j] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])
    edge(c[i], c[j]);

  // arms out to each rotor hub
  for (const [sx, sz] of [[1,1],[1,-1],[-1,1],[-1,-1]])
    edge([sx * bx * 0.6, 0, sz * bz * 0.6], [sx * ARM, 0, sz * ARM]);

  return (() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  })();
}

export default function ScanDrone({
  scan,
  animated,
  colors,
  additive,
}: {
  scan: React.MutableRefObject<ScanState>;
  animated: boolean;
  colors: { body: string; accent: string; beam: string };
  additive: boolean;
}) {
  const drone = useRef<THREE.Group>(null);
  const blades = useRef<THREE.LineSegments[]>([]);
  const laser = useRef<THREE.LineSegments>(null);
  const hits = useRef<THREE.Points>(null);
  const wasActive = useRef(false);
  const fade = useRef(0);

  const built = useMemo(() => {
    const frameGeo = frameGeometry();
    const ringGeo = ringGeometry(ROTOR_R);
    const bladeGeo = bladeGeometry(ROTOR_R);
    const podGeo = new THREE.BoxGeometry(0.16, 0.14, 0.16);

    const frameMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.95 });
    const podMat = new THREE.MeshBasicMaterial({ transparent: true });

    // laser fan — one segment per ray, endpoints rewritten every frame
    const laserGeo = new THREE.BufferGeometry();
    laserGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(RAYS * 2 * 3), 3),
    );
    const laserMat = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    // bright return where each ray lands
    const hitGeo = new THREE.BufferGeometry();
    hitGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(RAYS * 3), 3));
    const hitMat = new THREE.PointsMaterial({
      size: 0.13,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      sizeAttenuation: true,
    });

    return { frameGeo, ringGeo, bladeGeo, podGeo, frameMat, podMat, laserGeo, laserMat, hitGeo, hitMat };
  }, []);

  useEffect(() => {
    const b = built;
    return () => {
      [b.frameGeo, b.ringGeo, b.bladeGeo, b.podGeo, b.laserGeo, b.hitGeo].forEach((g) => g.dispose());
      [b.frameMat, b.podMat, b.laserMat, b.hitMat].forEach((m) => m.dispose());
    };
  }, [built]);

  // theme
  useEffect(() => {
    built.frameMat.color.set(colors.body);
    built.podMat.color.set(colors.accent);
    built.laserMat.color.set(colors.beam);
    built.hitMat.color.set(colors.beam);
    const blend = additive ? THREE.AdditiveBlending : THREE.NormalBlending;
    built.laserMat.blending = blend;
    built.hitMat.blending = blend;
    built.laserMat.needsUpdate = true;
    built.hitMat.needsUpdate = true;
  }, [built, colors, additive]);

  /** Point the fan from the drone's pod down into the plan. */
  const aimLaser = (dx: number, dy: number, strength: number) => {
    const pos = built.laserGeo.attributes.position as THREE.BufferAttribute;
    const hitPos = built.hitGeo.attributes.position as THREE.BufferAttribute;
    const hd = PLAN.D / 2;
    const inPlan = Math.abs(dx) <= PLAN.W / 2;

    for (let i = 0; i < RAYS; i++) {
      const f = i / (RAYS - 1);
      const z = (f * 2 - 1) * hd * 1.18;
      // rays that clear the walls land on the slab; the rest hit the ground
      const y = inPlan && Math.abs(z) <= hd ? FLOOR_Y : 0;
      pos.setXYZ(i * 2, dx, dy - 0.14, 0);
      pos.setXYZ(i * 2 + 1, dx, y, z);
      hitPos.setXYZ(i, dx, y + 0.02, z);
    }
    pos.needsUpdate = true;
    hitPos.needsUpdate = true;
    built.laserMat.opacity = 0.5 * strength;
    built.hitMat.opacity = 0.9 * strength;
  };

  // static pose for reduced motion — a held frame mid-scan
  useEffect(() => {
    if (animated || !drone.current) return;
    drone.current.position.set(-1.5, FLY_HEIGHT, 0);
    drone.current.rotation.z = 0;
    fade.current = 1;
    aimLaser(-1.5, FLY_HEIGHT, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated, built]);

  useFrame((state, delta) => {
    const g = drone.current;
    if (!g || !animated) return;

    const t = state.clock.elapsedTime;
    const s = scan.current;
    const bob = Math.sin(t * 1.7) * 0.09;

    if (s.active) {
      const targetX = THREE.MathUtils.lerp(-FLY_SPAN, FLY_SPAN, THREE.MathUtils.clamp(s.p, 0, 1));
      // a new pass starts far from where we parked — jump rather than streak across
      if (!wasActive.current) g.position.set(targetX, FLY_HEIGHT + bob, 0);
      const prevX = g.position.x;
      g.position.x += (targetX - prevX) * Math.min(1, delta * 9);
      g.position.y += (FLY_HEIGHT + bob - g.position.y) * Math.min(1, delta * 4);
      // bank into the direction of travel
      const vx = g.position.x - prevX;
      g.rotation.z += (THREE.MathUtils.clamp(-vx * 1.6, -0.28, 0.28) - g.rotation.z) * 0.1;
    } else {
      g.position.x += (PARK.x - g.position.x) * Math.min(1, delta * 0.9);
      g.position.y += (PARK.y + bob - g.position.y) * Math.min(1, delta * 1.6);
      g.rotation.z += (0 - g.rotation.z) * 0.06;
    }
    wasActive.current = s.active;

    // lasers fade with the beam rather than snapping on and off
    fade.current += ((s.active ? 1 : 0) - fade.current) * Math.min(1, delta * 6);
    aimLaser(g.position.x, g.position.y, fade.current);

    // rotors
    const spin = delta * 26;
    for (const b of blades.current) if (b) b.rotation.y += spin;
  });

  const rotors: Array<[number, number]> = [
    [ARM, ARM],
    [ARM, -ARM],
    [-ARM, ARM],
    [-ARM, -ARM],
  ];

  return (
    <>
      <group ref={drone} position={[PARK.x, FLY_HEIGHT, 0]} scale={1.35}>
        <lineSegments geometry={built.frameGeo} material={built.frameMat} />
        <mesh geometry={built.podGeo} material={built.podMat} position={[0, -0.11, 0]} />
        {rotors.map(([x, z], i) => (
          <group key={i} position={[x, 0.03, z]}>
            <lineLoop geometry={built.ringGeo} material={built.frameMat} />
            <lineSegments
              ref={(el) => {
                if (el) blades.current[i] = el;
              }}
              geometry={built.bladeGeo}
              material={built.frameMat}
            />
          </group>
        ))}
      </group>

      <lineSegments
        ref={laser}
        geometry={built.laserGeo}
        material={built.laserMat}
        frustumCulled={false}
      />
      <points
        ref={hits}
        geometry={built.hitGeo}
        material={built.hitMat}
        frustumCulled={false}
      />
    </>
  );
}
