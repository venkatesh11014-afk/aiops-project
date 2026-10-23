import { StatusDot } from "./UI";
import { T } from "./UI";

const NAV = [
  { id:"dashboard", label:"Dashboard",    icon:<DashIcon />,  },
  { id:"anomalies", label:"Anomalies",    icon:<AnoIcon />,   },
  { id:"logs",      label:"Log Explorer", icon:<LogIcon />,   },
  { id:"servers",   label:"Fleet",        icon:<SrvIcon />,   },
  { id:"copilot",   label:"AI Copilot",   icon:<AIIcon />,    ai:true },
];

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar-card" style={{
      width:220, flexShrink:0,
      background:"rgba(5,9,20,0.98)",
      borderRight:`1px solid ${T.borderS}`,
      display:"flex", flexDirection:"column",
      backdropFilter:"blur(20px)",
    }}>
      {/* Logo */}
      <div className="sidebar-brand" style={{ padding:"22px 18px 16px", borderBottom:`1px solid ${T.borderS}` }}>
        <div className="sidebar-brand-lockup" style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src="/logo1.png" alt="AIOps logo" width={34} height={34} style={{ objectFit:"contain", flexShrink:0 }} />
          <div>
            <div className="sidebar-brand-name" style={{ fontFamily:"var(--font-display)", fontSize:14, fontWeight:800,
              color:T.textP, letterSpacing:"0.01em" }}>AIOps</div>
            <div className="sidebar-brand-subtitle" style={{ fontSize:9, color:T.textP, letterSpacing:"0.12em", fontWeight:600 }}>COPILOT</div>
          </div>
        </div>

        {/* Live status */}
        <div className="sidebar-status" style={{
          marginTop:12, display:"flex", alignItems:"center", gap:7,
          padding:"5px 9px",
          background:"rgba(16,185,129,0.07)",
          border:"1px solid rgba(16,185,129,0.18)",
          borderRadius:6,
        }}>
          <StatusDot color={T.green} size={6} />
          <span style={{ fontSize:10, color:"rgba(16,185,129,0.85)", fontWeight:600 }}>All Systems Live</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-navigation" style={{ flex:1, padding:"10px 10px" }}>
        <div className="sidebar-section-label" style={{ fontSize:9, color:T.textM, letterSpacing:"0.1em", padding:"8px 8px 4px",
          fontWeight:600, textTransform:"uppercase" }}>Navigation</div>

        {NAV.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={()=>setPage(item.id)} className={`sidebar-link${active ? " is-active" : ""}${item.ai ? " is-ai" : ""}`} aria-current={active ? "page" : undefined} style={{
              display:"flex", alignItems:"center", gap:10, width:"100%",
              padding:"9px 10px", marginBottom:2, borderRadius:8,
              border:"none", cursor:"pointer", textAlign:"left",
              background: active
                ? item.ai ? "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(29,78,216,0.15))"
                           : "rgba(56,189,248,0.12)"
                : "transparent",
              borderLeft: active
                ? `2px solid ${item.ai ? T.purple : T.blue}`
                : "2px solid transparent",
              color: active ? (item.ai ? T.purpleB : T.blue) : T.textS,
              fontSize:13, fontWeight: active ? 600 : 400,
              transition:"all 0.15s",
            }}
            onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color=T.textP; }}}
            onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.textS; }}}
            >
              <span style={{ opacity: active ? 1 : 0.6, fontSize:16 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.ai && (
                <span style={{
                  marginLeft:"auto", fontSize:8, padding:"2px 5px",
                  background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.4)",
                  color:T.purple, borderRadius:3, fontWeight:800, letterSpacing:"0.08em",
                }}>AI</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer" style={{ padding:"12px 18px 16px", borderTop:`1px solid ${T.borderS}` }}>
        <div className="sidebar-footer-label" style={{ fontSize:10, color:T.textM, marginBottom:3 }}>Monitoring</div>
        <div className="sidebar-footer-detail" style={{ fontSize:11, color:T.textS }}>12 servers · 24/7</div>
        <div className="sidebar-version" style={{ fontSize:9, color:T.textM, marginTop:6, fontFamily:"var(--font-mono)" }}>v2.1.0-aiops</div>
      </div>
    </aside>
  );
}

/* ── SVG Icons ── */
function DashIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".7"/></svg>; }
function AnoIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L15 13H1L8 1Z" stroke="currentColor" strokeWidth="1.4" fill="none"/><line x1="8" y1="6" x2="8" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.8" fill="currentColor"/></svg>; }
function LogIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><line x1="2" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity=".6"/><line x1="2" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity=".35"/></svg>; }
function SrvIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="10" width="14" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity=".55"/><circle cx="12.5" cy="4" r="1" fill="currentColor"/><circle cx="12.5" cy="12" r="1" fill="currentColor" opacity=".55"/></svg>; }
function AIIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polygon points="8,1 11,6 15,6 12,9.5 13,14 8,11.5 3,14 4,9.5 1,6 5,6" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>; }
