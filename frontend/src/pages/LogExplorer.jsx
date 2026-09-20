import { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";

const LEVEL_CFG = {
  INFO:     { color: "#60a5fa", bg: "#0d1729", border: "#1a2d4a" },
  WARN:     { color: "#fbbf24", bg: "#1a1400", border: "#78490f" },
  ERROR:    { color: "#f87171", bg: "#1a0a0a", border: "#7f1d1d" },
  CRITICAL: { color: "#ff4d4d", bg: "#200000", border: "#9b1c1c" },
};

export default function LogExplorer() {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [live, setLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const loadLive = async () => {
    if (!live) return;
    const data = await api.get("/logs/live?count=5");
    setLogs(prev => [...data, ...prev].slice(0, 200));
    if (bottomRef.current && live) {
      // don't auto-scroll if live mode; let user read
    }
  };

  const search = async () => {
    setLoading(true);
    setLive(false);
    const data = await api.post("/logs/search", { query, level });
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLive();
    if (live) {
      const t = setInterval(loadLive, 2000);
      return () => clearInterval(t);
    }
  }, [live]);

  const clearAndResume = () => {
    setQuery("");
    setLevel("all");
    setLogs([]);
    setLive(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "calc(100vh - 120px)" }}>
      {/* Search Bar */}
      <div style={{ background: "#0d1729", border: "1px solid #1a2d4a", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", gap: 0, background: "#080d1a", border: "1px solid #1a2d4a", borderRadius: 8, overflow: "hidden" }}>
            <span style={{ padding: "0 12px", display: "flex", alignItems: "center", color: "#4a6fa5", fontSize: 16 }}>⌕</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder="Search logs... (server, service, message, IP)"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#e2e8f0", fontSize: 13, padding: "10px 0",
              }}
            />
          </div>
          <select value={level} onChange={e => setLevel(e.target.value)} style={{
            background: "#080d1a", border: "1px solid #1a2d4a", color: "#94a3b8",
            padding: "10px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
          }}>
            <option value="all">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <button onClick={search} style={{
            padding: "10px 20px", background: "#1d4ed8", color: "white",
            border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>Search</button>
          <button onClick={clearAndResume} style={{
            padding: "10px 16px", background: live ? "#0d1f0d" : "#1a2d4a",
            color: live ? "#22c55e" : "#64748b",
            border: `1px solid ${live ? "#1a4a1a" : "#2a3f5f"}`, borderRadius: 8, cursor: "pointer", fontSize: 12,
          }}>
            {live ? "● LIVE" : "▶ Resume Live"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          {[
            { label: "Total Logs", value: logs.length },
            { label: "CRITICAL", value: logs.filter(l => l.level === "CRITICAL").length, color: "#ef4444" },
            { label: "ERROR", value: logs.filter(l => l.level === "ERROR").length, color: "#f87171" },
            { label: "WARN", value: logs.filter(l => l.level === "WARN").length, color: "#fbbf24" },
            { label: "INFO", value: logs.filter(l => l.level === "INFO").length, color: "#60a5fa" },
          ].map(s => (
            <div key={s.label} style={{ fontSize: 11 }}>
              <span style={{ color: "#4a6fa5" }}>{s.label}: </span>
              <span style={{ color: s.color || "#94a3b8", fontWeight: 700 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Log Stream */}
      <div style={{
        flex: 1, background: "#060b14", border: "1px solid #1a2d4a", borderRadius: 12,
        overflow: "auto", fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}>
        <div style={{
          position: "sticky", top: 0, background: "#0a1020", borderBottom: "1px solid #1a2d4a",
          padding: "8px 16px", display: "flex", gap: 24, fontSize: 10, color: "#4a6fa5",
        }}>
          <span style={{ width: 160 }}>TIMESTAMP</span>
          <span style={{ width: 60 }}>LEVEL</span>
          <span style={{ width: 160 }}>SERVER</span>
          <span style={{ width: 120 }}>SERVICE</span>
          <span>MESSAGE</span>
        </div>

        {loading && <div style={{ padding: 20, color: "#4a6fa5", textAlign: "center" }}>Searching...</div>}

        {logs.map((log, i) => {
          const cfg = LEVEL_CFG[log.level] || LEVEL_CFG.INFO;
          return (
            <div key={log.id || i} style={{
              padding: "6px 16px", display: "flex", gap: 24, alignItems: "center",
              borderBottom: "1px solid #0d1520", fontSize: 11,
              background: log.level === "CRITICAL" ? "#120000" : log.level === "ERROR" ? "#0f0000" : "transparent",
              transition: "background 0.2s",
            }}>
              <span style={{ width: 160, color: "#2a3f5f", flexShrink: 0 }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span style={{
                width: 60, flexShrink: 0, padding: "1px 6px", borderRadius: 3,
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                color: cfg.color, fontSize: 9, fontWeight: 700, textAlign: "center",
              }}>{log.level}</span>
              <span style={{ width: 160, color: "#4a6fa5", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {log.server}
              </span>
              <span style={{ width: 120, color: "#3d5a80", flexShrink: 0 }}>{log.service}</span>
              <span style={{ color: cfg.color === "#60a5fa" ? "#94a3b8" : cfg.color, flex: 1 }}>
                {log.message}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
