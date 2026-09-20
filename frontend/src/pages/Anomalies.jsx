import { useState, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../utils/api";

const SEVERITY_CONFIG = {
  CRITICAL: { color: "#ef4444", bg: "#1a0a0a", border: "#7f1d1d", icon: "🔴" },
  HIGH: { color: "#f97316", bg: "#1a0e00", border: "#7c3a00", icon: "🟠" },
  MEDIUM: { color: "#f59e0b", bg: "#1a1400", border: "#78490f", icon: "🟡" },
  LOW: { color: "#22c55e", bg: "#0a1500", border: "#1a4a1a", icon: "🟢" },
};

const ISSUE_ICONS = {
  MEMORY_LEAK: "💾",
  CPU_SPIKE: "⚡",
  DISK_FULL: "💿",
  SECURITY_ATTACK: "🛡️",
  PERFORMANCE_DEGRADATION: "🐢",
  APPLICATION_ERROR: "💥",
  UNKNOWN_ANOMALY: "❓",
};

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [fixing, setFixing] = useState(null);
  const [fixResult, setFixResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const load = async () => {
    try {
      const data = await api.get("/anomalies");
      setAnomalies(data);
      if (data.length > 0 && !selected) setSelected(data[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t); }, []);

  const handleFix = async (anomaly) => {
    setFixing(anomaly.id);
    setFixResult(null);
    const result = await api.post("/remediate", { issue_type: anomaly.issue_type });
    setFixResult(result);
    setFixing(null);
  };

  const filtered = filter === "ALL" ? anomalies : anomalies.filter(a => a.severity === filter);
  const sc = selected ? SEVERITY_CONFIG[selected.severity] || SEVERITY_CONFIG.LOW : null;

  const radarData = selected ? [
    { metric: "CPU", value: selected.log.cpu_usage },
    { metric: "Memory", value: selected.log.memory_usage },
    { metric: "Disk", value: selected.log.disk_usage },
    { metric: "Errors", value: Math.min(100, selected.log.error_count * 2) },
    { metric: "Response", value: Math.min(100, selected.log.response_time_ms / 100) },
    { metric: "Security", value: Math.min(100, selected.log.failed_logins * 5) },
  ] : [];

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 120px)" }}>
      {/* Left: Anomaly List */}
      <div style={{ width: 380, display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, background: "#0d1729", padding: 6, borderRadius: 10, border: "1px solid #1a2d4a" }}>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1, padding: "6px 4px", fontSize: 10, fontWeight: 600,
              borderRadius: 6, border: "none", cursor: "pointer",
              background: filter === f ? (SEVERITY_CONFIG[f]?.border || "#1a2d4a") : "transparent",
              color: filter === f ? (SEVERITY_CONFIG[f]?.color || "#60a5fa") : "#4a6fa5",
              letterSpacing: "0.03em",
            }}>{f}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {loading && <div style={{ color: "#4a6fa5", textAlign: "center", marginTop: 40 }}>Analyzing logs...</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ color: "#4a6fa5", textAlign: "center", marginTop: 40 }}>
              <div style={{ fontSize: 32 }}>✅</div>
              <div style={{ marginTop: 8 }}>No anomalies detected</div>
            </div>
          )}
          {filtered.map(a => {
            const cfg = SEVERITY_CONFIG[a.severity] || SEVERITY_CONFIG.LOW;
            return (
              <div key={a.id} onClick={() => setSelected(a)} style={{
                padding: "14px 16px", background: selected?.id === a.id ? "#0f1e3a" : "#0d1729",
                border: `1px solid ${selected?.id === a.id ? "#1e3a6a" : "#1a2d4a"}`,
                borderLeft: `3px solid ${cfg.color}`, borderRadius: 10, cursor: "pointer",
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16 }}>{ISSUE_ICONS[a.issue_type] || "⚠️"}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>
                    {a.issue_type.replace(/_/g, " ")}
                  </span>
                  <span style={{
                    marginLeft: "auto", fontSize: 9, padding: "2px 6px",
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    color: cfg.color, borderRadius: 4, fontWeight: 700,
                  }}>{a.severity}</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { l: "CPU", v: `${a.log.cpu_usage}%` },
                    { l: "MEM", v: `${a.log.memory_usage}%` },
                    { l: "Score", v: a.anomaly_score },
                  ].map(m => (
                    <div key={m.l}>
                      <div style={{ fontSize: 9, color: "#2a3f5f" }}>{m.l}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{m.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "#2a3f5f", marginTop: 6 }}>{a.log.server}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Detail Panel */}
      {selected && sc && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
          {/* Header */}
          <div style={{
            background: "#0d1729", border: `1px solid ${sc.border}`, borderRadius: 12, padding: 20,
            borderTop: `3px solid ${sc.color}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{ISSUE_ICONS[selected.issue_type]}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: sc.color }}>
                      {selected.issue_type.replace(/_/g, " ")}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{selected.log.server} · {selected.log.service}</div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#4a6fa5" }}>Confidence</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: sc.color }}>{selected.confidence}%</div>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: 12, background: "#080d1a", borderRadius: 8, border: "1px solid #1a2d4a" }}>
              <div style={{ fontSize: 11, color: "#4a6fa5", marginBottom: 4 }}>RECOMMENDED ACTION</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>{selected.recommended_action}</div>
            </div>

            {selected.auto_fixable && (
              <button
                onClick={() => handleFix(selected)}
                disabled={!!fixing}
                style={{
                  marginTop: 14, padding: "10px 24px", fontSize: 13, fontWeight: 700,
                  background: fixing ? "#1a2d4a" : "linear-gradient(135deg, #1d4ed8, #6d28d9)",
                  color: fixing ? "#4a6fa5" : "white", border: "none", borderRadius: 8,
                  cursor: fixing ? "not-allowed" : "pointer", width: "100%",
                }}
              >
                {fixing ? "⚡ Applying Auto-Fix..." : "⚡ Apply Auto-Fix Now"}
              </button>
            )}
          </div>

          {/* Fix Result */}
          {fixResult && (
            <div style={{
              background: "#0a1f0a", border: "1px solid #1a4a1a", borderRadius: 12, padding: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#22c55e", marginBottom: 12 }}>
                ✅ Fix Applied Successfully
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {fixResult.steps?.map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#4ade80" }}>
                    <span style={{ color: "#16a34a" }}>✓</span> {step}
                  </div>
                ))}
              </div>
              {fixResult.freed_gb && (
                <div style={{ marginTop: 10, padding: 8, background: "#0d2a0d", borderRadius: 6 }}>
                  <span style={{ fontSize: 12, color: "#22c55e" }}>Freed {fixResult.freed_gb}GB of disk space</span>
                </div>
              )}
            </div>
          )}

          {/* Radar Chart */}
          <div style={{ background: "#0d1729", border: "1px solid #1a2d4a", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>
              Anomaly Signature — Metric Fingerprint
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1a2d4a" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 11 }} />
                <Radar dataKey="value" stroke={sc.color} fill={sc.color} fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ background: "#0a1020", border: "1px solid #1a2d4a", borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Raw Metrics */}
          <div style={{ background: "#0d1729", border: "1px solid #1a2d4a", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>Raw Metrics at Detection Time</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { l: "CPU", v: `${selected.log.cpu_usage}%`, c: selected.log.cpu_usage > 85 ? "#ef4444" : "#3b82f6" },
                { l: "Memory", v: `${selected.log.memory_usage}%`, c: selected.log.memory_usage > 85 ? "#ef4444" : "#8b5cf6" },
                { l: "Disk", v: `${selected.log.disk_usage}%`, c: selected.log.disk_usage > 90 ? "#ef4444" : "#f59e0b" },
                { l: "Errors", v: selected.log.error_count, c: selected.log.error_count > 20 ? "#ef4444" : "#10b981" },
                { l: "Response", v: `${selected.log.response_time_ms}ms`, c: selected.log.response_time_ms > 2000 ? "#ef4444" : "#06b6d4" },
                { l: "Failed Logins", v: selected.log.failed_logins, c: selected.log.failed_logins > 10 ? "#ef4444" : "#64748b" },
              ].map(m => (
                <div key={m.l} style={{ padding: "10px 12px", background: "#080d1a", borderRadius: 8, border: "1px solid #1a2d4a" }}>
                  <div style={{ fontSize: 10, color: "#4a6fa5" }}>{m.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.c, marginTop: 2 }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
