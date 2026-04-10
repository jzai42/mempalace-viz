import { useMemo, useState } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { RoomNode } from "../api";
import { Room } from "./Room";
import { useStore } from "../store";

interface WingProps {
  name: string;
  rooms: Record<string, RoomNode>;
  position: [number, number, number];
  color: string;
}

const ROOM_SPACING = 1.6;
const COLS = 3;

/* ── Curved roof geometry (歇山/庑殿 style) ── */
function CurvedRoof({
  width,
  depth,
  height,
  color,
  overhang = 0.6,
}: {
  width: number;
  depth: number;
  height: number;
  color: string;
  overhang?: number;
}) {
  const geo = useMemo(() => {
    const w2 = width / 2 + overhang;
    const d2 = depth / 2 + overhang;
    const segs = 8;
    const positions: number[] = [];
    const indices: number[] = [];

    for (let iz = 0; iz <= segs; iz++) {
      for (let ix = 0; ix <= segs; ix++) {
        const u = ix / segs;
        const v = iz / segs;
        const x = (u - 0.5) * 2 * w2;
        const z = (v - 0.5) * 2 * d2;

        // parabolic cross-section with upturned edges (飞翘)
        const nx = (u - 0.5) * 2; // -1..1
        const nz = (v - 0.5) * 2;
        const edgeLift =
          0.15 * height * (Math.pow(Math.abs(nx), 3) + Math.pow(Math.abs(nz), 3));
        const mainCurve =
          height * (1 - 0.9 * nx * nx) * (1 - 0.9 * nz * nz);
        const y = mainCurve + edgeLift;

        positions.push(x, y, z);
      }
    }

    for (let iz = 0; iz < segs; iz++) {
      for (let ix = 0; ix < segs; ix++) {
        const a = iz * (segs + 1) + ix;
        const b = a + 1;
        const c = a + (segs + 1);
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [width, depth, height, overhang]);

  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial
        color={color}
        side={THREE.DoubleSide}
        metalness={0.2}
        roughness={0.6}
      />
    </mesh>
  );
}

/* ── Single pillar (柱子) ── */
function Pillar({
  position,
  height,
}: {
  position: [number, number, number];
  height: number;
}) {
  return (
    <group position={position}>
      {/* shaft */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, height, 8]} />
        <meshStandardMaterial
          color="#8b1a1a"
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>
      {/* base */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.08, 8]} />
        <meshStandardMaterial color="#d4c8a0" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ── Platform / 台基 (须弥座, multi-tier) ── */
function Platform({
  width,
  depth,
  height,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  width: number;
  depth: number;
  height: number;
  onClick: (e: any) => void;
  onPointerOver: (e: any) => void;
  onPointerOut: () => void;
}) {
  const tiers = height > 0.8 ? 3 : height > 0.5 ? 2 : 1;
  const tierH = height / tiers;

  return (
    <group>
      {Array.from({ length: tiers }, (_, ti) => {
        const shrink = ti * 0.25;
        const w = width + (tiers - 1 - ti) * 0.5;
        const d = depth + (tiers - 1 - ti) * 0.4;
        const yBase = ti * tierH;
        return (
          <group key={ti}>
            <mesh
              position={[0, yBase + tierH / 2, 0]}
              onClick={onClick}
              onPointerOver={onPointerOver}
              onPointerOut={onPointerOut}
              receiveShadow
              castShadow
            >
              <boxGeometry args={[w - shrink, tierH, d - shrink]} />
              <meshStandardMaterial
                color={ti === 0 ? "#d8cbb8" : "#e8dcc8"}
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>
            {/* edge band on each tier */}
            <mesh position={[0, yBase + tierH, 0]}>
              <boxGeometry args={[w - shrink + 0.1, 0.04, d - shrink + 0.1]} />
              <meshStandardMaterial color="#d4c8a0" roughness={0.7} />
            </mesh>
            {/* front steps per tier */}
            {[0, 1, 2].map((si) => (
              <mesh
                key={si}
                position={[
                  0,
                  yBase + tierH * (1 - si * 0.33) - 0.06,
                  (d - shrink) / 2 + 0.1 + si * 0.12,
                ]}
                receiveShadow
              >
                <boxGeometry args={[(w - shrink) * 0.25, 0.06, 0.12]} />
                <meshStandardMaterial color="#ddd4c0" roughness={0.8} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* bottom edge band */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[width + (tiers - 1) * 0.5 + 0.15, 0.04, depth + (tiers - 1) * 0.4 + 0.15]} />
        <meshStandardMaterial color="#c8bca0" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ── Railing posts (栏杆) ── */
function Railings({
  width,
  depth,
  platformH,
}: {
  width: number;
  depth: number;
  platformH: number;
}) {
  const posts = useMemo(() => {
    const result: [number, number][] = [];
    const count = Math.max(3, Math.floor(width / 0.8));
    for (let i = 0; i <= count; i++) {
      const x = (i / count - 0.5) * width;
      result.push([x, -depth / 2 - 0.05]);
      result.push([x, depth / 2 + 0.05]);
    }
    const countZ = Math.max(2, Math.floor(depth / 0.8));
    for (let i = 0; i <= countZ; i++) {
      const z = (i / countZ - 0.5) * depth;
      result.push([-width / 2 - 0.05, z]);
      result.push([width / 2 + 0.05, z]);
    }
    return result;
  }, [width, depth]);

  return (
    <group>
      {posts.map(([x, z], i) => (
        <mesh key={i} position={[x, platformH + 0.15, z]}>
          <boxGeometry args={[0.04, 0.3, 0.04]} />
          <meshStandardMaterial color="#e0d8c4" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Ridge decoration (正脊) ── */
function Ridge({
  width,
  y,
}: {
  width: number;
  y: number;
}) {
  return (
    <group position={[0, y, 0]}>
      {/* main ridge bar */}
      <mesh>
        <boxGeometry args={[width * 0.6, 0.08, 0.06]} />
        <meshStandardMaterial
          color="#c8a020"
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      {/* ridge end ornaments (鸱吻) */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * width * 0.32, 0.1, 0]}>
          <coneGeometry args={[0.06, 0.2, 6]} />
          <meshStandardMaterial
            color="#c8a020"
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Eave beam / 额枋 ── */
function EaveBeam({
  width,
  depth,
  y,
}: {
  width: number;
  depth: number;
  y: number;
}) {
  return (
    <group position={[0, y, 0]}>
      {/* front & back */}
      {[-1, 1].map((side) => (
        <mesh key={`fb${side}`} position={[0, 0, side * depth / 2]}>
          <boxGeometry args={[width, 0.12, 0.06]} />
          <meshStandardMaterial color="#2e6b3e" roughness={0.6} metalness={0.1} />
        </mesh>
      ))}
      {/* left & right */}
      {[-1, 1].map((side) => (
        <mesh key={`lr${side}`} position={[side * width / 2, 0, 0]}>
          <boxGeometry args={[0.06, 0.12, depth]} />
          <meshStandardMaterial color="#2e6b3e" roughness={0.6} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Main Wing component ── */
export function Wing({ name, rooms, position, color }: WingProps) {
  const [hovered, setHovered] = useState(false);
  const { selectWing, selectedWing, highlightedRooms, setCameraTarget } =
    useStore();
  const isSelected = selectedWing === name;

  const roomEntries = useMemo(
    () => Object.entries(rooms).sort(([, a], [, b]) => b.count - a.count),
    [rooms]
  );

  const totalCount = useMemo(
    () => roomEntries.reduce((sum, [, r]) => sum + r.count, 0),
    [roomEntries]
  );

  const scale = Math.max(1, Math.min(1.8, 0.8 + roomEntries.length * 0.15));
  const baseW = 3.5 * scale;
  const baseD = 2.8 * scale;
  const elevation = position[1];
  const platformH = 0.35 + elevation;
  const wallH = 1.6 * scale;
  const roofH = 1.0 * scale;
  const roofY = platformH + wallH;

  const roomPositions = useMemo(() => {
    return roomEntries.map((_, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x =
        (col - (Math.min(roomEntries.length, COLS) - 1) / 2) * ROOM_SPACING;
      const z =
        (row - (Math.ceil(roomEntries.length / COLS) - 1) / 2) * ROOM_SPACING;
      return [x, platformH + 0.02, z] as [number, number, number];
    });
  }, [roomEntries, platformH]);

  const handleClick = () => {
    selectWing(isSelected ? null : name);
    if (!isSelected) {
      setCameraTarget([position[0], 5, position[2] + 7]);
    } else {
      setCameraTarget(null);
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "default";
  };

  // pillar positions (2 rows x N cols along front/back)
  const pillars = useMemo(() => {
    const pts: [number, number, number][] = [];
    const nx = Math.max(2, Math.ceil(baseW / 1.0));
    for (let i = 0; i <= nx; i++) {
      const x = (i / nx - 0.5) * (baseW - 0.3);
      pts.push([x, platformH, -baseD / 2 + 0.15]);
      pts.push([x, platformH, baseD / 2 - 0.15]);
    }
    return pts;
  }, [baseW, baseD, platformH]);

  return (
    <group position={position}>
      {/* ── 台基 (platform) ── */}
      <Platform
        width={baseW}
        depth={baseD}
        height={platformH}
        onClick={(e: any) => {
          e.stopPropagation();
          handleClick();
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      <Railings width={baseW} depth={baseD} platformH={platformH} />

      {/* ── 柱子 (pillars) ── */}
      {pillars.map((pos, i) => (
        <Pillar key={i} position={pos} height={wallH} />
      ))}

      {/* ── 墙体 (walls — translucent) ── */}
      {!isSelected && (
        <>
          {/* front wall */}
          <mesh position={[0, platformH + wallH / 2, -baseD / 2 + 0.03]}>
            <boxGeometry args={[baseW - 0.2, wallH, 0.04]} />
            <meshStandardMaterial
              color="#8b1a1a"
              transparent
              opacity={0.4}
              roughness={0.7}
            />
          </mesh>
          {/* back wall */}
          <mesh position={[0, platformH + wallH / 2, baseD / 2 - 0.03]}>
            <boxGeometry args={[baseW - 0.2, wallH, 0.04]} />
            <meshStandardMaterial
              color="#8b1a1a"
              transparent
              opacity={0.4}
              roughness={0.7}
            />
          </mesh>
          {/* side walls */}
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * (baseW / 2 - 0.03), platformH + wallH / 2, 0]}
            >
              <boxGeometry args={[0.04, wallH, baseD - 0.2]} />
              <meshStandardMaterial
                color="#8b1a1a"
                transparent
                opacity={0.3}
                roughness={0.7}
              />
            </mesh>
          ))}
        </>
      )}

      {/* ── 额枋 (eave beams) ── */}
      <EaveBeam width={baseW - 0.1} depth={baseD - 0.1} y={roofY - 0.06} />

      {/* ── 屋顶 (roof) ── */}
      <group position={[0, roofY, 0]}>
        <CurvedRoof
          width={baseW}
          depth={baseD}
          height={roofH}
          color="#c8a020"
          overhang={0.5}
        />
        {/* secondary lower eave (重檐) */}
        <group position={[0, -0.15, 0]}>
          <CurvedRoof
            width={baseW + 0.4}
            depth={baseD + 0.4}
            height={roofH * 0.35}
            color="#b89018"
            overhang={0.7}
          />
        </group>
      </group>

      {/* ── 正脊 (ridge) ── */}
      <Ridge width={baseW} y={roofY + roofH + 0.02} />

      {/* ── 匾额 label ── */}
      <Text
        position={[0, platformH + wallH * 0.7, -baseD / 2 - 0.01]}
        fontSize={0.3 * scale}
        color={isSelected ? "#ffd700" : hovered ? "#f0e0a0" : "#c8a020"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#3a2000"
      >
        {name.replace("wing_", "")}
      </Text>
      <Text
        position={[0, platformH + wallH * 0.45, -baseD / 2 - 0.01]}
        fontSize={0.14}
        color="#a08860"
        anchorX="center"
        anchorY="middle"
      >
        {totalCount} drawers | {roomEntries.length} rooms
      </Text>

      {/* ── warm glow from inside ── */}
      <pointLight
        position={[0, platformH + wallH * 0.5, 0]}
        color="#ff9940"
        intensity={hovered ? 1.5 : 0.6}
        distance={baseW * 2}
        decay={2}
      />

      {/* ── rooms (shown when selected) ── */}
      {isSelected &&
        roomEntries.map(([roomName, roomData], i) => (
          <Room
            key={roomName}
            name={roomName}
            position={roomPositions[i]}
            count={roomData.count}
            highlighted={highlightedRooms.has(roomName)}
            wingColor={color}
          />
        ))}
    </group>
  );
}
