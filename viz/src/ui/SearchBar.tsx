import { useState, useCallback } from "react";
import { api } from "../api";
import { useStore } from "../store";

export function SearchBar() {
  const [input, setInput] = useState("");
  const { setSearchQuery, setSearchResults, searchQuery } = useStore();

  const handleSearch = useCallback(async () => {
    const q = input.trim();
    if (!q) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }
    setSearchQuery(q);
    try {
      const res = await api.search(q);
      setSearchResults(res.results || []);
    } catch {
      setSearchResults([]);
    }
  }, [input, setSearchQuery, setSearchResults]);

  const handleClear = () => {
    setInput("");
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        zIndex: 100,
      }}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="Search your memories..."
        style={{
          width: 360,
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #2a3a50",
          background: "rgba(10, 14, 20, 0.9)",
          color: "#e0e0e0",
          fontSize: 14,
          outline: "none",
          backdropFilter: "blur(10px)",
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: "10px 20px",
          borderRadius: 8,
          border: "1px solid #4dc9f6",
          background: "rgba(77, 201, 246, 0.15)",
          color: "#4dc9f6",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Search
      </button>
      {searchQuery && (
        <button
          onClick={handleClear}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #555",
            background: "rgba(50, 50, 50, 0.5)",
            color: "#aaa",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
