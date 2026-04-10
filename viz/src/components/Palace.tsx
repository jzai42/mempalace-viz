import { useEffect, useMemo } from "react";
import { api, type RoomNode } from "../api";
import { useStore } from "../store";
import { Wing } from "./Wing";
import { Tunnel } from "./Tunnel";
import { Ground } from "./Ground";
import { Environment } from "./Vegetation";

function wingColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = ((hash % 360) + 360) % 360;
  return `hsl(${h}, 55%, 45%)`;
}

/*
 * Organic palace layout:
 * - The wing with the most rooms is placed at center-back on the highest terrace
 * - Second/third wings flank it at a lower elevation
 * - Remaining wings spread outward in concentric tiers, getting shorter
 *
 * This mimics the hierarchical layout of a real imperial palace complex
 * (前朝后寝, central axis with flanking halls).
 */
const LAYOUT_TEMPLATES: Record<
  number,
  { x: number; z: number; elevation: number }[]
> = {
  1: [{ x: 0, z: 0, elevation: 0.8 }],
  2: [
    { x: 0, z: -4, elevation: 0.8 },
    { x: 0, z: 8, elevation: 0.3 },
  ],
  3: [
    { x: 0, z: -4, elevation: 0.8 },
    { x: -9, z: 5, elevation: 0.5 },
    { x: 9, z: 5, elevation: 0.4 },
  ],
  4: [
    { x: 0, z: -6, elevation: 1.0 },
    { x: -10, z: 2, elevation: 0.6 },
    { x: 10, z: 2, elevation: 0.5 },
    { x: 0, z: 10, elevation: 0.3 },
  ],
  5: [
    { x: 0, z: -6, elevation: 1.0 },
    { x: -10, z: 0, elevation: 0.6 },
    { x: 10, z: 0, elevation: 0.55 },
    { x: -7, z: 10, elevation: 0.35 },
    { x: 7, z: 10, elevation: 0.3 },
  ],
  6: [
    { x: 0, z: -8, elevation: 1.2 },
    { x: -11, z: -2, elevation: 0.7 },
    { x: 11, z: -2, elevation: 0.65 },
    { x: 0, z: 6, elevation: 0.5 },
    { x: -10, z: 12, elevation: 0.3 },
    { x: 10, z: 12, elevation: 0.25 },
  ],
};

function generateLayout(count: number): { x: number; z: number; elevation: number }[] {
  if (count <= 6) return LAYOUT_TEMPLATES[count] || LAYOUT_TEMPLATES[1];

  const result = [...LAYOUT_TEMPLATES[6]];
  const rng = mulberry32(77);
  for (let i = 6; i < count; i++) {
    const ring = 1 + Math.floor((i - 6) / 4);
    const angle = ((i - 6) % 4) * (Math.PI / 2) + rng() * 0.6 - 0.3;
    const dist = 10 + ring * 8;
    result.push({
      x: Math.cos(angle) * dist + (rng() - 0.5) * 3,
      z: Math.sin(angle) * dist + (rng() - 0.5) * 3,
      elevation: Math.max(0.1, 0.5 - ring * 0.12 + (rng() - 0.5) * 0.15),
    });
  }
  return result;
}

export function Palace() {
  const { graph, setGraph, setStats, setLoading, setError } = useStore();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.graph(), api.stats()])
      .then(([g, s]) => {
        if (cancelled) return;
        setGraph(g);
        setStats(s);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setGraph, setStats, setLoading, setError]);

  const wings = useMemo(() => {
    if (!graph) return [];
    const wingMap: Record<string, Record<string, RoomNode>> = {};
    for (const [room, data] of Object.entries(graph.nodes)) {
      for (const w of data.wings) {
        if (!wingMap[w]) wingMap[w] = {};
        wingMap[w][room] = data;
      }
    }
    return Object.entries(wingMap).sort(
      ([, a], [, b]) => Object.keys(b).length - Object.keys(a).length
    );
  }, [graph]);

  const layout = useMemo(() => generateLayout(wings.length), [wings.length]);

  const wingPositions = useMemo(() => {
    return wings.map((_, i) => {
      const slot = layout[i] || { x: 0, z: i * 14, elevation: 0.2 };
      return [slot.x, slot.elevation, slot.z] as [number, number, number];
    });
  }, [wings, layout]);

  const wingPosMap = useMemo(() => {
    const m: Record<string, [number, number, number]> = {};
    wings.forEach(([name], i) => {
      m[name] = wingPositions[i];
    });
    return m;
  }, [wings, wingPositions]);

  const tunnels = useMemo(() => {
    if (!graph) return [];
    const seen = new Set<string>();
    return graph.edges
      .filter((e) => {
        const key = `${e.wing_a}-${e.wing_b}-${e.room}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return wingPosMap[e.wing_a] && wingPosMap[e.wing_b];
      })
      .map((e) => ({
        room: e.room,
        from: wingPosMap[e.wing_a],
        to: wingPosMap[e.wing_b],
      }));
  }, [graph, wingPosMap]);

  return (
    <>
      <Ground />
      <Environment wingPositions={wingPositions} spread={22} />
      {wings.map(([name, rooms], i) => (
        <Wing
          key={name}
          name={name}
          rooms={rooms}
          position={wingPositions[i]}
          color={wingColor(name)}
        />
      ))}
      {tunnels.map((t, i) => (
        <Tunnel key={i} from={t.from} to={t.to} room={t.room} />
      ))}
    </>
  );
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
