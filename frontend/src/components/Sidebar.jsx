const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "anomalies", label: "Anomalies", icon: "◈" },
  { id: "logs", label: "Log Explorer", icon: "≡" },
  { id: "servers", label: "Servers", icon: "▣" },
  { id: "copilot", label: "AI Copilot", icon: "◎", accent: true },
];

export default function Sidebar({ page, setPage }) {
  return (
    <aside style={{
      width: 220, background: "#0a1020", borderRight: "1px solid #1a2540",
      display: "flex", flexDirection: "column", padding: "0",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #1a2540" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700,
          }}>⬡</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", letterSpacing: "0.02em" }}>AIOps</div>
            <div style={{ fontSize: 11, color: "#4a6fa5", letterSpacing: "0.05em" }}>COPILOT</div>
          </div>
        </div>
      </div>

      {/* Status pill */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #1a2540" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
          background: "#0d1f0d", border: "1px solid #1a4a1a", borderRadius: 6,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }} />
          <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>All Systems Live</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 12px" }}>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 12px", marginBottom: 4, borderRadius: 8,
              border: "none", cursor: "pointer", textAlign: "left",
              background: page === item.id
                ? item.accent ? "linear-gradient(135deg, #1e1b4b, #1a1035)" : "#0f1e3a"
                : "transparent",
              borderLeft: page === item.id ? `3px solid ${item.accent ? "#8b5cf6" : "#3b82f6"}` : "3px solid transparent",
              color: page === item.id ? (item.accent ? "#a78bfa" : "#60a5fa") : "#64748b",
              fontSize: 13, fontWeight: page === item.id ? 600 : 400,
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
      <div style={{ padding: "16px 20px", borderTop: "1px solid #1a2540" }}>
        <div style={{ fontSize: 11, color: "#2a3f5f", marginBottom: 4 }}>Monitoring since</div>
        <div style={{ fontSize: 12, color: "#3d5a80" }}>12 servers · 24/7</div>
      </div>
    </aside>
  );
}
