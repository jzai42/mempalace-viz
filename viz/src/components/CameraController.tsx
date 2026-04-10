import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3 } from "three";
import { useStore } from "../store";

const HOME_POS = new Vector3(0, 20, 25);
const LERP_SPEED = 0.04;

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraTarget = useStore((s) => s.cameraTarget);
  const targetVec = useRef(new Vector3(...HOME_POS.toArray()));
  const { camera } = useThree();

  useEffect(() => {
    if (cameraTarget) {
      targetVec.current.set(...cameraTarget);
    } else {
      targetVec.current.copy(HOME_POS);
    }
  }, [cameraTarget]);

  useFrame(() => {
    camera.position.lerp(targetVec.current, LERP_SPEED);
    controlsRef.current?.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.1}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={3}
      maxDistance={60}
    />
  );
}
