import { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface TunnelProps {
  from: [number, number, number];
  to: [number, number, number];
  room: string;
}

export function Tunnel({ from, to, room }: TunnelProps) {
  const { posts, midpoint, angle, length, avgY } = useMemo(() => {
    const dx = to[0] - from[0];
    const dz = to[2] - from[2];
    const len = Math.sqrt(dx * dx + dz * dz);
    const ang = Math.atan2(dx, dz);
    const ay = (from[1] + to[1]) / 2;
    const mid: [number, number, number] = [
      (from[0] + to[0]) / 2,
      ay,
      (from[2] + to[2]) / 2,
    ];

    const postCount = Math.max(3, Math.floor(len / 2));
    const pts: { pos: [number, number, number]; y: number }[] = [];
    for (let i = 0; i <= postCount; i++) {
      const t = i / postCount;
      const x = from[0] + dx * t;
      const z = from[2] + dz * t;
      const y = from[1] + (to[1] - from[1]) * t;
      pts.push({ pos: [x, 0, z], y });
    }

    return { posts: pts, midpoint: mid, angle: ang, length: len, avgY: ay };
  }, [from, to]);

  const corridorH = 0.9 + avgY;

  return (
    <group>
      {posts.map((p, i) => {
        const postH = 0.9 + p.y;
        return (
          <group key={i}>
            <mesh position={[p.pos[0] - 0.3 * Math.cos(angle), postH / 2, p.pos[2] + 0.3 * Math.sin(angle)]}>
              <cylinderGeometry args={[0.03, 0.04, postH, 6]} />
              <meshStandardMaterial color="#8b1a1a" roughness={0.6} />
            </mesh>
            <mesh position={[p.pos[0] + 0.3 * Math.cos(angle), postH / 2, p.pos[2] - 0.3 * Math.sin(angle)]}>
              <cylinderGeometry args={[0.03, 0.04, postH, 6]} />
              <meshStandardMaterial color="#8b1a1a" roughness={0.6} />
            </mesh>
          </group>
        );
      })}

      <mesh
        position={[midpoint[0], corridorH + 0.02, midpoint[2]]}
        rotation={[0, angle, 0]}
      >
        <boxGeometry args={[0.9, 0.06, length + 0.5]} />
        <meshStandardMaterial color="#b89018" roughness={0.6} metalness={0.15} />
      </mesh>

      {[-0.3, 0.3].map((offset, idx) => (
        <mesh
          key={idx}
          position={[
            midpoint[0] + offset * Math.cos(angle),
            corridorH - 0.02,
            midpoint[2] - offset * Math.sin(angle),
          ]}
          rotation={[0, angle, 0]}
        >
          <boxGeometry args={[0.04, 0.06, length + 0.3]} />
          <meshStandardMaterial color="#2e6b3e" roughness={0.6} />
        </mesh>
      ))}

      <Text
        position={[midpoint[0], corridorH + 0.25, midpoint[2]]}
        fontSize={0.14}
        color="#c8a020"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.004}
        outlineColor="#2a1800"
      >
        {room}
      </Text>
    </group>
  );
}
