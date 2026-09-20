import { useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { api } from "../utils/api";

const COLORS = { cpu: "#3b82f6", memory: "#8b5cf6", errors: "#ef4444", response: "#f59e0b", requests: "#10b981" };

function StatCard({ label, value, unit, sub, color = "#3b82f6", icon }) {
  return (
    <div style={{
      background: "#0d1729", border: "1px solid #1a2d4a", borderRadius: 12,
      padding: "20px 24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>
        {value}<span style={{ fontSize: 14, fontWeight: 400, color: "#4a6fa5", marginLeft: 4 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#2a3f5f", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function SeverityBadge({ level }) {
  const cfg = {
    CRITICAL: { bg: "#1a0a0a", border: "#7f1d1d", color: "#f87171" },
    HIGH: { bg: "#1a1200", border: "#7c3a00", color: "#fb923c" },
    MEDIUM: { bg: "#1a1500", border: "#78490f", color: "#fbbf24" },
    LOW: { bg: "#0a1500", border: "#1a3a0a", color: "#4ade80" },
  };
  const c = cfg[level] || cfg.LOW;
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      letterSpacing: "0.05em",
    }}>{level}</span>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [fixing, setFixing] = useState(null);

  const load = async () => {
    try {
      const [s, h, a, m] = await Promise.all([
        api.get("/stats"), api.get("/metrics/history?hours=3"),
        api.get("/alerts"), api.get("/metrics"),
      ]);
      setStats(s); setHistory(h); setAlerts(a); setMetrics(m);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, []);

  const handleFix = async (alert) => {
    setFixing(alert.id);
    await api.post("/remediate", { issue_type: alert.type });
    setTimeout(() => { setFixing(null); load(); }, 2000);
  };

  const healthColor = (s) => s > 90 ? "#22c55e" : s > 75 ? "#f59e0b" : "#ef4444";
  const hs = stats?.health_score || 94;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        <StatCard label="Health Score" value={hs} unit="/100" icon="◎"
          color={healthColor(hs)} sub="Overall system health" />
        <StatCard label="Logs Today" value={((stats?.total_logs_today || 0) / 1000).toFixed(0)} unit="K"
          icon="≡" color="#3b82f6" sub="Processed in real-time" />
        <StatCard label="Auto-Fixed" value={stats?.auto_fixed || 0} unit="issues"
          icon="⚡" color="#10b981" sub="No human needed" />
        <StatCard label="Threats Blocked" value={stats?.threats_blocked || 0} unit="today"
          icon="🛡" color="#8b5cf6" sub="Security incidents" />
        <StatCard label="Revenue Saved" value={`$${((stats?.revenue_saved || 0) / 1000).toFixed(0)}K`} unit=""
          icon="◈" color="#f59e0b" sub="Prevented downtime cost" />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* CPU/Memory Chart */}
        <div style={{ background: "#0d1729", border: "1px solid #1a2d4a", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>
            CPU & Memory — Last 3 Hours
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
              <XAxis dataKey="time" tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0a1020", border: "1px solid #1a2d4a", borderRadius: 8 }} />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="url(#cpu)" strokeWidth={2} name="CPU %" />
              <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fill="url(#mem)" strokeWidth={2} name="Memory %" />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Error Rate Chart */}
        <div style={{ background: "#0d1729", border: "1px solid #1a2d4a", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>
            Error Rate
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={history.slice(-20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
              <XAxis dataKey="time" tick={{ fill: "#4a6fa5", fontSize: 9 }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0a1020", border: "1px solid #1a2d4a", borderRadius: 8 }} />
              <Bar dataKey="errors" fill="#ef4444" opacity={0.8} radius={[2, 2, 0, 0]} name="Errors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Metrics + Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16 }}>
        {/* Live Metrics */}
        <div style={{ background: "#0d1729", border: "1px solid #1a2d4a", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>
            Live System Metrics
          </div>
          {metrics && [
            { label: "CPU Usage", value: metrics.cpu, color: "#3b82f6", unit: "%" },
            { label: "Memory", value: metrics.memory, color: "#8b5cf6", unit: "%" },
            { label: "Disk", value: metrics.disk, color: "#f59e0b", unit: "%" },
            { label: "Network In", value: metrics.network_in, color: "#10b981", unit: " MB/s" },
            { label: "Avg Response", value: metrics.avg_response_ms, color: "#06b6d4", unit: " ms" },
            { label: "Requests/sec", value: metrics.requests_per_sec, color: "#a78bfa", unit: "" },
          ].map(m => (
            <div key={m.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>{m.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>
                  {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}{m.unit}
                </span>
              </div>
              {m.unit === "%" && (
                <div style={{ height: 4, background: "#1a2d4a", borderRadius: 2 }}>
                  <div style={{
                    height: "100%", width: `${Math.min(100, m.value)}%`,
                    background: m.value > 85 ? "#ef4444" : m.color, borderRadius: 2,
                    transition: "width 0.5s",
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active Alerts */}
        <div style={{ background: "#0d1729", border: "1px solid #1a2d4a", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>Active Alerts</div>
            <span style={{
              fontSize: 11, padding: "2px 8px", background: "#1a0a0a",
              border: "1px solid #7f1d1d", color: "#f87171", borderRadius: 4,
            }}>{alerts.length} ACTIVE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 280, overflowY: "auto" }}>
            {alerts.map(alert => (
              <div key={alert.id} style={{
                padding: "12px 14px", background: "#080d1a",
                border: "1px solid #1a2d4a", borderRadius: 8,
                borderLeft: `3px solid ${alert.severity === "CRITICAL" ? "#ef4444" : alert.severity === "HIGH" ? "#f97316" : "#f59e0b"}`,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <SeverityBadge level={alert.severity} />
                  {alert.auto_fixed && (
                    <span style={{ fontSize: 10, padding: "2px 6px", background: "#0d1f0d", border: "1px solid #1a4a1a", color: "#22c55e", borderRadius: 4 }}>AUTO-FIXED</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, lineHeight: 1.5 }}>{alert.message}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: "#2a3f5f" }}>{alert.server}</span>
                  {!alert.auto_fixed && (
                    <button
                      onClick={() => handleFix(alert)}
                      disabled={fixing === alert.id}
                      style={{
                        padding: "3px 10px", fontSize: 10, fontWeight: 600,
                        background: fixing === alert.id ? "#1a2d4a" : "#0f1e3a",
                        color: fixing === alert.id ? "#64748b" : "#60a5fa",
                        border: "1px solid #1e3a6a", borderRadius: 4, cursor: "pointer",
                      }}
                    >
                      {fixing === alert.id ? "Fixing..." : "⚡ Auto-Fix"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div style={{ background: "#0d1729", border: "1px solid #1a2d4a", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>
          Response Time & Request Volume
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
            <XAxis dataKey="time" tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} interval={5} />
            <YAxis yAxisId="l" tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} />
            <YAxis yAxisId="r" orientation="right" tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0a1020", border: "1px solid #1a2d4a", borderRadius: 8 }} />
            <Line yAxisId="l" type="monotone" dataKey="response_ms" stroke="#f59e0b" strokeWidth={2} dot={false} name="Response (ms)" />
            <Line yAxisId="r" type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={2} dot={false} name="Requests/min" />
            <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
