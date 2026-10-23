import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { api } from "../utils/api";
import { ServerCard, StatusDot, T } from "../components/UI";

export default function Servers() {
  const reduceMotion = useReducedMotion();
  const [servers,  setServers]  = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(()=>{
    const load=async()=>{
      const d=await api.get("/servers");
      setServers(d);
      setSelected(current => current || (d.length ? d[0] : null));
    };
    load();
    const t=setInterval(load,5000);
    return()=>clearInterval(t);
  },[]);

  const counts={
    healthy:  servers.filter(s=>s.status==="healthy").length,
    warning:  servers.filter(s=>s.status==="warning").length,
    critical: servers.filter(s=>s.status==="critical").length,
  };

  const sel = servers.find(s=>s.name===selected?.name)||selected;
  const statusColor = sel ? ({healthy:T.green,warning:T.amber,critical:T.red}[sel.status]||T.green) : T.green;
  const metrics = sel ? [
    { label:"CPU utilization", value:sel.cpu, color:"#38bdf8" },
    { label:"Memory usage", value:sel.memory, color:"#8b5cf6" },
    { label:"Disk usage", value:sel.disk, color:"#f59e0b" },
  ] : [];

  return (
    <div className="page-enter" style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Summary */}
      <div className="fleet-status-summary" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[
          {label:"Healthy",  count:counts.healthy,  color:T.green,  bg:"rgba(16,185,129,0.08)",  border:"rgba(16,185,129,0.2)"},
          {label:"Warning",  count:counts.warning,  color:T.amber,  bg:"rgba(245,158,11,0.08)",  border:"rgba(245,158,11,0.22)"},
          {label:"Critical", count:counts.critical, color:T.red,    bg:"rgba(239,68,68,0.08)",   border:"rgba(239,68,68,0.25)"},
        ].map(s=>(
          <div key={s.label} className="fleet-status-summary-card" style={{
            display:"flex",alignItems:"center",gap:14,
            padding:"14px 18px",borderRadius:12,
            background:s.bg,border:`1px solid ${s.border}`,
          }}>
            <div className="fleet-detail-card" style={{
              width:42,height:42,borderRadius:"50%",
              background:`${s.color}18`,border:`2px solid ${s.color}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"var(--font-display)",fontSize:22,fontWeight:800,color:s.color,
            }}>{s.count}</div>
            <div>
              <div className="fleet-status-summary-label" style={{fontFamily:"var(--font-display)",fontSize:14,fontWeight:700,color:"#fff"}}>{s.label}</div>
              <div className="fleet-status-summary-caption" style={{fontSize:10,color:"rgba(255,255,255,.68)",marginTop:1}}>servers</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grid + detail */}
      <div className="fleet-layout">
        {/* Grid */}
        <div className="fleet-server-grid">
          {servers.map(s=>(
            <ServerCard key={s.name} server={s}
              selected={sel?.name===s.name}
              onClick={()=>setSelected(s)} />
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait" initial={false}>
          {sel&&(
            <motion.div
              key={sel.name}
              className="fleet-inspector-column"
              initial={reduceMotion ? false : { opacity:0, x:18 }}
              animate={{ opacity:1, x:0 }}
              exit={reduceMotion ? { opacity:0 } : { opacity:0, x:12 }}
              transition={{ duration:reduceMotion ? 0 : 0.24, ease:"easeOut" }}
            >
              <h2 className="fleet-inspector-panel-title">Selected server</h2>
              <aside className="fleet-inspector" aria-label={`Details for ${sel.name}`}>
              <div className="fleet-inspector-heading">
                <div className="fleet-inspector-icon" style={{color:statusColor}}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="4" y="3" width="16" height="7" rx="2" />
                    <rect x="4" y="14" width="16" height="7" rx="2" />
                    <path d="M8 6.5h.01M8 17.5h.01M12 6.5h4M12 17.5h4" />
                  </svg>
                </div>
                <div className="fleet-inspector-title">
                  <span>SERVER DETAILS</span>
                  <h2>{sel.name}</h2>
                </div>
              </div>

              <div className="fleet-inspector-status" style={{"--fleet-status":statusColor}}>
                <StatusDot color={statusColor} size={7} pulse={sel.status!=="healthy"} />
                <span>{sel.status.toUpperCase()}</span>
                <span className="fleet-inspector-live">LIVE MONITORING</span>
              </div>

              <div className="fleet-inspector-section-label">RESOURCE UTILIZATION</div>
              <div className="fleet-inspector-metrics">
                {metrics.map(metric=>(
                  <div className="fleet-inspector-metric" key={metric.label}>
                    <div className="fleet-inspector-metric-heading">
                      <span>{metric.label}</span>
                      <strong style={{color:metric.color}}>{metric.value.toFixed(1)}%</strong>
                    </div>
                    <div className="fleet-inspector-track">
                      <motion.div
                        className="fleet-inspector-fill"
                        style={{background:metric.color}}
                        initial={reduceMotion ? false : {width:0}}
                        animate={{width:`${Math.min(100,Math.max(0,metric.value))}%`}}
                        transition={{duration:reduceMotion ? 0 : 0.55,ease:"easeOut"}}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="fleet-inspector-section-label">ACTIVITY & AVAILABILITY</div>
              <div className="fleet-inspector-facts">
                <div>
                  <span>Uptime</span>
                  <strong>{sel.uptime}</strong>
                </div>
                <div>
                  <span>Requests per second</span>
                  <strong>{sel.requests_per_sec.toLocaleString()} req/s</strong>
                </div>
                <div>
                  <span>Last checked</span>
                  <strong>{new Date(sel.last_checked).toLocaleTimeString()}</strong>
                </div>
              </div>

              <div className="fleet-inspector-foot">
                <span className="fleet-inspector-foot-dot" />
                Metrics refresh automatically
              </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
