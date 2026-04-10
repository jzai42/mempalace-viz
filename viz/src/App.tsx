import { Canvas } from "@react-three/fiber";
import { Sky, Cloud } from "@react-three/drei";
import { Palace } from "./components/Palace";
import { CameraController } from "./components/CameraController";
import { SearchBar } from "./ui/SearchBar";
import { DrawerPanel } from "./ui/DrawerPanel";
import { StatsOverlay } from "./ui/StatsOverlay";
import { ViewControls } from "./ui/ViewControls";

export default function App() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        shadows
        camera={{ position: [0, 18, 22], fov: 50, near: 0.1, far: 500 }}
        gl={{ antialias: true, toneMapping: 3 }}
      >
        <Sky
          distance={450000}
          sunPosition={[80, 40, 60]}
          inclination={0.52}
          azimuth={0.25}
          rayleigh={1.2}
          turbidity={6}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
        <fog attach="fog" args={["#a0c8e8", 60, 180]} />

        <Cloud
          position={[-30, 35, -40]}
          speed={0.15}
          opacity={0.5}
          segments={20}
        />
        <Cloud
          position={[40, 30, -30]}
          speed={0.1}
          opacity={0.4}
          segments={15}
        />
        <Cloud
          position={[10, 38, -60]}
          speed={0.12}
          opacity={0.45}
          segments={18}
        />

        {/* sunlight */}
        <directionalLight
          position={[30, 35, 20]}
          intensity={2.5}
          color="#fff5e0"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
        />

        {/* fill light from opposite side (sky blue) */}
        <directionalLight
          position={[-20, 15, -15]}
          intensity={0.6}
          color="#90b8e0"
        />

        {/* ambient — warm daylight */}
        <ambientLight intensity={0.5} color="#f0ece0" />

        {/* hemisphere: sky blue top, warm ground bounce */}
        <hemisphereLight
          color="#87ceeb"
          groundColor="#c8a060"
          intensity={0.5}
        />

        <Palace />
        <CameraController />
      </Canvas>

      <SearchBar />
      <DrawerPanel />
      <StatsOverlay />
      <ViewControls />
    </div>
  );
}
