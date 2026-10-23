import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { LogRow, SearchInput, Chip, T } from "../components/UI";

// Define our "Lightning Blue" and bright text colors
const LIGHTNING_BLUE = "#38bdf8"; // Sky-400
const GLOW_BLUE = "rgba(56, 189, 248, 0.4)";
const BRIGHT_TEXT = "#f1f5f9";    // Slate-100 (Very sharp)
const MID_TEXT = "#cbd5e1";       // Slate-300 (Bright secondary)

const LEVELS = ["ALL", "INFO", "WARN", "ERROR", "CRITICAL"];

export default function LogExplorer() {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("ALL");
  const [live, setLive] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadLive = async () => {
    if (!live) return;
    try {
      const data = await api.get("/logs/live?count=6");
      setLogs(prev => [...data, ...prev].slice(0, 300));
    } catch (e) { console.error(e); }
  };

  const search = async (selectedLevel = level) => {
    setLoading(true); setLive(false);
    try {
      const data = await api.post("/logs/search", {
        query,
        level: selectedLevel === "ALL" ? "all" : selectedLevel,
      });
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resumeLive = () => { setQuery(""); setLevel("ALL"); setLogs([]); setLive(true); };

  useEffect(() => {
    loadLive();
    if (live) { const t = setInterval(loadLive, 1800); return () => clearInterval(t); }
  }, [live]);

  const counts = {
    total: logs.length,
    CRITICAL: logs.filter(l => l.level === "CRITICAL").length,
    ERROR: logs.filter(l => l.level === "ERROR").length,
    WARN: logs.filter(l => l.level === "WARN").length,
    INFO: logs.filter(l => l.level === "INFO").length,
  };

  // Helper for Tab/Chip styling
  const getChipStyle = (l) => {
    const isActive = level === l;
    return {
      padding: "6px 12px",
      fontSize: 11,
      fontFamily: "var(--font-body)",
      fontWeight: isActive ? 700 : 500,
      background: isActive ? "rgba(56, 189, 248, 0.1)" : "rgba(255,255,255,0.03)",
      color: isActive ? LIGHTNING_BLUE : MID_TEXT,
      border: `1px solid ${isActive ? LIGHTNING_BLUE : "rgba(255,255,255,0.1)"}`,
      borderRadius: 6,
      cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: isActive ? `0 0 8px ${GLOW_BLUE}, inset 0 0 4px rgba(56, 189, 248, 0.2)` : "none",
      textShadow: isActive ? `0 0 4px ${GLOW_BLUE}` : "none"
    };
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 14, height: "calc(100vh - 120px)" }}>

      {/* ── Toolbar ── */}
      <div className="log-toolbar" style={{
        background: "rgba(15, 23, 42, 0.6)", // Darker glass
        backdropFilter: "blur(12px)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 12,
        padding: "14px 16px"
      }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <SearchInput value={query} onChange={setQuery} onEnter={search}
            placeholder="Search server, service, message, IP address…" />

          {/* Level pills */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {LEVELS.map(l => (
              <button
                key={l}
                type="button"
                className="log-level-chip"
                aria-pressed={level === l}
                disabled={loading}
                onClick={() => {
                  setLevel(l);
                  search(l);
                }}
                style={getChipStyle(l)}
              >
                {l}
              </button>
            ))}
          </div>

          <button onClick={search} style={{
            padding: "8px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
            background: "rgba(56, 189, 248, 0.1)", color: LIGHTNING_BLUE,
            border: `1px solid ${LIGHTNING_BLUE}`, borderRadius: 6, cursor: "pointer",
            flexShrink: 0, transition: "all 0.2s",
            boxShadow: `0 0 8px ${GLOW_BLUE}`,
            textTransform: "uppercase"
          }}>Search</button>

          {/* Live toggle */}
          <button onClick={live ? undefined : resumeLive} style={{
            padding: "8px 14px", fontSize: 11, fontWeight: 700, flexShrink: 0, letterSpacing: "0.05em",
            background: live ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.04)",
            color: live ? "#34d399" : MID_TEXT,
            border: `1px solid ${live ? "#10b981" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 6, cursor: live ? "default" : "pointer",
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: live ? "0 0 8px rgba(16, 185, 129, 0.3)" : "none",
            textTransform: "uppercase"
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: live ? "#34d399" : MID_TEXT,
              display: "inline-block", animation: live ? "livePulse 2s infinite" : "none",
              boxShadow: live ? "0 0 6px #10b981" : "none"
            }} />
            {live ? "LIVE" : "▶ Resume"}
          </button>
        </div>

        {/* Stat counters - Made text much brighter */}
        <div style={{ display: "flex", gap: 20, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10 }}>
          {[
            { l: "TOTAL", v: counts.total, c: BRIGHT_TEXT },
            { l: "CRITICAL", v: counts.CRITICAL, c: "#fca5a5" },
            { l: "ERROR", v: counts.ERROR, c: "#f87171" },
            { l: "WARN", v: counts.WARN, c: "#fde68a" },
            { l: "INFO", v: counts.INFO, c: "#93c5fd" },
          ].map(s => (
            <div key={s.l} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: MID_TEXT, fontWeight: 600, letterSpacing: "0.05em" }}>{s.l}:</span>
              <span style={{ color: s.c, fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 12 }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Log stream ── */}
      <div className="log-stream" style={{
        flex: 1, background: "#020617", // Very dark slate
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 12, overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)"
      }}>
        {/* Stream header - Brighter text */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "140px 68px 150px 120px 1fr",
          padding: "10px 14px",
          background: "rgba(30, 41, 59, 0.5)",
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          fontSize: 10, color: LIGHTNING_BLUE, letterSpacing: "0.1em",
          fontWeight: 700, textTransform: "uppercase",
          fontFamily: "var(--font-mono)",
          flexShrink: 0,
        }}>
          <span>Timestamp</span>
          <span>Level</span>
          <span>Server</span>
          <span>Service</span>
          <span>Message</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && <div style={{ padding: 20, color: LIGHTNING_BLUE, textAlign: "center", fontFamily: "var(--font-mono)" }}>Searching…</div>}
          {logs.map((log, i) => <LogRow key={log.id || i} log={log} />)}
        </div>
      </div>
    </div>
  );
}