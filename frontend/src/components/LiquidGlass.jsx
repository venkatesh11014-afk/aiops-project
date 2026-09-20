import { useRef } from "react";

/*
 * The material is deliberately implemented once. Components below only choose
 * layout defaults; all translucency, lighting, depth and interaction live in
 * the .liquid-glass rules in styles.css.
 */
const STRENGTHS = {
  thin: { blur: 2, saturation: 125, opacity: 0.42, tint: "rgba(218, 232, 255, .035)" },
  regular: { blur: 1, saturation: 135, opacity: 0.58, tint: "rgba(218, 232, 255, .055)" },
  thick: { blur: 0, saturation: 145, opacity: 0.72, tint: "rgba(218, 232, 255, .075)" },
};

const LEGACY_VARIANTS = {
  default: "regular",
  critical: "regular",
  warning: "regular",
  success: "thin",
  purple: "regular",
};

function usePointerLight(enabled) {
  const ref = useRef(null);

  const onPointerMove = (event) => {
    if (!enabled || !ref.current) return;
    const bounds = ref.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    ref.current.style.setProperty("--glass-pointer-x", `${x}%`);
    ref.current.style.setProperty("--glass-pointer-y", `${y}%`);
  };

  const onPointerLeave = () => {
    if (!ref.current) return;
    ref.current.style.removeProperty("--glass-pointer-x");
    ref.current.style.removeProperty("--glass-pointer-y");
  };

  return { ref, onPointerMove, onPointerLeave };
}

export default function LiquidGlass({
  children,
  variant = "regular",
  intensity,
  radius,
  padding = "20px 24px",
  style,
  className = "",
  onClick,
  shimmer = true,
  tilt = false,
  glow = false,
  as: Element = "div",
  ...props
}) {
  const strength = STRENGTHS[variant] || STRENGTHS[LEGACY_VARIANTS[variant]] || STRENGTHS.regular;
  const pointer = usePointerLight(shimmer);
  const classNames = [
    "liquid-glass",
    variant in LEGACY_VARIANTS ? `liquid-glass--${variant}` : "",
    tilt ? "liquid-glass--tilt" : "",
    glow ? "liquid-glass--emphasis" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <Element
      ref={pointer.ref}
      className={classNames}
      onClick={onClick}
      onPointerMove={pointer.onPointerMove}
      onPointerLeave={pointer.onPointerLeave}
      style={{
        "--glass-blur": `${strength.blur}px`,
        "--glass-saturation": `${strength.saturation}%`,
        "--glass-opacity": strength.opacity,
        "--glass-tint": strength.tint,
        ...(radius !== undefined ? { "--glass-radius": typeof radius === "number" ? `${radius}px` : radius } : {}),
        ...(intensity === "subtle" ? { "--glass-opacity": 0.42, "--glass-blur": "6px" } : {}),
        ...(intensity === "strong" ? { "--glass-opacity": 0.72, "--glass-blur": "16px" } : {}),
        padding,
        ...style,
      }}
      {...props}
    >
      <span className="liquid-glass__reflection" aria-hidden="true" />
      <span className="liquid-glass__highlight" aria-hidden="true" />
      <span className="liquid-glass__depth" aria-hidden="true" />
      <span className="liquid-glass__content">{children}</span>
    </Element>
  );
}

export function GlassCard({ children, ...props }) {
  return <LiquidGlass variant="regular" {...props}>{children}</LiquidGlass>;
}

export function GlassPanel({ children, style = {}, ...props }) {
  return <LiquidGlass variant="thick" padding="20px" style={{ width: "100%", ...style }} {...props}>{children}</LiquidGlass>;
}

export function GlassButton({ children, className = "", ...props }) {
  return <LiquidGlass as="button" variant="thin" className={`glass-button ${className}`} padding="9px 14px" {...props}>{children}</LiquidGlass>;
}

export function GlassInput({ children, className = "", ...props }) {
  return (
    <LiquidGlass as="label" variant="thin" className={`glass-input ${className}`} padding="0">
      <input {...props} />
      {children}
    </LiquidGlass>
  );
}

export function GlassModal({ children, ...props }) {
  return <LiquidGlass variant="thick" className="glass-modal" {...props}>{children}</LiquidGlass>;
}

export function GlassSidebar({ children, ...props }) {
  return <LiquidGlass variant="regular" className="glass-sidebar" padding="0" {...props}>{children}</LiquidGlass>;
}

export function GlassNavbar({ children, ...props }) {
  return <LiquidGlass variant="regular" className="glass-navbar" padding="0" {...props}>{children}</LiquidGlass>;
}

export function GlassBadge({ children, ...props }) {
  return <LiquidGlass variant="thin" className="glass-badge" padding="3px 8px" {...props}>{children}</LiquidGlass>;
}

export function GlassCritical({ children, ...props }) {
  return <LiquidGlass variant="critical" glow {...props}>{children}</LiquidGlass>;
}

export function GlassWarning({ children, ...props }) {
  return <LiquidGlass variant="warning" {...props}>{children}</LiquidGlass>;
}

export function GlassSuccess({ children, ...props }) {
  return <LiquidGlass variant="success" {...props}>{children}</LiquidGlass>;
}

export function GlassPurple({ children, ...props }) {
  return <LiquidGlass variant="purple" {...props}>{children}</LiquidGlass>;
}

export function GlassStatCard({ label, value, unit, icon, color = "#8db9f5", sub, children, variant = "regular" }) {
  return (
    <LiquidGlass variant={variant} tilt padding="18px 20px">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 22, lineHeight: 1 }}>{icon}</div>
        <div style={{ fontSize: 30, fontWeight: 800, color, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
          {value}
          {unit && <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(235,243,255,.45)", marginLeft: 4 }}>{unit}</span>}
        </div>
        <div style={{ fontSize: 11, color: "rgba(235,243,255,.55)", letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: "rgba(235,243,255,.32)" }}>{sub}</div>}
        {children}
      </div>
    </LiquidGlass>
  );
}

export function GlassAlert({ severity = "LOW", message, server, autoFixed, onFix, fixing }) {
  const variant = severity === "CRITICAL" ? "critical" : severity === "LOW" ? "success" : "warning";
  return (
    <LiquidGlass variant={variant} padding="12px 14px" radius={10} glow={severity === "CRITICAL"}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <SeverityPill level={severity} />
        {autoFixed && <span className="glass-status glass-status--success">AUTO-FIXED</span>}
      </div>
      <div style={{ fontSize: 12, color: "rgba(240,248,255,.84)", lineHeight: 1.5 }}>{message}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 10, color: "rgba(235,243,255,.34)" }}>{server}</span>
        {!autoFixed && onFix && <button className="glass-action" onClick={onFix} disabled={fixing}>{fixing ? "Fixing..." : "Fix"}</button>}
      </div>
    </LiquidGlass>
  );
}

function SeverityPill({ level }) {
  return <span className={`glass-status glass-status--${level.toLowerCase()}`}>{level}</span>;
}
