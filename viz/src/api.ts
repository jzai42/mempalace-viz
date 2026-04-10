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

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const api = {
  graph: () => get<GraphData>("/api/graph"),
  rooms: (wing?: string) =>
    get<{ wing: string; rooms: Record<string, number> }>(
      wing ? `/api/rooms?wing=${encodeURIComponent(wing)}` : "/api/rooms"
    ),
  search: (q: string, wing?: string, room?: string, limit = 10) => {
    const params = new URLSearchParams({ q, limit: String(limit) });
    if (wing) params.set("wing", wing);
    if (room) params.set("room", room);
    return get<SearchResult>(`/api/search?${params}`);
  },
  stats: () => get<GraphStats>("/api/stats"),
};
