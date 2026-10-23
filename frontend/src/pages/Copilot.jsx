import { useState, useRef, useEffect } from "react";
import { api } from "../utils/api";
import { ChatBubble, Chip, PrimaryBtn, TypingDots, T } from "../components/UI";

const SUGGESTIONS = [
  "Any issues overnight?",
  "Why did website crash yesterday?",
  "Database performance?",
  "Security threats today?",
  "What will fail next 24h?",
  "Show all server status",
  "How much revenue saved?",
  "Fix all critical issues",
];

const INIT_MSG = {
  role:"assistant",
  content:"👋 I'm your **AIOps Copilot** — I have real-time visibility into your entire 12-server infrastructure.\n\nAsk me anything in plain English:\n• \"What crashed overnight?\"\n• \"Any security threats?\"\n• \"What will fail in 2 hours?\"\n• \"Fix the memory leak now\"\n\nOr tap a suggestion below to get started.",
  timestamp: new Date().toISOString(),
};

export default function Copilot() {
  const [msgs,    setMsgs]    = useState([INIT_MSG]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const send = async (text) => {
    const q = (text||input).trim();
    if (!q||loading) return;
    setInput("");
    const userMsg={role:"user",content:q,timestamp:new Date().toISOString()};
    setMsgs(p=>[...p,userMsg]);
    setLoading(true);
    try {
      const history=msgs.slice(-6).map(m=>({role:m.role,content:m.content}));
      const d=await api.post("/copilot/chat",{question:q,history});
      setMsgs(p=>[...p,{role:"assistant",content:d.response,timestamp:d.timestamp}]);
    } catch {
      setMsgs(p=>[...p,{role:"assistant",
        content:"⚠️ Backend not reachable. Start Flask server on port 5000.",
        timestamp:new Date().toISOString()}]);
    }
    setLoading(false);
  };

  const showSuggestions = msgs.length <= 2;

  return (
    <div className="copilot-page" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)",gap:0}}>

      {/* ── Header ── */}
      <div className="copilot-header" style={{
        padding:"14px 20px",
        background:"linear-gradient(135deg, rgba(10,8,30,0.98), rgba(8,13,26,0.98))",
        border:`1px solid rgba(124,58,237,0.25)`,
        borderRadius:"14px 14px 0 0",
        display:"flex",alignItems:"center",gap:12,
        backdropFilter:"blur(20px)",
      }}>
        <div className="copilot-agent-icon" style={{
          width:42,height:42,borderRadius:12,flexShrink:0,
          display:"flex",alignItems:"center",justifyContent:"center",
        }}>
          <img src="/logo1.png" alt="AIOps Copilot logo" width={42} height={42} style={{ objectFit:"contain" }} />
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"var(--font-display)",fontSize:15,fontWeight:700,color:T.textP}}>AIOps Copilot</div>
          <div style={{fontSize:10,color:"rgba(124,58,237,0.8)",marginTop:1}}>
            Powered by Groq · Llama 3 · Real-time data
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:7,
          padding:"5px 12px",background:"rgba(16,185,129,0.08)",
          border:"1px solid rgba(16,185,129,0.2)",borderRadius:20}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:T.green,
            display:"inline-block",animation:"livePulse 2s infinite",
            boxShadow:`0 0 6px ${T.green}`}} />
          <span style={{fontSize:10,color:T.green,fontWeight:600}}>12 servers connected</span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="copilot-messages" style={{
        flex:1,overflowY:"auto",padding:"20px",
        background:"rgba(4,8,18,0.97)",
        border:`1px solid ${T.borderS}`,
        borderTop:"none",borderBottom:"none",
      }}>
        {msgs.map((m,i)=><ChatBubble key={i} msg={m} />)}
        {loading&&(
          <div style={{display:"flex",gap:10,marginBottom:16}}>
            <div style={{
              width:32,height:32,borderRadius:"50%",flexShrink:0,
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>
              <img src="/logo1.png" alt="" width={32} height={32} style={{ objectFit:"contain" }} />
            </div>
            <div className="copilot-typing" style={{
              padding:"12px 16px",
              background:"rgba(10,22,40,0.7)",
              border:`1px solid ${T.borderS}`,
              borderRadius:"3px 12px 12px 12px",
            }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggestions ── */}
      {showSuggestions&&(
        <div className="copilot-suggestions" style={{
          padding:"10px 16px",
          background:"rgba(7,15,31,0.98)",
          border:`1px solid ${T.borderS}`,
          borderTop:`1px solid ${T.borderS}`,
          display:"flex",flexWrap:"wrap",gap:6,
        }}>
          {SUGGESTIONS.map(s=>(
            <Chip key={s} label={s} active={false} color={T.blue} onClick={()=>send(s)} />
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="copilot-composer" style={{
        padding:"12px 16px",
        background:"rgba(5,9,20,0.99)",
        border:`1px solid ${T.borderS}`,
        borderTop:`1px solid rgba(80,140,240,0.15)`,
        borderRadius:"0 0 14px 14px",
      }}>
        <div className="copilot-composer-input" style={{
          display:"flex",gap:10,
          background:T.bgElevated,
          border:`1px solid ${T.border}`,
          borderRadius:10,padding:"8px 8px 8px 16px",
          transition:"border-color 0.15s",
        }}
        onFocusCapture={e=>e.currentTarget.style.borderColor="rgba(100,160,255,0.5)"}
        onBlurCapture={e=>e.currentTarget.style.borderColor=T.border}
        >
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
            placeholder="Ask anything about your infrastructure…"
            disabled={loading}
            style={{
              flex:1,background:"transparent",border:"none",outline:"none",
              color:T.textP,fontSize:13,fontFamily:"var(--font-body)",
              caretColor:T.blue,
            }}
          />
          <PrimaryBtn onClick={()=>send()} disabled={!input.trim()||loading}>
            Send ↵
          </PrimaryBtn>
        </div>
        <div style={{fontSize:9,color:T.textM,marginTop:6,textAlign:"center",letterSpacing:"0.05em"}}>
          GROQ FREE TIER · ADD API KEY IN .env FOR FULL AI · DEMO MODE ACTIVE WITHOUT KEY
        </div>
      </div>
    </div>
  );
}
