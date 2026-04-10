import { useMemo } from "react";
import * as THREE from "three";

/* ── Tree (松柏风格) ── */
export function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* trunk */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 1.2, 6]} />
        <meshStandardMaterial color="#5a3a20" roughness={0.9} />
      </mesh>
      {/* canopy layers */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.5, 1.0, 8]} />
        <meshStandardMaterial color="#2d5a1e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[0.35, 0.8, 8]} />
        <meshStandardMaterial color="#3a6b28" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial color="#4a7a30" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ── Round bush/shrub (灌木) ── */
export function Bush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshStandardMaterial color="#3a6828" roughness={0.85} />
      </mesh>
      <mesh position={[0.15, 0.15, 0.1]} castShadow>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color="#2d5a1e" roughness={0.85} />
      </mesh>
      <mesh position={[-0.12, 0.18, -0.08]} castShadow>
        <sphereGeometry args={[0.22, 8, 6]} />
        <meshStandardMaterial color="#3e7030" roughness={0.85} />
      </mesh>
    </group>
  );
}

/* ── Grass patch (草坪块) ── */
export function GrassPatch({ position, size = 4 }: { position: [number, number, number]; size?: number }) {
  return (
    <mesh position={[position[0], 0.01, position[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[size, 16]} />
      <meshStandardMaterial
        color="#3a6028"
        roughness={0.95}
        metalness={0}
      />
    </mesh>
  );
}

/* ── Procedural environment scattered around palaces ── */
export function Environment({
  wingPositions,
  spread = 20,
}: {
  wingPositions: [number, number, number][];
  spread?: number;
}) {
  const items = useMemo(() => {
    const rng = mulberry32(42);
    const trees: { pos: [number, number, number]; s: number }[] = [];
    const bushes: { pos: [number, number, number]; s: number }[] = [];
    const grasses: { pos: [number, number, number]; s: number }[] = [];

    const cx = wingPositions.length
      ? wingPositions.reduce((s, p) => s + p[0], 0) / wingPositions.length
      : 0;
    const cz = wingPositions.length
      ? wingPositions.reduce((s, p) => s + p[2], 0) / wingPositions.length
      : 0;

    for (let i = 0; i < 40; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 8 + rng() * spread;
      const x = cx + Math.cos(angle) * dist;
      const z = cz + Math.sin(angle) * dist;
      if (!tooCloseToWing(x, z, wingPositions, 5)) {
        trees.push({ pos: [x, 0, z], s: 0.6 + rng() * 0.8 });
      }
    }

    for (let i = 0; i < 50; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 5 + rng() * (spread + 5);
      const x = cx + Math.cos(angle) * dist;
      const z = cz + Math.sin(angle) * dist;
      if (!tooCloseToWing(x, z, wingPositions, 3.5)) {
        bushes.push({ pos: [x, 0, z], s: 0.5 + rng() * 0.8 });
      }
    }

    for (let i = 0; i < 20; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = 6 + rng() * (spread + 8);
      const x = cx + Math.cos(angle) * dist;
      const z = cz + Math.sin(angle) * dist;
      grasses.push({ pos: [x, 0, z], s: 2 + rng() * 4 });
    }

    // trees lining walkways between adjacent wings
    for (let i = 0; i < wingPositions.length; i++) {
      for (let j = i + 1; j < wingPositions.length; j++) {
        const a = wingPositions[i];
        const b = wingPositions[j];
        const dx = b[0] - a[0];
        const dz = b[2] - a[2];
        const len = Math.sqrt(dx * dx + dz * dz);
        if (len > 20) continue;
        const nx = -dz / len;
        const nz = dx / len;
        const count = Math.floor(len / 3);
        for (let k = 1; k < count; k++) {
          const t = k / count;
          for (const side of [-1, 1]) {
            const offset = 2.5 + rng() * 0.5;
            trees.push({
              pos: [
                a[0] + dx * t + nx * side * offset,
                0,
                a[2] + dz * t + nz * side * offset,
              ],
              s: 0.5 + rng() * 0.5,
            });
          }
        }
      }
    }

    return { trees, bushes, grasses };
  }, [wingPositions, spread]);

  return (
    <group>
      {items.grasses.map((g, i) => (
        <GrassPatch key={`g${i}`} position={g.pos} size={g.s} />
      ))}
      {items.trees.map((t, i) => (
        <Tree key={`t${i}`} position={t.pos} scale={t.s} />
      ))}
      {items.bushes.map((b, i) => (
        <Bush key={`b${i}`} position={b.pos} scale={b.s} />
      ))}
    </group>
  );
}

function tooCloseToWing(
  x: number,
  z: number,
  wings: [number, number, number][],
  minDist: number
): boolean {
  for (const w of wings) {
    const dx = x - w[0];
    const dz = z - w[2];
    if (Math.sqrt(dx * dx + dz * dz) < minDist) return true;
  }
  return false;
}

function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
