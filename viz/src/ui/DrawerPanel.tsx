import { useEffect } from "react";
import { api } from "../api";
import { useStore } from "../store";

export function DrawerPanel() {
  const {
    selectedRoom,
    selectedWing,
    drawerResults,
    drawerLoading,
    setDrawerResults,
    setDrawerLoading,
    selectRoom,
    searchResults,
    searchQuery,
  } = useStore();

  const results = selectedRoom ? drawerResults : searchResults;
  const title = selectedRoom
    ? `${selectedWing || ""} / ${selectedRoom}`
    : searchQuery
      ? `Search: "${searchQuery}"`
      : null;

  useEffect(() => {
    if (!selectedRoom) return;
    let cancelled = false;
    setDrawerLoading(true);
    api
      .search(selectedRoom, selectedWing || undefined, selectedRoom)
      .then((res) => {
        if (cancelled) return;
        setDrawerResults(res.results || []);
        setDrawerLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setDrawerResults([]);
        setDrawerLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedRoom, selectedWing, setDrawerResults, setDrawerLoading]);

  if (!title || results.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 16,
        width: 380,
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
        background: "rgba(10, 14, 20, 0.92)",
        border: "1px solid #2a3a50",
        borderRadius: 12,
        padding: 16,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 14, color: "#4dc9f6" }}>{title}</h3>
        {selectedRoom && (
          <button
            onClick={() => selectRoom(null)}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            x
          </button>
        )}
      </div>
      {drawerLoading ? (
        <p style={{ color: "#555", fontSize: 13 }}>Loading...</p>
      ) : (
        results.map((hit, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
              padding: 12,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 8,
              borderLeft: `3px solid hsl(${(hit.similarity || 0) * 120}, 70%, 50%)`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 11,
                color: "#667788",
              }}
            >
              <span>
                {hit.wing} / {hit.room}
              </span>
              <span>{Math.round((hit.similarity || 0) * 100)}%</span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                lineHeight: 1.5,
                color: "#c0c8d0",
                whiteSpace: "pre-wrap",
                maxHeight: 160,
                overflow: "hidden",
              }}
            >
              {hit.text}
            </p>
            {hit.source_file && hit.source_file !== "?" && (
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 10,
                  color: "#445566",
                }}
              >
                {hit.source_file}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
