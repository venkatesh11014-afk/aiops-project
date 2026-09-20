import LiquidGlass, { GlassBadge } from "./LiquidGlass";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "anomalies", label: "Anomalies", icon: "◈" },
  { id: "logs", label: "Log Explorer", icon: "≡" },
  { id: "servers", label: "Servers", icon: "▣" },
  { id: "copilot", label: "AI Copilot", icon: "◎", accent: true },
];

export default function Sidebar({ page, setPage }) {
  return (
    <LiquidGlass as="aside" variant="regular" className="app-sidebar" padding="0" style={{
      width: 260,
      display: "flex", flexDirection: "column", padding: "0",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div className="sidebar-brand" style={{ padding: "28px 22px 24px", borderBottom: "1px solid rgba(146,185,255,.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700,
          }}>⬡</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", letterSpacing: "0.02em" }}>AIOps</div>
            <div style={{ fontSize: 12, color: "#7188ad", letterSpacing: "0.05em" }}>CO-PILOT</div>
          </div>
        </div>
      </div>

      {/* Status pill */}
      <div className="sidebar-status" style={{ padding: "20px 22px", borderBottom: "1px solid rgba(146,185,255,.12)" }}>
        <GlassBadge className="system-status" style={{ display: "flex", width: "100%", gap: 8, color: "#5ee889" }}>
          
          <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, alignItems: "center" }}>Command Centre</span>
        </GlassBadge>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" style={{ flex: 1, padding: "16px 14px" }}>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "12px 14px", marginBottom: 6, borderRadius: 9,
              border: "none", cursor: "pointer", textAlign: "left",
              background: page === item.id
                ? item.accent ? "linear-gradient(135deg, #1e1b4b, #1a1035)" : "#0f1e3a"
                : "transparent",
              borderLeft: page === item.id ? `3px solid ${item.accent ? "#8b5cf6" : "#3b82f6"}` : "3px solid transparent",
              color: page === item.id ? (item.accent ? "#a78bfa" : "#60a5fa") : "#64748b",
              fontSize: 14, fontWeight: page === item.id ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
            {item.accent && (
              <span style={{
                marginLeft: "auto", fontSize: 9, padding: "2px 5px",
                background: "#2e1065", color: "#a78bfa", borderRadius: 4,
                fontWeight: 700, letterSpacing: "0.05em",
              }}>AI</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-footer" style={{ padding: "20px 22px", borderTop: "1px solid rgba(146,185,255,.12)" }}>
        <div style={{ fontSize: 12, color: "#647a9d", marginBottom: 5 }}>Monitoring since</div>
        <div style={{ fontSize: 13, color: "#8194b2" }}>12 servers · 24/7</div>
      </div>
    </LiquidGlass>
  );
}
