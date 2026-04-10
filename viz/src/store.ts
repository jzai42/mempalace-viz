import { create } from "zustand";
import type { GraphData, SearchHit, GraphStats } from "./api";

export interface PalaceStore {
  graph: GraphData | null;
  stats: GraphStats | null;
  loading: boolean;
  error: string | null;

  selectedWing: string | null;
  selectedRoom: string | null;
  drawerResults: SearchHit[];
  drawerLoading: boolean;

  searchQuery: string;
  searchResults: SearchHit[];
  highlightedRooms: Set<string>;

  cameraTarget: [number, number, number] | null;

  setGraph: (g: GraphData) => void;
  setStats: (s: GraphStats) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  selectWing: (wing: string | null) => void;
  selectRoom: (room: string | null) => void;
  setDrawerResults: (r: SearchHit[]) => void;
  setDrawerLoading: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (r: SearchHit[]) => void;
  setCameraTarget: (t: [number, number, number] | null) => void;
  goHome: () => void;
}

export const useStore = create<PalaceStore>((set) => ({
  graph: null,
  stats: null,
  loading: false,
  error: null,

  selectedWing: null,
  selectedRoom: null,
  drawerResults: [],
  drawerLoading: false,

  searchQuery: "",
  searchResults: [],
  highlightedRooms: new Set(),

  cameraTarget: null,

  setGraph: (g) => set({ graph: g }),
  setStats: (s) => set({ stats: s }),
  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e }),
  selectWing: (wing) =>
    set({ selectedWing: wing, selectedRoom: null, drawerResults: [] }),
  selectRoom: (room) => set({ selectedRoom: room }),
  setDrawerResults: (r) => set({ drawerResults: r }),
  setDrawerLoading: (v) => set({ drawerLoading: v }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (r) =>
    set({
      searchResults: r,
      highlightedRooms: new Set(r.map((h) => h.room)),
    }),
  setCameraTarget: (t) => set({ cameraTarget: t }),
  goHome: () =>
    set({
      selectedWing: null,
      selectedRoom: null,
      drawerResults: [],
      cameraTarget: null,
    }),
}));
