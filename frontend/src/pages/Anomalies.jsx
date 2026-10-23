import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerChild, cardVariants } from "../motion";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../utils/api";
import { SeverityBadge, Panel, PrimaryBtn, T } from "../components/UI";

const SEV_CFG = {
  CRITICAL:{ color:"#ef4444", border:"rgba(239,68,68,0.35)", icon:"🔴" },
  HIGH:    { color:"#f97316", border:"rgba(249,115,22,0.3)", icon:"🟠" },
  MEDIUM:  { color:"#f59e0b", border:"rgba(245,158,11,0.28)",icon:"🟡" },
  LOW:     { color:"#10b981", border:"rgba(16,185,129,0.28)",icon:"🟢" },
};
const ISSUE_ICON = {
  MEMORY_LEAK:"💾", CPU_SPIKE:"⚡", DISK_FULL:"💿",
  SECURITY_ATTACK:"🛡️", PERFORMANCE_DEGRADATION:"🐢",
  APPLICATION_ERROR:"💥", UNKNOWN_ANOMALY:"❓",
};

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [fixing,    setFixing]    = useState(false);
  const [fixResult, setFixResult] = useState(null);
  const [filter,    setFilter]    = useState("ALL");
  const [loading,   setLoading]   = useState(true);

  const load = async () => {
    try { const d=await api.get("/anomalies"); setAnomalies(d); if(d.length&&!selected)setSelected(d[0]); }
    catch{} finally{setLoading(false);}
  };

  useEffect(() => { load(); const t=setInterval(load,8000); return()=>clearInterval(t); }, []);

  const handleFix = async () => {
    if (!selected) return;
    setFixing(true); setFixResult(null);
    const r = await api.post("/remediate",{issue_type:selected.issue_type});
    setFixResult(r); setFixing(false);
  };

  const filtered = filter==="ALL" ? anomalies : anomalies.filter(a=>a.severity===filter);
  const sel = selected;
  const sc  = sel ? SEV_CFG[sel.severity]||SEV_CFG.LOW : null;

  const radarData = sel ? [
    {m:"CPU",    v:sel.log.cpu_usage},
    {m:"Memory", v:sel.log.memory_usage},
    {m:"Disk",   v:sel.log.disk_usage},
    {m:"Errors", v:Math.min(100,sel.log.error_count*2)},
    {m:"Latency",v:Math.min(100,sel.log.response_time_ms/100)},
    {m:"Security",v:Math.min(100,sel.log.failed_logins*5)},
  ] : [];

  return (
    <div className="page-enter anomalies-page" style={{ display:"flex", gap:16, height:"calc(100vh - 120px)" }}>

      {/* ── Left list ── */}
      <div style={{ width:360, flexShrink:0, display:"flex", flexDirection:"column", gap:12 }}>
        {/* Filter pills */}
        <div className="anomaly-filters" style={{ display:"flex", gap:6, background:T.bgSurface,
          padding:5, borderRadius:10, border:`1px solid ${T.borderS}` }}>
          {["ALL","CRITICAL","HIGH","MEDIUM","LOW"].map(f=>{
            const c=SEV_CFG[f];
            const act=filter===f;
            return (
              <button key={f} onClick={()=>setFilter(f)} style={{
                flex:1, padding:"5px 2px", fontSize:9, fontWeight:700,
                borderRadius:6, border:"none", cursor:"pointer",
                letterSpacing:"0.06em",
                background: act?(c?c.border:"rgba(59,130,246,0.2)"):"transparent",
                color: act?(c?c.color:T.blue):T.textM,
                transition:"all 0.15s",
              }}>{f}</button>
            );
          })}
        </div>

        {/* List */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:7 }}>
          {loading&&<div style={{color:T.textM,textAlign:"center",marginTop:40,fontSize:12}}>Analyzing logs…</div>}
          {!loading&&filtered.length===0&&(
            <div style={{textAlign:"center",marginTop:40}}>
              <div style={{fontSize:32}}>✅</div>
              <div style={{color:T.textS,marginTop:8,fontSize:13}}>No anomalies detected</div>
            </div>
          )}
          {filtered.map(a=>{
            const c=SEV_CFG[a.severity]||SEV_CFG.LOW;
            const act=sel?.id===a.id;
            return (
              <div key={a.id} className="anomaly-list-item" onClick={()=>{setSelected(a);setFixResult(null);}} style={{
                padding:"12px 14px", borderRadius:10, cursor:"pointer",
                background: act?T.bgElevated:T.bgSurface,
                border:`1px solid ${act?c.border:T.borderS}`,
                borderLeft:`3px solid ${c.color}`,
                transition:"all 0.15s",
                boxShadow: act?`0 0 16px ${c.color}18`:"none",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                  <span style={{fontSize:15}}>{ISSUE_ICON[a.issue_type]||"⚠️"}</span>
                  <span className="anomaly-issue-title" style={{fontSize:11,fontWeight:700,color:c.color,flex:1}}>
                    {a.issue_type.replace(/_/g," ")}
                  </span>
                  <SeverityBadge level={a.severity} />
                </div>
                <div style={{display:"flex",gap:14}}>
                  {[{l:"CPU",v:`${a.log.cpu_usage}%`},{l:"MEM",v:`${a.log.memory_usage}%`},{l:"SCORE",v:a.anomaly_score}].map(m=>(
                    <div key={m.l}>
                      <div style={{fontSize:8,color:T.textM,letterSpacing:"0.06em"}}>{m.l}</div>
                      <div style={{fontSize:11,fontWeight:700,color:T.textS,fontFamily:"var(--font-mono)"}}>{m.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:9,color:T.textM,marginTop:6,fontFamily:"var(--font-mono)"}}>{a.log.server}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right detail ── */}
      {sel&&sc&&(
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:14}}>
          {/* Header card */}
          <div className="anomaly-detail-card" style={{
            padding:20,background:T.bgSurface,borderRadius:14,
            border:`1px solid ${sc.border}`,
            borderTop:`3px solid ${sc.color}`,
            boxShadow:`0 0 24px ${sc.color}12`,
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:32}}>{ISSUE_ICON[sel.issue_type]}</span>
                <div>
                  <div className="anomaly-issue-title" style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:800,color:sc.color}}>
                    {sel.issue_type.replace(/_/g," ")}
                  </div>
                  <div style={{fontSize:11,color:T.textM,marginTop:2,fontFamily:"var(--font-mono)"}}>
                    {sel.log.server} · {sel.log.service}
                  </div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:9,color:T.textM,marginBottom:2,letterSpacing:"0.08em"}}>CONFIDENCE</div>
                <div className="anomaly-confidence" style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:800,color:sc.color,lineHeight:1}}>
                  {sel.confidence}%
                </div>
              </div>
            </div>

            {/* Recommended action */}
            <div className="anomaly-recommended-action" style={{padding:12,background:T.bgBase,borderRadius:8,
              border:`1px solid ${T.borderS}`,marginBottom:14}}>
              <div style={{fontSize:9,color:T.textM,letterSpacing:"0.08em",marginBottom:4}}>RECOMMENDED ACTION</div>
              <div style={{fontSize:12,color:"rgba(240,246,255,0.75)",lineHeight:1.55}}>{sel.recommended_action}</div>
            </div>

            {sel.auto_fixable&&(
              <PrimaryBtn className="anomaly-apply-fix" onClick={handleFix} loading={fixing} full>
                {fixing?"⚡ Applying Auto-Fix…":"⚡ Apply Auto-Fix Now"}
              </PrimaryBtn>
            )}
          </div>

          {/* Fix result */}
          {fixResult&&(
            <div style={{padding:18,background:"rgba(16,185,129,0.07)",
              border:"1px solid rgba(16,185,129,0.28)",borderRadius:14}}>
              <div style={{fontSize:13,fontWeight:700,color:T.green,marginBottom:10}}>✅ Fix Applied Successfully</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {fixResult.steps?.map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:8,fontSize:12,color:"#6ee7b7"}}>
                    <span style={{color:T.green,flexShrink:0}}>✓</span>{s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Radar chart */}
          <Panel title="Anomaly Signature">
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData} margin={{top:10,right:20,bottom:20,left:20}}>
                <PolarGrid stroke="rgba(80,140,240,0.15)" />
                <PolarAngleAxis dataKey="m" tick={{fill:T.textM,fontSize:10}} />
                <Radar dataKey="v" stroke={sc.color} fill={sc.color} fillOpacity={0.15} strokeWidth={2}
                  dot={{fill:sc.color,r:3}} />
                <Tooltip contentStyle={{background:T.bgBase,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}} />
              </RadarChart>
            </ResponsiveContainer>
          </Panel>

          {/* Raw metrics grid */}
          <Panel title="Raw Metrics at Detection">
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[
                {l:"CPU",v:`${sel.log.cpu_usage}%`,  c:sel.log.cpu_usage>85?T.red:T.blue},
                {l:"Memory",v:`${sel.log.memory_usage}%`, c:sel.log.memory_usage>85?T.red:"#7c3aed"},
                {l:"Disk",v:`${sel.log.disk_usage}%`,    c:sel.log.disk_usage>90?T.red:T.amber},
                {l:"Errors",v:sel.log.error_count,        c:sel.log.error_count>20?T.red:T.green},
                {l:"Response",v:`${sel.log.response_time_ms}ms`,c:sel.log.response_time_ms>2000?T.red:T.cyan},
                {l:"Failed Logins",v:sel.log.failed_logins,    c:sel.log.failed_logins>10?T.red:T.textS},
              ].map(m=>(
                <div key={m.l} className="anomaly-raw-metric" style={{padding:"10px 12px",background:T.bgBase,
                  borderRadius:8,border:`1px solid ${T.borderS}`}}>
                  <div style={{fontSize:9,color:T.textM,letterSpacing:"0.06em"}}>{m.l}</div>
                  <div style={{fontSize:20,fontWeight:800,color:m.c,marginTop:3,
                    fontFamily:"var(--font-display)"}}>{m.v}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
