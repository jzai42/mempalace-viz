export interface RoomNode {
  wings: string[];
  halls: string[];
  count: number;
  dates: string[];
}

export interface GraphEdge {
  room: string;
  wing_a: string;
  wing_b: string;
  hall: string;
  count: number;
}

export interface GraphData {
  nodes: Record<string, RoomNode>;
  edges: GraphEdge[];
}

export interface SearchHit {
  text: string;
  wing: string;
  room: string;
  source_file: string;
  similarity: number;
}

export interface SearchResult {
  query: string;
  filters: { wing: string | null; room: string | null };
  results: SearchHit[];
  error?: string;
}

export interface GraphStats {
  total_rooms: number;
  tunnel_rooms: number;
  total_edges: number;
  rooms_per_wing: Record<string, number>;
  top_tunnels: { room: string; wings: string[]; count: number }[];
}

/* ── Demo data for static deployment ── */
const MOCK_GRAPH: GraphData = {
  nodes: {
    "chromadb-setup": {
      wings: ["wing_mempalace", "wing_code", "wing_viz"],
      halls: ["hall_facts"],
      count: 3,
      dates: ["2026-04-10"],
    },
    "palace-architecture": {
      wings: ["wing_mempalace", "wing_design"],
      halls: ["hall_facts", "hall_advice"],
      count: 2,
      dates: ["2026-04-10"],
    },
    "aaak-dialect": {
      wings: ["wing_mempalace"],
      halls: ["hall_discoveries"],
      count: 1,
      dates: ["2026-04-10"],
    },
    "benchmark-results": {
      wings: ["wing_mempalace"],
      halls: ["hall_events"],
      count: 1,
      dates: ["2026-04-10"],
    },
    "storage-choice": {
      wings: ["wing_mempalace"],
      halls: ["hall_preferences"],
      count: 1,
      dates: ["2026-04-10"],
    },
    "python-stack": {
      wings: ["wing_code"],
      halls: ["hall_facts"],
      count: 1,
      dates: ["2026-04-10"],
    },
    "mcp-server": {
      wings: ["wing_code"],
      halls: ["hall_events"],
      count: 1,
      dates: ["2026-04-10"],
    },
    "apple-silicon-fix": {
      wings: ["wing_code"],
      halls: ["hall_discoveries"],
      count: 1,
      dates: ["2026-04-10"],
    },
    "testing-strategy": {
      wings: ["wing_code"],
      halls: ["hall_advice"],
      count: 1,
      dates: ["2026-04-10"],
    },
    "tech-stack": {
      wings: ["wing_viz"],
      halls: ["hall_facts"],
      count: 1,
      dates: ["2026-04-10"],
    },
    "first-render": {
      wings: ["wing_viz"],
      halls: ["hall_events"],
      count: 1,
      dates: ["2026-04-10"],
    },
    "camera-control": {
      wings: ["wing_viz"],
      halls: ["hall_discoveries"],
      count: 1,
      dates: ["2026-04-10"],
    },
    "color-scheme": {
      wings: ["wing_design"],
      halls: ["hall_preferences"],
      count: 1,
      dates: ["2026-04-10"],
    },
    "layout-algorithm": {
      wings: ["wing_design"],
      halls: ["hall_facts"],
      count: 1,
      dates: ["2026-04-10"],
    },
  },
  edges: [
    { room: "chromadb-setup", wing_a: "wing_mempalace", wing_b: "wing_code", hall: "hall_facts", count: 2 },
    { room: "chromadb-setup", wing_a: "wing_mempalace", wing_b: "wing_viz", hall: "hall_facts", count: 2 },
    { room: "chromadb-setup", wing_a: "wing_code", wing_b: "wing_viz", hall: "hall_facts", count: 2 },
    { room: "palace-architecture", wing_a: "wing_mempalace", wing_b: "wing_design", hall: "hall_facts", count: 2 },
  ],
};

const MOCK_STATS: GraphStats = {
  total_rooms: 14,
  tunnel_rooms: 2,
  total_edges: 4,
  rooms_per_wing: {
    wing_mempalace: 5,
    wing_code: 4,
    wing_viz: 3,
    wing_design: 3,
  },
  top_tunnels: [
    { room: "chromadb-setup", wings: ["wing_mempalace", "wing_code", "wing_viz"], count: 3 },
    { room: "palace-architecture", wings: ["wing_mempalace", "wing_design"], count: 2 },
  ],
};

const MOCK_SEARCH_HITS: SearchHit[] = [
  { text: "ChromaDB stores verbatim content in drawers with wing/room metadata.", wing: "wing_mempalace", room: "chromadb-setup", source_file: "demo", similarity: 0.95 },
  { text: "The palace uses wings for projects, rooms for topics, halls for memory types, and tunnels for cross-wing connections.", wing: "wing_mempalace", room: "palace-architecture", source_file: "demo", similarity: 0.88 },
  { text: "The 3D visualization uses React Three Fiber, drei for helpers, zustand for state.", wing: "wing_viz", room: "tech-stack", source_file: "demo", similarity: 0.82 },
  { text: "MemPalace is built with Python 3.9+, ChromaDB for vectors, SQLite for the knowledge graph.", wing: "wing_code", room: "python-stack", source_file: "demo", similarity: 0.79 },
];

async function tryFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

export const api = {
  graph: () => tryFetch<GraphData>("/api/graph", MOCK_GRAPH),
  rooms: (wing?: string) =>
    tryFetch<{ wing: string; rooms: Record<string, number> }>(
      wing ? `/api/rooms?wing=${encodeURIComponent(wing)}` : "/api/rooms",
      { wing: wing || "all", rooms: {} }
    ),
  search: (q: string, wing?: string, room?: string, limit = 10) => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    if (wing) params.set("wing", wing);
    if (room) params.set("room", room);
    return tryFetch<SearchResult>(`/api/search?${params}`, {
      query: q,
      filters: { wing: wing || null, room: room || null },
      results: MOCK_SEARCH_HITS.filter(
        (h) =>
          h.text.toLowerCase().includes(q.toLowerCase()) ||
          h.room.toLowerCase().includes(q.toLowerCase())
      ),
    });
  },
  stats: () => tryFetch<GraphStats>("/api/stats", MOCK_STATS),
};
