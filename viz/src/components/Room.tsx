import { useRef, useState } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "../store";

interface RoomProps {
  name: string;
  position: [number, number, number];
  count: number;
  highlighted: boolean;
  wingColor: string;
}

/* Lantern geometry (灯笼) — a simple octagonal shape */
function Lantern({
  position,
  color,
  intensity,
}: {
  position: [number, number, number];
  color: string;
  intensity: number;
}) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 0.18, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* top cap */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.07, 0.04, 8]} />
        <meshStandardMaterial color="#c8a020" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* bottom cap */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.07, 0.02, 0.04, 8]} />
        <meshStandardMaterial color="#c8a020" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* tassel */}
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.08, 4]} />
        <meshStandardMaterial color="#8b1a1a" />
      </mesh>
    </group>
  );
}

/* Scroll / 卷轴 display stand */
function ScrollStand({
  position,
  height,
  highlighted,
}: {
  position: [number, number, number];
  height: number;
  highlighted: boolean;
}) {
  return (
    <group position={position}>
      {/* stand frame */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.5, height, 0.08]} />
        <meshStandardMaterial
          color="#4a2810"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      {/* scroll surface */}
      <mesh position={[0, height / 2, 0.05]}>
        <boxGeometry args={[0.42, height * 0.75, 0.02]} />
        <meshStandardMaterial
          color={highlighted ? "#ffd700" : "#f0e8d0"}
          emissive={highlighted ? "#ffd700" : "#000000"}
          emissiveIntensity={highlighted ? 0.5 : 0}
          roughness={0.9}
        />
      </mesh>
      {/* top roller */}
      <mesh position={[0, height * 0.88, 0.05]}>
        <boxGeometry args={[0.5, 0.04, 0.04]} />
        <meshStandardMaterial color="#4a2810" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function Room({
  name,
  position,
  count,
  highlighted,
  wingColor,
}: RoomProps) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const selectRoom = useStore((s) => s.selectRoom);

  const height = Math.max(0.5, Math.min(1.5, count * 0.2));
  const lanternColor = highlighted ? "#ffd700" : "#cc3300";
  const lanternIntensity = highlighted ? 1.2 : hovered ? 0.8 : 0.4;

  return (
    <group position={position}>
      {/* clickable area */}
      <mesh
        ref={ref}
        position={[0, height / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          selectRoom(name);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
        visible={false}
      >
        <boxGeometry args={[0.7, height, 0.5]} />
      </mesh>

      {/* scroll stand as the room representation */}
      <ScrollStand position={[0, 0, 0]} height={height} highlighted={highlighted} />

      {/* lanterns on both sides */}
      <Lantern
        position={[-0.35, height * 0.7, 0]}
        color={lanternColor}
        intensity={lanternIntensity}
      />
      <Lantern
        position={[0.35, height * 0.7, 0]}
        color={lanternColor}
        intensity={lanternIntensity}
      />

      {/* warm point light when highlighted or hovered */}
      {(highlighted || hovered) && (
        <pointLight
          position={[0, height * 0.5, 0.2]}
          color={highlighted ? "#ffd700" : "#ff9940"}
          intensity={highlighted ? 2 : 1}
          distance={2}
          decay={2}
        />
      )}

      {/* name label */}
      <Text
        position={[0, height + 0.2, 0]}
        fontSize={0.16}
        color={hovered || highlighted ? "#ffd700" : "#c8a060"}
        anchorX="center"
        anchorY="bottom"
        maxWidth={1.5}
        outlineWidth={0.005}
        outlineColor="#2a1800"
      >
        {name}
      </Text>
      {hovered && (
        <Text
          position={[0, height + 0.4, 0]}
          fontSize={0.11}
          color="#a08860"
          anchorX="center"
          anchorY="bottom"
        >
          {count} drawers
        </Text>
      )}
    </group>
  );
}
