import { useState } from "react";
import { useStore } from "../store";

interface ViewPreset {
  label: string;
  icon: string;
  position: [number, number, number];
}

const PRESETS: ViewPreset[] = [
  { label: "鸟瞰", icon: "⬇", position: [0, 35, 1] },
  { label: "正面", icon: "◇", position: [0, 6, 30] },
  { label: "左侧", icon: "◁", position: [-30, 8, 0] },
  { label: "右侧", icon: "▷", position: [30, 8, 0] },
  { label: "后方", icon: "△", position: [0, 8, -28] },
  { label: "远景", icon: "◎", position: [20, 25, 30] },
  { label: "低角", icon: "▽", position: [12, 2.5, 18] },
  { label: "主视", icon: "⌂", position: [0, 18, 22] },
];

const btnBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid #2a3545",
  background: "rgba(20, 28, 40, 0.6)",
  color: "#8899aa",
  fontSize: 12,
  cursor: "pointer",
  transition: "all 0.15s",
  width: "100%",
  textAlign: "left" as const,
};

const btnHover: React.CSSProperties = {
  ...btnBase,
  border: "1px solid #4dc9f6",
  color: "#4dc9f6",
  background: "rgba(77, 201, 246, 0.1)",
};

const btnActive: React.CSSProperties = {
  ...btnBase,
  border: "1px solid #ffd700",
  color: "#ffd700",
  background: "rgba(255, 215, 0, 0.1)",
};

export function ViewControls() {
  const setCameraTarget = useStore((s) => s.setCameraTarget);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const handleClick = (preset: ViewPreset, idx: number) => {
    setActiveIdx(idx);
    setCameraTarget(preset.position);
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
      }}
    >
      {!collapsed && (
        <div
          style={{
            background: "rgba(10, 14, 20, 0.85)",
            border: "1px solid #1a2535",
            borderRadius: 10,
            padding: "10px 10px 8px",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: 110,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#556677",
              marginBottom: 2,
              paddingLeft: 2,
            }}
          >
            视角
          </div>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              style={
                activeIdx === i
                  ? btnActive
                  : hoveredIdx === i
                  ? btnHover
                  : btnBase
              }
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => handleClick(p, i)}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1px solid #2a3545",
          background: "rgba(10, 14, 20, 0.85)",
          color: "#4dc9f6",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          transition: "all 0.15s",
        }}
        title={collapsed ? "展开视角面板" : "收起视角面板"}
      >
        {collapsed ? "👁" : "×"}
      </button>
    </div>
  );
}
