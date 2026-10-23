/**
 * AIOps Design System — All reusable primitives
 *
 * Inspired by 21st.dev components:
 *  - Glowing Card        → StatCard
 *  - Advanced Stats      → MetricRow
 *  - Alert Badge         → SeverityBadge, AlertCard
 *  - Status Indicator    → StatusDot, LiveBadge
 *  - Data Stream / Log Viewer → LogRow
 *  - Server Card         → ServerCard
 *  - HUD Area Chart      → ChartPanel
 *  - AI Message Bubble   → ChatBubble
 *  - Status Bar          → TopBar status pills
 */

import { useEffect, useRef, useState } from "react";

/* ════════════════════════════════════════════
   TOKENS (inline — mirrors CSS vars for JS use)
════════════════════════════════════════════ */
export const T = {
  bgBase:    "#030814",
  bgSurface: "#07111f",
  bgElevated:"#0a192b",
  bgOverlay: "#10243b",
  blue:      "#38bdf8",
  blueDim:   "#0c4a6e",
  purple:    "#7c3aed",
  purpleB:   "#a78bfa",
  green:     "#10b981",
  amber:     "#f59e0b",
  red:       "#ef4444",
  cyan:      "#22d3ee",
  textP:     "#f0f6ff",
  textS:     "#7a9cc8",
  textM:     "#2e4a72",
  border:    "rgba(76,177,232,0.24)",
  borderS:   "rgba(70,157,208,0.13)",
};

/* ════════════════════════════════════════════
   STATUS DOT — inspired by 21st Status Indicator
════════════════════════════════════════════ */
export function StatusDot({ color = T.green, size = 7, pulse = true }) {
  return (
    <span style={{
      display: "inline-block",
      width: size, height: size, borderRadius: "50%",
      background: color,
      boxShadow: `0 0 ${size}px ${color}`,
      animation: pulse ? "livePulse 2s ease-in-out infinite" : "none",
      flexShrink: 0,
    }} />
  );
}

/* ════════════════════════════════════════════
   LIVE BADGE — "● LIVE" indicator
════════════════════════════════════════════ */
export function LiveBadge() {
  return (
    <div className="live-badge" style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "4px 10px",
      background: "rgba(56,189,248,0.08)",
      border: "1px solid rgba(56,189,248,0.22)",
      borderRadius: 20,
    }}>
      <StatusDot color={T.blue} size={6} />
      <span style={{ fontSize: 10, color: T.blue, fontWeight: 700, letterSpacing: "0.08em" }}>LIVE</span>
    </div>
  );
}

/* ════════════════════════════════════════════
   SEVERITY BADGE — inspired by 21st Alert Badge
════════════════════════════════════════════ */
const SEV = {
  CRITICAL: { bg:"rgba(239,68,68,0.15)",  border:"rgba(239,68,68,0.4)",  color:"#fca5a5", dot:"#ef4444" },
  HIGH:     { bg:"rgba(249,115,22,0.15)", border:"rgba(249,115,22,0.4)", color:"#fdba74", dot:"#f97316" },
  MEDIUM:   { bg:"rgba(245,158,11,0.15)", border:"rgba(245,158,11,0.4)", color:"#fde68a", dot:"#f59e0b" },
  LOW:      { bg:"rgba(16,185,129,0.12)", border:"rgba(16,185,129,0.35)",color:"#6ee7b7", dot:"#10b981" },
  INFO:     { bg:"rgba(56,189,248,0.12)", border:"rgba(56,189,248,0.3)", color:"#bae6fd", dot:"#38bdf8" },
};

export function SeverityBadge({ level = "INFO", size = "sm" }) {
  const c = SEV[level] || SEV.INFO;
  const pad = size === "sm" ? "2px 7px" : "4px 10px";
  const fs  = size === "sm" ? 9 : 11;
  return (
    <span className="alert-severity-badge" data-level={level} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: pad, borderRadius: 4,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.color, fontSize: fs, fontWeight: 700, letterSpacing: "0.07em",
      fontFamily: "var(--font-body)",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {level}
    </span>
  );
}

/* ════════════════════════════════════════════
   STAT CARD — inspired by 21st Glowing Card + Advanced Stats
   Reused on: Dashboard (×5), summary rows
════════════════════════════════════════════ */
export function StatCard({ label, value, unit = "", icon, color = T.blue, sub, trend, variant = "default", tilt = true }) {
  const ref = useRef(null);
  const sheen = useRef(null);

  // Mouse-parallax tilt + sheen
  useEffect(() => {
    if (!tilt) return;
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${x*5}deg) rotateX(${-y*5}deg) scale(1.015)`;
      if (sheen.current) {
        const px = ((e.clientX - r.left) / r.width) * 100;
        const py = ((e.clientY - r.top)  / r.height) * 100;
        sheen.current.style.background = `radial-gradient(ellipse 55% 45% at ${px}% ${py}%, rgba(255,255,255,0.09) 0%, transparent 70%)`;
      }
    };
    const leave = () => { el.style.transform = ""; if (sheen.current) sheen.current.style.background = ""; };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, [tilt]);

  const glowColor = {
    default: "rgba(56,189,248,0.12)",
    critical:"rgba(239,68,68,0.15)",
    warning: "rgba(245,158,11,0.12)",
    success: "rgba(16,185,129,0.12)",
    purple:  "rgba(124,58,237,0.15)",
  }[variant] || "rgba(56,189,248,0.12)";

  return (
    <div ref={ref} className="stat-card" data-highlight-stat={
      ["Logs Today", "Auto-Fixed", "Revenue Saved", "Threats Blocked"].includes(label) ? "true" : undefined
    } data-stat-variant={variant} style={{
      background: T.bgSurface,
      border: `1px solid ${T.borderS}`,
      borderRadius: 14, padding: "18px 20px",
      position: "relative", overflow: "hidden",
      cursor: "default",
      transition: "border-color 0.2s, box-shadow 0.2s, transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94)",
      willChange: "transform",
      boxShadow: `0 0 0 1px transparent, 0 8px 32px rgba(0,0,0,0.28)`,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = "rgba(80,140,240,0.3)";
      e.currentTarget.style.boxShadow = `0 0 28px ${glowColor}, 0 8px 32px rgba(0,0,0,0.3)`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = T.borderS;
      e.currentTarget.style.boxShadow = "0 0 0 1px transparent, 0 8px 32px rgba(0,0,0,0.28)";
    }}>

      {/* Top gradient line */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
        background:`linear-gradient(90deg, transparent, ${color}, transparent)`, pointerEvents:"none" }} />

      {/* Top-left specular */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"50%",
        background:"linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
        pointerEvents:"none" }} />

      {/* Mouse sheen */}
      <div ref={sheen} style={{ position:"absolute", inset:0, borderRadius:"inherit", pointerEvents:"none", transition:"background 0.08s" }} />

      {/* Content */}
      <div style={{ position:"relative", zIndex:1 }}>
        <div style={{ fontSize:20, marginBottom:10 }}>{icon}</div>
        <div className="num-roll" style={{
          fontFamily:"var(--font-display)", fontSize:30, fontWeight:800,
          color, lineHeight:1, letterSpacing:"-0.02em",
        }}>
          {value}
          {unit && <span style={{ fontSize:12, fontWeight:400, color:T.textM, marginLeft:4 }}>{unit}</span>}
        </div>
        <div style={{ fontSize:11, color:T.textS, marginTop:6, textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</div>
        {sub  && <div style={{ fontSize:10, color:T.textM, marginTop:3 }}>{sub}</div>}
        {trend && (
          <div style={{ marginTop:8, fontSize:11, color: trend > 0 ? T.green : T.red, fontWeight:600 }}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs yesterday
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   METRIC ROW — compact label/value/bar row
   Reused inside: LiveMetrics panel, server detail
════════════════════════════════════════════ */
export function MetricRow({ label, value, unit = "%", color = T.blue, showBar = true }) {
  const barColor = value > 85 ? T.red : value > 70 ? T.amber : color;
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span className="metric-row-label" style={{ fontSize:11, color:T.textS }}>{label}</span>
        <span style={{ fontSize:12, fontWeight:700, color:barColor, fontFamily:"var(--font-mono)" }}>
          {typeof value === "number" ? value.toLocaleString() : value}{unit}
        </span>
      </div>
      {showBar && unit === "%" && (
        <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:10 }}>
          <div style={{
            height:"100%", width:`${Math.min(100, value)}%`,
            background: barColor, borderRadius:10,
            transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: value > 85 ? `0 0 8px ${barColor}` : "none",
          }} />
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   ALERT CARD — inspired by 21st HeroUI Alert
   Reused on: Dashboard alerts list, Anomaly fixes
════════════════════════════════════════════ */
export function AlertCard({ severity="LOW", message, server, autoFixed, onFix, fixing, className="" }) {
  const c = SEV[severity] || SEV.LOW;
  return (
    <div className={`alert-card slide-in ${className}`} data-severity={severity} style={{
      padding:"12px 14px",
      background:`linear-gradient(135deg, ${c.bg} 0%, rgba(7,15,31,0.6) 100%)`,
      border:`1px solid ${c.border}`,
      borderLeft:`3px solid ${c.dot}`,
      borderRadius:10,
      transition:"border-color 0.2s, box-shadow 0.2s, transform 0.16s ease",
      boxShadow: severity === "CRITICAL" ? `0 0 12px ${c.bg}` : "none",
      animation: severity === "CRITICAL" ? "glowPulse 2.2s ease-in-out infinite" : undefined,
    }}>
      <div className="alert-card-badges" style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
        <SeverityBadge level={severity} />
        {autoFixed && (
          <span style={{
            fontSize:9, padding:"2px 6px", fontWeight:700, letterSpacing:"0.06em",
            background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)",
            color:"#6ee7b7", borderRadius:4,
          }}>AUTO-FIXED ✓</span>
        )}
      </div>
      <p className="alert-card-message" style={{ fontSize:12, color:"rgba(240,246,255,0.8)", lineHeight:1.55, margin:0 }}>{message}</p>
      <div className="alert-card-footer" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
        <span className="alert-card-server" style={{ fontSize:10, color:T.textM, fontFamily:"var(--font-mono)" }}>{server}</span>
        {!autoFixed && onFix && (
          <button className="alert-card-action" onClick={onFix} disabled={fixing} style={{
            padding:"3px 10px", fontSize:10, fontWeight:700,
            background: fixing ? "rgba(12,74,110,0.5)" : "rgba(56,189,248,0.15)",
            color: fixing ? T.textM : T.blue,
            border:`1px solid ${fixing ? "rgba(56,189,248,0.15)" : "rgba(56,189,248,0.4)"}`,
            borderRadius:4, cursor: fixing ? "not-allowed" : "pointer",
            transition:"all 0.15s",
          }}>
            {fixing ? "Fixing…" : "⚡ Fix Now"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   PANEL — generic card wrapper
   Reused: every chart panel, detail panels
════════════════════════════════════════════ */
export function Panel({ children, title, badge, action, style={}, padding="20px" }) {
  return (
    <div className="card" style={{ padding, ...style }}>
      {(title || badge || action) && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          {title && (
            <span className="panel-title" style={{ fontSize:13, fontWeight:600, color:T.textS,
              textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"var(--font-display)" }}>
              {title}
            </span>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {badge}
            {action}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════
   LOG ROW — inspired by 21st Log Viewer + Data Stream
   Reused: LogExplorer stream rows
════════════════════════════════════════════ */
const LOG_LEVEL_STYLE = {
  INFO:     { bg:"rgba(56,189,248,0.1)",  border:"rgba(56,189,248,0.3)",  color:"#bae6fd", row:"transparent" },
  WARN:     { bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.3)",  color:"#fde68a", row:"rgba(245,158,11,0.03)" },
  ERROR:    { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   color:"#fca5a5", row:"rgba(239,68,68,0.04)" },
  CRITICAL: { bg:"rgba(239,68,68,0.18)",  border:"rgba(239,68,68,0.5)",   color:"#ff8080", row:"rgba(239,68,68,0.08)" },
};

export function LogRow({ log, style={} }) {
  const ls = LOG_LEVEL_STYLE[log.level] || LOG_LEVEL_STYLE.INFO;
  return (
    <div className="log-row" style={{
      display:"grid",
      gridTemplateColumns:"140px 68px 150px 120px 1fr",
      gap:0, padding:"5px 14px",
      background: ls.row,
      borderBottom:"1px solid rgba(255,255,255,0.025)",
      fontFamily:"var(--font-mono)",
      fontSize:11, lineHeight:1.4,
      animation:"logFade 0.25s ease-out",
      transition:"background 0.15s, transform 0.15s ease",
      ...style,
    }}
    onMouseEnter={e=>e.currentTarget.style.background="rgba(56,189,248,0.05)"}
    onMouseLeave={e=>e.currentTarget.style.background=ls.row}
    >
      <span style={{ color:T.textM }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
      <span>
        <span style={{
          fontSize:9, padding:"1px 6px", borderRadius:3, fontWeight:700,
          background:ls.bg, border:`1px solid ${ls.border}`, color:ls.color,
        }}>{log.level}</span>
      </span>
      <span style={{ color:T.textS, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{log.server}</span>
      <span style={{ color:T.textM }}>{log.service}</span>
      <span style={{ color: log.level === "INFO" ? "rgba(240,246,255,0.65)" : ls.color,
        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {log.message}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════
   SERVER CARD — inspired by 21st Server Card
   Reused: Servers grid page
════════════════════════════════════════════ */
const SERVER_STATUS = {
  healthy:  { color:T.green,  label:"Healthy",  border:"rgba(16,185,129,0.25)" },
  warning:  { color:T.amber,  label:"Warning",  border:"rgba(245,158,11,0.3)"  },
  critical: { color:T.red,    label:"Critical", border:"rgba(239,68,68,0.35)"  },
};

export function ServerCard({ server, selected, onClick }) {
  const s = SERVER_STATUS[server.status] || SERVER_STATUS.healthy;
  return (
    <button type="button" className={`fleet-server-card${selected ? " is-selected" : ""}`} data-status={server.status} onClick={onClick} aria-pressed={selected} style={{
      display:"block", width:"100%", textAlign:"left", font:"inherit",
      padding:"14px 16px", borderRadius:12, cursor:"pointer",
      background: selected ? T.bgElevated : T.bgSurface,
      border:`1px solid ${selected ? s.border : T.borderS}`,
      borderLeft:`3px solid ${s.color}`,
      boxShadow: selected ? `0 0 20px ${s.color}18` : "none",
      transition:"all 0.18s",
    }}
    onMouseEnter={e=>{ if(!selected){ e.currentTarget.style.borderColor=s.border; e.currentTarget.style.background=T.bgElevated; }}}
    onMouseLeave={e=>{ if(!selected){ e.currentTarget.style.borderColor=T.borderS; e.currentTarget.style.background=T.bgSurface; }}}
    >
      <div className="fleet-server-card-header">
        <div className="fleet-server-card-identity">
          <span className="fleet-server-card-glyph" style={{"--server-accent":s.color}} aria-hidden="true">
            <svg viewBox="0 0 20 20">
              <rect x="3.5" y="2.5" width="13" height="6" rx="1.5" />
              <rect x="3.5" y="11.5" width="13" height="6" rx="1.5" />
              <path d="M6.5 5.5h.01M6.5 14.5h.01M9 5.5h4M9 14.5h4" />
            </svg>
          </span>
          <span className="fleet-server-card-name">{server.name}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <StatusDot color={s.color} size={6} pulse={server.status !== "healthy"} />
          <span style={{ fontSize:9, color:s.color, fontWeight:700, letterSpacing:"0.06em" }}>{s.label.toUpperCase()}</span>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {[
          { l:"CPU",    v:server.cpu,    c:"#38bdf8" },
          { l:"MEMORY", v:server.memory, c:"#8b5cf6" },
          { l:"DISK",   v:server.disk,   c:"#f59e0b" },
        ].map(m => (
          <div key={m.l}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ fontSize:9, color:T.textM, letterSpacing:"0.06em" }}>{m.l}</span>
              <span style={{ fontSize:10, fontWeight:700, color: m.v>85?T.red:m.c, fontFamily:"var(--font-mono)" }}>{m.v}%</span>
            </div>
            <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:10 }}>
              <div style={{
                height:"100%", width:`${Math.min(100,m.v)}%`,
                background: m.v>85?T.red:m.v>70?T.amber:m.c,
                borderRadius:10, transition:"width 0.5s",
                boxShadow: m.v>85?`0 0 6px ${T.red}`:undefined,
              }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
        <span style={{ fontSize:9, color:T.textM, fontFamily:"var(--font-mono)" }}>↑ {server.uptime}</span>
        <span style={{ fontSize:9, color:T.textM }}>{server.requests_per_sec} req/s</span>
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════
   CHAT BUBBLE — inspired by 21st AI Message Bubble
   Reused: Copilot page messages
════════════════════════════════════════════ */
export function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display:"flex", gap:10,
      flexDirection: isUser ? "row-reverse" : "row",
      marginBottom:18,
      animation:"fadeUp 0.22s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {/* Avatar */}
      <div style={{
        width:32, height:32, borderRadius:isUser?8:"50%",
        flexShrink:0,
        background: isUser
          ? "linear-gradient(135deg, #1d4ed8, #6d28d9)"
          : "linear-gradient(135deg, #0d9488, #1d4ed8)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:13, fontWeight:700, color:"white",
        border:`1px solid ${isUser?"rgba(99,102,241,0.4)":"rgba(14,165,233,0.4)"}`,
        boxShadow: isUser?"0 0 12px rgba(109,40,217,0.3)":"0 0 12px rgba(13,148,136,0.3)",
      }}>
        {isUser ? "OP" : <img src="/logo.png" alt="" width={32} height={32} style={{ objectFit:"contain" }} />}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth:"75%" }}>
        <div className={`copilot-message-bubble${isUser ? " is-user" : ""}`} style={{
          padding:"11px 15px",
          background: isUser
            ? "linear-gradient(135deg, rgba(29,78,216,0.25), rgba(109,40,217,0.2))"
            : "rgba(10,22,40,0.7)",
          border:`1px solid ${isUser?"rgba(99,102,241,0.3)":"rgba(80,140,240,0.18)"}`,
          borderRadius: isUser ? "12px 3px 12px 12px" : "3px 12px 12px 12px",
          fontSize:13, lineHeight:1.65, color:"rgba(240,246,255,0.88)",
          backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
          whiteSpace:"pre-wrap",
          boxShadow: isUser
            ? "0 4px 20px rgba(109,40,217,0.15)"
            : "0 4px 20px rgba(0,0,0,0.25)",
        }}>
          {msg.content}
        </div>
        <div style={{ fontSize:10, color:T.textM, marginTop:4,
          textAlign:isUser?"right":"left", fontFamily:"var(--font-mono)" }}>
          {new Date(msg.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   CHIP — suggestion / filter pill
   Reused: Copilot suggestions, log level filter
════════════════════════════════════════════ */
export function Chip({ label, active, color=T.blue, onClick }) {
  return (
    <button className="ui-chip" onClick={onClick} style={{
      padding:"5px 12px", fontSize:11, fontWeight:500,
      borderRadius:20, border:"none", cursor:"pointer",
      background: active ? `${color}22` : "rgba(255,255,255,0.04)",
      color: active ? color : T.textS,
      outline: active ? `1px solid ${color}44` : "1px solid rgba(255,255,255,0.07)",
      transition:"all 0.15s",
    }}
    onMouseEnter={e=>{ if(!active){ e.currentTarget.style.color=color; e.currentTarget.style.outline=`1px solid ${color}33`; }}}
    onMouseLeave={e=>{ if(!active){ e.currentTarget.style.color=T.textS; e.currentTarget.style.outline="1px solid rgba(255,255,255,0.07)"; }}}
    >
      {label}
    </button>
  );
}

/* ════════════════════════════════════════════
   ICON BUTTON — small action button
════════════════════════════════════════════ */
export function IconBtn({ icon, label, onClick, active=false }) {
  return (
    <button className="ui-icon-btn" onClick={onClick} data-tip={label} style={{
      width:32, height:32, borderRadius:8, border:"none", cursor:"pointer",
      background: active ? "rgba(56,189,248,0.18)" : "rgba(255,255,255,0.04)",
      color: active ? T.blue : T.textS,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:14, transition:"all 0.15s",
      outline: active ? "1px solid rgba(56,189,248,0.35)" : "1px solid rgba(255,255,255,0.07)",
    }}
    onMouseEnter={e=>{ e.currentTarget.style.background="rgba(56,189,248,0.12)"; e.currentTarget.style.color=T.blue; }}
    onMouseLeave={e=>{ e.currentTarget.style.background=active?"rgba(56,189,248,0.18)":"rgba(255,255,255,0.04)"; e.currentTarget.style.color=active?T.blue:T.textS; }}
    >
      {icon}
    </button>
  );
}

/* ════════════════════════════════════════════
   PRIMARY BUTTON
════════════════════════════════════════════ */
export function PrimaryBtn({ children, onClick, disabled, loading, full=false, className="" }) {
  return (
    <button className={className} onClick={onClick} disabled={disabled||loading} style={{
      padding:"9px 20px", fontSize:13, fontWeight:700,
      borderRadius:8, border:"none", cursor:disabled||loading?"not-allowed":"pointer",
      background: disabled||loading
        ? "rgba(30,58,100,0.4)"
        : "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
      color: disabled||loading ? T.textM : "white",
      width: full ? "100%" : undefined,
      transition:"all 0.15s",
      boxShadow: disabled||loading ? "none" : "0 4px 16px rgba(56,189,248,0.24)",
      position:"relative", overflow:"hidden",
    }}>
      {loading && (
        <span style={{
          position:"absolute", inset:0,
          background:"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
          backgroundSize:"200% 100%",
          animation:"shimmer 1.5s infinite",
        }} />
      )}
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════
   SEARCH INPUT
   Reused: LogExplorer, future search bars
════════════════════════════════════════════ */
export function SearchInput({ value, onChange, onEnter, placeholder="Search…" }) {
  return (
    <div className="log-search-input" style={{
      display:"flex", alignItems:"center", gap:0,
      background:"rgba(4,8,18,0.8)", border:"1px solid rgba(80,140,240,0.2)",
      borderRadius:8, overflow:"hidden", flex:1,
      transition:"border-color 0.15s",
    }}
    onFocusCapture={e=>e.currentTarget.style.borderColor="rgba(100,160,255,0.5)"}
    onBlurCapture={e=>e.currentTarget.style.borderColor="rgba(80,140,240,0.2)"}
    >
      <span style={{ padding:"0 12px", color:T.textM, fontSize:16, lineHeight:1 }}>⌕</span>
      <input
        value={value}
        onChange={e=>onChange(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&onEnter?.()}
        placeholder={placeholder}
        style={{
          flex:1, background:"transparent", border:"none", outline:"none",
          color:T.textP, fontSize:13, padding:"10px 0",
          fontFamily:"var(--font-body)", caretColor:T.blue,
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════
   TYPING DOTS — for AI loading state
════════════════════════════════════════════ */
export function TypingDots() {
  return (
    <div style={{ display:"flex", gap:5, alignItems:"center", padding:"4px 0" }}>
      {[0,1,2].map(i=>(
        <div key={i} style={{
          width:7, height:7, borderRadius:"50%", background:T.blue,
          animation:`numRoll 1.2s ${i*0.2}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   HEALTH RING — animated SVG ring gauge
   Unique to Dashboard health score card
════════════════════════════════════════════ */
export function HealthRing({ score=94, size=80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  const color = score>90?T.green:score>75?T.amber:T.red;
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={5}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition:"stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)", filter:`drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div style={{
        position:"absolute", inset:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
      }}>
        <span style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:800, color, lineHeight:1 }}>{score}</span>
        <span style={{ fontSize:8, color:T.textM, letterSpacing:"0.05em" }}>SCORE</span>
      </div>
    </div>
  );
}
