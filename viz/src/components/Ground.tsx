import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Ground() {
  const stoneTex = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#c8bfae";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "#b0a890";
    ctx.lineWidth = 2;
    const tiles = 8;
    const tileSize = size / tiles;
    for (let i = 0; i <= tiles; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tileSize, 0);
      ctx.lineTo(i * tileSize, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * tileSize);
      ctx.lineTo(size, i * tileSize);
      ctx.stroke();
    }

    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const v = Math.random() * 20;
      ctx.fillStyle = `rgba(${180 + v}, ${170 + v}, ${150 + v}, 0.25)`;
      ctx.fillRect(x, y, 2, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, []);

  const waterNormalTex = useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#8080ff";
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 128 + Math.floor((Math.random() - 0.5) * 30);
      const g = 128 + Math.floor((Math.random() - 0.5) * 30);
      ctx.fillStyle = `rgb(${r},${g},255)`;
      ctx.fillRect(x, y, 2 + Math.random() * 3, 1 + Math.random() * 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(30, 30);
    return tex;
  }, []);

  const waterRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (waterNormalTex) {
      waterNormalTex.offset.x += delta * 0.008;
      waterNormalTex.offset.y += delta * 0.005;
    }
  });

  return (
    <group>
      {/* stone courtyard island — raised above water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial map={stoneTex} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* island edge (retaining wall) */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[50, 0.15, 50]} />
        <meshStandardMaterial color="#a09880" roughness={0.8} />
      </mesh>

      {/* vast water surface */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.08, 0]}
        receiveShadow
      >
        <planeGeometry args={[300, 300]} />
        <meshPhysicalMaterial
          color="#2a6888"
          normalMap={waterNormalTex}
          normalScale={new THREE.Vector2(0.3, 0.3)}
          transparent
          opacity={0.85}
          roughness={0.08}
          metalness={0.4}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
          envMapIntensity={1.5}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* water depth layer underneath */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#0a2a3a" roughness={1} />
      </mesh>
    </group>
  );
}
