import { useState, useEffect } from "react";

const PAGE_TITLES = {
  dashboard: { title: "Operations Dashboard", sub: "Real-time system health overview" },
  anomalies: { title: "Anomaly Detection", sub: "AI-powered threat and issue detection" },
  logs: { title: "Log Explorer", sub: "Search and analyze system logs" },
  servers: { title: "Server Fleet", sub: "Infrastructure health monitoring" },
  copilot: { title: "AI Copilot", sub: "Natural language operations assistant" },
};

export default function TopBar({ page }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { title, sub } = PAGE_TITLES[page] || {};

  return (
    <header style={{
      height: 64, background: "#0a1020", borderBottom: "1px solid #1a2540",
      display: "flex", alignItems: "center", padding: "0 24px", gap: 16,
      flexShrink: 0,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{title}</div>
        <div style={{ fontSize: 12, color: "#3d5a80" }}>{sub}</div>
      </div>

      {/* Live indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#0d1f35", border: "1px solid #1a3a5f", borderRadius: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", display: "inline-block", animation: "pulse 2s infinite", boxShadow: "0 0 8px #3b82f6" }} />
        <span style={{ fontSize: 11, color: "#60a5fa", fontWeight: 600 }}>LIVE</span>
      </div>

      {/* Clock */}
      <div style={{ padding: "5px 12px", background: "#0d1520", border: "1px solid #1a2540", borderRadius: 6 }}>
        <div style={{ fontSize: 13, color: "#60a5fa", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {time.toLocaleTimeString()}
        </div>
        <div style={{ fontSize: 10, color: "#2a3f5f" }}>{time.toLocaleDateString()}</div>
      </div>

      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer",
      }}>OP</div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </header>
  );
}
