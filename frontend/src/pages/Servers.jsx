import { useState, useEffect } from "react";
import { api } from "../utils/api";
import LiquidGlass, { GlassPanel, GlassStatCard, GlassAlert } from "../components/LiquidGlass";


function MiniBar({ value, max = 100, color }) {
  const pct = Math.min(100, (value / max) * 100);
  const c = value > 85 ? "#ef4444" : value > 70 ? "#f59e0b" : color;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "#1a2d4a", borderRadius: 3 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 3, transition: "width 0.5s" }} />
      </div>
      <span style={{ fontSize: 11, color: c, width: 34, textAlign: "right", fontWeight: 600 }}>{value}%</span>
    </div>
  );
}

const STATUS_CFG = {
  healthy: { color: "#22c55e", bg: "#0d1f0d", border: "#1a4a1a", label: "Healthy", dot: "#22c55e" },
  warning: { color: "#f59e0b", bg: "#1a1400", border: "#78490f", label: "Warning", dot: "#f59e0b" },
  critical: { color: "#ef4444", bg: "#1a0a0a", border: "#7f1d1d", label: "Critical", dot: "#ef4444" },
};

export default function Servers() {
  const [servers, setServers] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await api.get("/servers");
      setServers(data);
      if (data.length && !selected) setSelected(data[0]);
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const counts = {
    healthy: servers.filter(s => s.status === "healthy").length,
    warning: servers.filter(s => s.status === "warning").length,
    critical: servers.filter(s => s.status === "critical").length,
  };

  const sel = servers.find(s => s.name === selected?.name) || selected;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {Object.entries(counts).map(([k, v]) => {
          const cfg = STATUS_CFG[k];
          return (
            <div key={k} style={{
              background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10,
              padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: `${cfg.color}20`, border: `2px solid ${cfg.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800, color: cfg.color,
              }}>{v}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
                <div style={{ fontSize: 11, color: "#4a6fa5" }}>servers</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Server Grid + Detail */}
      <div style={{ display: "flex", gap: 16 }}>
        {/* Grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {servers.map(server => {
              const cfg = STATUS_CFG[server.status] || STATUS_CFG.healthy;
              const isSelected = sel?.name === server.name;
              return (
                <div key={server.name} onClick={() => setSelected(server)} style={{
                  background: isSelected ? "#0f1e3a" : "#0d1729",
                  border: `1px solid ${isSelected ? "#1e3a6a" : "#1a2d4a"}`,
                  borderLeft: `3px solid ${cfg.color}`, borderRadius: 10,
                  padding: "14px 16px", cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{server.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block", boxShadow: `0 0 5px ${cfg.dot}` }} />
                      <span style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{cfg.label.toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div>
                      <div style={{ fontSize: 9, color: "#4a6fa5", marginBottom: 3 }}>CPU</div>
                      <MiniBar value={server.cpu} color="#3b82f6" />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "#4a6fa5", marginBottom: 3 }}>MEMORY</div>
                      <MiniBar value={server.memory} color="#8b5cf6" />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "#4a6fa5", marginBottom: 3 }}>DISK</div>
                      <MiniBar value={server.disk} color="#f59e0b" />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                    <span style={{ fontSize: 10, color: "#2a3f5f" }}>↑{server.uptime}</span>
                    <span style={{ fontSize: 10, color: "#3d5a80" }}>{server.requests_per_sec} req/s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        {sel && (
          <div style={{ width: 280, flexShrink: 0 }}>
            <div style={{ background: "transparent", border: "1px solid #1a2d4a", borderRadius: 12, padding: 20 }}>
              {(() => {
                const cfg = STATUS_CFG[sel.status] || STATUS_CFG.healthy;
                return (
                  <>
                    <div style={{ borderBottom: "1px solid #1a2d4a", paddingBottom: 14, marginBottom: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{sel.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot, display: "inline-block", boxShadow: `0 0 6px ${cfg.dot}` }} />
                        <span style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                      </div>
                    </div>

                    {[
                      { label: "CPU Usage", value: `${sel.cpu}%`, color: sel.cpu > 85 ? "#ef4444" : "#3b82f6" },
                      { label: "Memory Usage", value: `${sel.memory}%`, color: sel.memory > 85 ? "#ef4444" : "#8b5cf6" },
                      { label: "Disk Usage", value: `${sel.disk}%`, color: sel.disk > 90 ? "#ef4444" : "#f59e0b" },
                      { label: "Uptime", value: sel.uptime, color: "#22c55e" },
                      { label: "Requests/sec", value: sel.requests_per_sec, color: "#10b981" },
                    ].map(m => (
                      <div key={m.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #0d1520" }}>
                        <span style={{ fontSize: 12, color: "#4a6fa5" }}>{m.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.value}</span>
                      </div>
                    ))}

                    <div style={{ marginTop: 14, padding: 10, background: "transparent", borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: "#4a6fa5", marginBottom: 4 }}>LAST CHECKED</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {new Date(sel.last_checked).toLocaleTimeString()}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
