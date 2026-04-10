import { useStore } from "../store";

export function StatsOverlay() {
  const { stats, loading, error, selectedWing, goHome } = useStore();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        background: "rgba(10, 14, 20, 0.85)",
        border: "1px solid #1a2535",
        borderRadius: 10,
        padding: "12px 16px",
        zIndex: 100,
        fontSize: 12,
        color: "#8899aa",
        minWidth: 180,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#4dc9f6",
          marginBottom: 8,
        }}
      >
        MemPalace
      </div>
      {loading && <div>Loading palace...</div>}
      {error && <div style={{ color: "#ff6b6b" }}>Error: {error}</div>}
      {stats && (
        <>
          <div>{stats.total_rooms} rooms</div>
          <div>{stats.tunnel_rooms} tunnels</div>
          <div>{Object.keys(stats.rooms_per_wing).length} wings</div>
        </>
      )}
      {selectedWing && (
        <button
          onClick={goHome}
          style={{
            marginTop: 10,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #4dc9f6",
            background: "rgba(77, 201, 246, 0.1)",
            color: "#4dc9f6",
            fontSize: 12,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Back to overview
        </button>
      )}
    </div>
  );
}
