import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { api } from "../utils/api";
import LiquidGlass, { GlassStatCard, GlassPanel, GlassAlert } from "../components/LiquidGlass";

function SeverityBadge({ level }) {
  const cfg = {
    CRITICAL: { bg: "rgba(239,68,68,0.18)",  border: "rgba(239,68,68,0.45)",  color: "#fca5a5" },
    HIGH:     { bg: "rgba(249,115,22,0.18)", border: "rgba(249,115,22,0.45)", color: "#fdba74" },
    MEDIUM:   { bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.45)", color: "#fcd34d" },
    LOW:      { bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.4)",   color: "#86efac" },
  };
  const c = cfg[level] || cfg.LOW;
  return (
    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      letterSpacing: "0.05em", backdropFilter: "blur(8px)" }}>{level}</span>
  );
}

const tooltipStyle = { contentStyle: { background: "rgba(5,10,26,0.92)", border: "1px solid rgba(100,160,255,0.25)", borderRadius: 10, backdropFilter: "blur(16px)", fontSize: 12 } };

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts]   = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [fixing, setFixing]   = useState(null);

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

  const hs = stats?.health_score || 94;
  const healthColor = hs > 90 ? "#22c55e" : hs > 75 ? "#f59e0b" : "#ef4444";

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Stat Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
        <GlassStatCard label="Health Score"    value={hs}   unit="/100" icon="◎" color={healthColor} sub="Overall health" />
        <GlassStatCard label="Logs Today"      value={((stats?.total_logs_today||0)/1000).toFixed(0)} unit="K" icon="≡" color="#5ca9ff" />
        <GlassStatCard label="Auto-Fixed"      value={stats?.auto_fixed||0}       unit="issues" icon="⚡" color="#10b981" />
        <GlassStatCard label="Threats Blocked" value={stats?.threats_blocked||0}  unit="today"  icon="🛡" color="#9b7bff" variant="purple" />
        <GlassStatCard label="Revenue Saved"   value={`$${((stats?.revenue_saved||0)/1000).toFixed(0)}K`} icon="◈" color="#f59e0b" variant="warning" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <LiquidGlass intensity="strong" padding="20px" radius={14}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(200,220,255,0.7)", marginBottom: 14 }}>
            CPU &amp; Memory — Last 3 Hours
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(80,120,200,0.12)" />
              <XAxis dataKey="time" tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} domain={[0,100]} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="cpu"    stroke="#3b82f6" fill="url(#cpu)" strokeWidth={2} name="CPU %" />
              <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fill="url(#mem)" strokeWidth={2} name="Memory %" />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
            </AreaChart>
          </ResponsiveContainer>
        </LiquidGlass>

        <LiquidGlass intensity="strong" padding="20px" radius={14}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(200,220,255,0.7)", marginBottom: 14 }}>Error Rate</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={history.slice(-20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(80,120,200,0.12)" />
              <XAxis dataKey="time" tick={{ fill: "#4a6fa5", fontSize: 9 }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="errors" fill="rgba(239,68,68,0.7)" radius={[3,3,0,0]} name="Errors" />
            </BarChart>
          </ResponsiveContainer>
        </LiquidGlass>
      </div>

      {/* ── Live Metrics + Alerts ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 14 }}>
        {/* Live Metrics */}
        <LiquidGlass padding="20px" radius={14}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(200,220,255,0.7)", marginBottom: 16 }}>Live System Metrics</div>
          {metrics && [
            { label: "CPU Usage",    value: metrics.cpu,              color: "#3b82f6", unit: "%" },
            { label: "Memory",       value: metrics.memory,           color: "#8b5cf6", unit: "%" },
            { label: "Disk",         value: metrics.disk,             color: "#f59e0b", unit: "%" },
            { label: "Network In",   value: metrics.network_in,       color: "#10b981", unit: " MB/s" },
            { label: "Avg Response", value: metrics.avg_response_ms,  color: "#06b6d4", unit: " ms" },
            { label: "Requests/sec", value: metrics.requests_per_sec, color: "#a78bfa", unit: "" },
          ].map(m => (
            <div key={m.label} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{typeof m.value === "number" ? m.value.toLocaleString() : m.value}{m.unit}</span>
              </div>
              {m.unit === "%" && (
                <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                  <div style={{ height:"100%", width:`${Math.min(100,m.value)}%`,
                    background: m.value > 85 ? "#ef4444" : m.color, borderRadius: 2, transition: "width 0.5s" }} />
                </div>
              )}
            </div>
          ))}
        </LiquidGlass>

        {/* Active Alerts */}
        <LiquidGlass padding="20px" radius={14}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(200,220,255,0.7)" }}>Active Alerts</div>
            <span style={{ fontSize: 10, padding: "2px 8px",
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)",
              color: "#f87171", borderRadius: 4 }}>{alerts.length} ACTIVE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {alerts.map(alert => (
              <GlassAlert
                key={alert.id}
                severity={alert.severity}
                message={alert.message}
                server={alert.server}
                autoFixed={alert.auto_fixed}
                onFix={() => handleFix(alert)}
                fixing={fixing === alert.id}
              />
            ))}
          </div>
        </LiquidGlass>
      </div>

      {/* ── Response Time Chart ── */}
      <LiquidGlass intensity="strong" padding="20px" radius={14}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(200,220,255,0.7)", marginBottom: 14 }}>
          Response Time &amp; Request Volume
        </div>
        <ResponsiveContainer width="100%" height={170}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(80,120,200,0.12)" />
            <XAxis dataKey="time" tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} interval={5} />
            <YAxis yAxisId="l" tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} />
            <YAxis yAxisId="r" orientation="right" tick={{ fill: "#4a6fa5", fontSize: 10 }} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Line yAxisId="l" type="monotone" dataKey="response_ms" stroke="#f59e0b" strokeWidth={2} dot={false} name="Response (ms)" />
            <Line yAxisId="r" type="monotone" dataKey="requests"    stroke="#10b981" strokeWidth={2} dot={false} name="Requests/min" />
            <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
          </LineChart>
        </ResponsiveContainer>
      </LiquidGlass>
    </div>
  );
}
