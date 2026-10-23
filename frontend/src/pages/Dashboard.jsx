import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { api } from "../utils/api";
import { StatCard, MetricRow, AlertCard, Panel, HealthRing, T } from "../components/UI";

const CHART_TIP = {
  contentStyle:{
    background:"rgba(7,15,31,0.97)", border:"1px solid rgba(80,140,240,0.22)",
    borderRadius:10, backdropFilter:"blur(16px)", fontSize:11,
  }
};

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts,  setAlerts]  = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [fixing,  setFixing]  = useState(null);

  const load = async () => {
    try {
      const [s,h,a,m] = await Promise.all([
        api.get("/stats"), api.get("/metrics/history?hours=3"),
        api.get("/alerts"), api.get("/metrics"),
      ]);
      setStats(s); setHistory(h); setAlerts(a); setMetrics(m);
    } catch {}
  };

  useEffect(() => { load(); const t = setInterval(load, 5000); return ()=>clearInterval(t); }, []);

  const handleFix = async (alert) => {
    setFixing(alert.id);
    await api.post("/remediate", { issue_type: alert.type });
    setTimeout(() => { setFixing(null); load(); }, 2000);
  };

  const hs = stats?.health_score || 94;

  return (
    <div className="page-enter" style={{ display:"flex", flexDirection:"column", gap:18 }}>

      {/* ── Stat Row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }}>
        {/* Health Score — special ring card */}
        <div className="card" style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
          <HealthRing score={hs} size={72} />
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:12, fontWeight:700, color:T.textS,
              textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>Health Score</div>
            <div style={{ fontSize:10, color:T.textM }}>12 servers monitored</div>
            <div style={{ marginTop:6, fontSize:10,
              color: hs>90?T.green:hs>75?T.amber:T.red, fontWeight:600 }}>
              {hs>90?"● Excellent":hs>75?"● Degraded":"● Critical"}
            </div>
          </div>
        </div>

        <StatCard label="Logs Today"     value={((stats?.total_logs_today||0)/1000).toFixed(0)} unit="K"
          icon={<LogsIcon/>} color={T.blue} sub="Processed real-time" />
        <StatCard label="Auto-Fixed"     value={stats?.auto_fixed||0}  unit="issues"
          icon={<FixIcon/>}  color={T.green} sub="Zero human needed" variant="success" />
        <StatCard label="Threats Blocked" value={stats?.threats_blocked||0} unit="today"
          icon={<ShieldIcon/>} color={T.purpleB} sub="Security events" variant="purple" />
        <StatCard label="Revenue Saved"  value={`$${((stats?.revenue_saved||0)/1000).toFixed(0)}K`}
          icon={<CoinsIcon/>} color={T.amber} sub="Prevented downtime" variant="warning" />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
        {/* CPU / Memory area chart */}
        <Panel title="CPU & Memory — Last 3 Hours" badge={<LiveBadgeMini />}>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="gcpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gmem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.08)" />
              <XAxis dataKey="time" tick={{fill:T.textM,fontSize:10}} tickLine={false} axisLine={false} />
              <YAxis tick={{fill:T.textM,fontSize:10}} tickLine={false} axisLine={false} domain={[0,100]} />
              <Tooltip {...CHART_TIP} />
              <Area type="monotone" dataKey="cpu"    stroke="#38bdf8" fill="url(#gcpu)" strokeWidth={2}
                name="CPU %" dot={false} />
              <Area type="monotone" dataKey="memory" stroke="#7c3aed" fill="url(#gmem)" strokeWidth={2}
                name="Memory %" dot={false} />
              <Legend wrapperStyle={{fontSize:11,color:T.textS}} iconType="circle" iconSize={7} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        {/* Error rate bars */}
        <Panel title="Error Rate">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={history.slice(-20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.08)" />
              <XAxis dataKey="time" tick={{fill:T.textM,fontSize:9}} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{fill:T.textM,fontSize:10}} tickLine={false} axisLine={false} />
              <Tooltip {...CHART_TIP} />
              <Bar dataKey="errors" fill="rgba(239,68,68,0.65)" radius={[3,3,0,0]} name="Errors"
                style={{filter:"drop-shadow(0 0 4px rgba(239,68,68,0.5))"}} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* ── Live Metrics + Alerts ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:14 }}>
        {/* Live metrics */}
        <Panel title="Live Metrics">
          {metrics && [
            { label:"CPU Usage",     value:metrics.cpu,              color:T.blue   },
            { label:"Memory",        value:metrics.memory,           color:"#7c3aed"},
            { label:"Disk Usage",    value:metrics.disk,             color:T.amber  },
            { label:"Network In",    value:metrics.network_in,       color:T.green, unit:" MB/s" },
            { label:"Avg Response",  value:metrics.avg_response_ms,  color:T.cyan,  unit:" ms", showBar:false },
            { label:"Requests/sec",  value:metrics.requests_per_sec, color:T.purpleB, unit:"", showBar:false },
          ].map(m => <MetricRow key={m.label} {...m} />)}
        </Panel>

        {/* Alerts */}
        <Panel
          title="Active Alerts"
          badge={
            <span className="active-alert-count" style={{ fontSize:10, padding:"2px 8px",
              background:T.redSoft||"rgba(239,68,68,0.12)",
              border:"1px solid rgba(239,68,68,0.3)",
              color:"#fca5a5", borderRadius:4, fontWeight:700 }}>
              {alerts.length} ACTIVE
            </span>
          }
        >
          <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:265, overflowY:"auto" }}>
            {alerts.map(a => (
              <AlertCard key={a.id} severity={a.severity} message={a.message}
                server={a.server} autoFixed={a.auto_fixed}
                onFix={() => handleFix(a)} fixing={fixing===a.id} />
            ))}
          </div>
        </Panel>
      </div>

      {/* ── Response Time Chart ── */}
      <Panel title="Response Time & Throughput">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,189,248,0.08)" />
            <XAxis dataKey="time" tick={{fill:T.textM,fontSize:10}} tickLine={false} axisLine={false} interval={5} />
            <YAxis yAxisId="l" tick={{fill:T.textM,fontSize:10}} tickLine={false} axisLine={false} />
            <YAxis yAxisId="r" orientation="right" tick={{fill:T.textM,fontSize:10}} tickLine={false} axisLine={false} />
            <Tooltip {...CHART_TIP} />
            <Line yAxisId="l" type="monotone" dataKey="response_ms" stroke={T.amber}  strokeWidth={2} dot={false} name="Response (ms)" />
            <Line yAxisId="r" type="monotone" dataKey="requests"    stroke={T.green}  strokeWidth={2} dot={false} name="Requests/min" />
            <Legend wrapperStyle={{fontSize:11,color:T.textS}} iconType="circle" iconSize={7} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

function LiveBadgeMini() {
  return (
    <div className="dashboard-live-badge" style={{ display:"flex", alignItems:"center", gap:5 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:T.blue,
        display:"inline-block", animation:"livePulse 2s infinite", boxShadow:`0 0 6px ${T.blue}` }} />
      <span className="dashboard-live-label" style={{ fontSize:9, color:T.blue, fontWeight:700, letterSpacing:"0.08em" }}>LIVE</span>
    </div>
  );
}

// Inline SVG icons (no deps)
const LogsIcon   = () => <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><rect x="2" y="4" width="14" height="1.5" rx=".75" fill="currentColor"/><rect x="2" y="8" width="10" height="1.5" rx=".75" fill="currentColor" opacity=".6"/><rect x="2" y="12" width="7" height="1.5" rx=".75" fill="currentColor" opacity=".35"/></svg>;
const FixIcon    = () => <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M9 2L16 14H2L9 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M9 7v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="12" r="1" fill="currentColor"/></svg>;
const ShieldIcon = () => <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M9 2L15 5v5c0 3.5-3 5.5-6 7C6 15.5 3 13.5 3 10V5L9 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CoinsIcon  = () => <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M9 6v1.5M9 10.5V12M7.5 8.5h2a.5.5 0 010 1h-1a.5.5 0 000 1H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
