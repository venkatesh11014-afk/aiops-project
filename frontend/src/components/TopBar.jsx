import { useState, useEffect } from "react";
import { LiveBadge, T } from "./UI";
import { api } from "../utils/api";

const PAGE_META = {
  dashboard: { title:"Operations Dashboard",   sub:"Real-time infrastructure health" },
  anomalies: { title:"Anomaly Detection",      sub:"AI-powered ML threat surface" },
  logs:      { title:"Log Explorer",           sub:"Live system log stream & search" },
  servers:   { title:"Server Fleet",           sub:"12-node infrastructure overview" },
  copilot:   { title:"AI Copilot",             sub:"Natural language ops assistant" },
};

function MetricPill({ label, value, color = T.textS }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:5,
      padding:"5px 11px",
      background:"rgba(255,255,255,0.045)",
      border:"1px solid rgba(255,255,255,0.09)",
      borderRadius:20, flexShrink:0, whiteSpace:"nowrap",
    }}>
      <span style={{ fontSize:10, color:"#91a7c5", letterSpacing:"0.05em" }}>{label}</span>
      <span style={{ fontSize:12, fontWeight:700, color, fontFamily:"var(--font-mono)" }}>{value}</span>
    </div>
  );
}

export default function TopBar({ page, theme, onThemeToggle }) {
  const [time, setTime]       = useState(new Date());
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => { try { setMetrics(await api.get("/metrics")); } catch {} };
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  const { title, sub } = PAGE_META[page] || {};
  const metricColor = (v, t1=70, t2=85) => v>t2 ? T.red : v>t1 ? T.amber : T.green;

  return (
    <header className="topbar-card">
      {/* Page title */}
      <div className="topbar-heading">
        <div className="topbar-title">{title}</div>
        <div className="topbar-subtitle">{sub}</div>
      </div>

      {/* Scrolling metric pills */}
      <div className="topbar-metrics">
        {metrics && <>
          <MetricPill label="CPU"  value={`${metrics.cpu}%`}  color={metricColor(metrics.cpu)} />
          <MetricPill label="MEM"  value={`${metrics.memory}%`} color={metricColor(metrics.memory)} />
          <MetricPill label="DISK" value={`${metrics.disk}%`}   color={metricColor(metrics.disk,80,92)} />
          <MetricPill label="RPS"  value={`${metrics.requests_per_sec?.toLocaleString()}`} color={T.blue} />
          <MetricPill label="ERR%"  value={`${metrics.error_rate}%`} color={metrics.error_rate>2?T.red:T.green} />
          <MetricPill label="P50"  value={`${metrics.avg_response_ms}ms`} color={metrics.avg_response_ms>500?T.amber:T.textS} />
        </>}
      </div>

      {/* Right: live + clock + avatar */}
      <div className="topbar-actions">
        <LiveBadge />

        <button
          type="button"
          className="theme-toggle"
          onClick={onThemeToggle}
          aria-label="Toggle color theme"
          aria-pressed={theme === "light"}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "light" ? (
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="3.4" />
              <path d="M10 1.8v2M10 16.2v2M18.2 10h-2M3.8 10h-2m14-5.8-1.4 1.4M5.6 14.4l-1.4 1.4m11.6 0-1.4-1.4M5.6 5.6 4.2 4.2" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M16.8 12.2A7.2 7.2 0 0 1 7.8 3.2a7.4 7.4 0 1 0 9 9Z" />
            </svg>
          )}
          <span>{theme === "light" ? "Light" : "Dark"}</span>
        </button>

        {/* Clock */}
        <div className="topbar-clock">
          <div className="topbar-clock-time">
            {time.toLocaleTimeString()}
          </div>
          <div className="topbar-clock-date">
            {time.toLocaleDateString("en-US",{month:"short",day:"numeric"})}
          </div>
        </div>

        {/* Avatar */}
        <div className="topbar-avatar" aria-label="Operations profile">OP</div>
      </div>
    </header>
  );
}
