import os
import requests
import json
import random
from datetime import datetime, timedelta

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are AIOps Copilot, an expert AI assistant for IT operations and system monitoring.
You help operations teams understand system health, diagnose issues, and take corrective actions.

You have access to real-time data from the monitoring system:
- 12 servers being monitored
- Live metrics: CPU, Memory, Disk, Network
- Active alerts and anomalies
- Historical incident data

Be concise, technical, and actionable. Use bullet points when listing steps.
Format important values with units (%, ms, GB). 
If asked to fix something, describe what automated actions would be taken.
Always end with a confidence level if making predictions."""

DEMO_RESPONSES = {
    "morning": """Good morning! Here's your overnight summary:

**System Health: 94/100** ✅

**Auto-resolved while you slept:**
- 🛡️ **Security attack blocked** (3:42 AM) — 247 brute-force attempts from 185.220.101.42. IP blocked, 3 accounts locked.
- 🧹 **Disk cleanup** (4:15 AM) — db-server-02 was at 91%, freed 28GB of old logs. Now at 63%.
- ⚡ **CPU spike resolved** (5:30 AM) — worker-node-07 was at 94%, runaway process terminated.

**Needs your attention:**
- ⚠️ Memory leak on prod-server-03 (currently 89%, growing)
- ⚠️ API response time elevated on api-gateway-01 (avg 8.5s vs normal 150ms)

**Revenue impact:** Zero downtime overnight. Estimated $42k in prevented losses.

Shall I auto-fix the memory leak now?""",

    "crash": """**Root Cause Analysis — Yesterday's Incident**

**Timeline:**
- `14:23` — Memory usage began climbing on prod-server-03
- `14:31` — Alert triggered at 85% memory threshold
- `14:47` — OOM killer terminated checkout-service process
- `14:47` — Website checkout unavailable (503 errors)
- `14:52` — Auto-restart attempted, failed (memory still full)
- `15:03` — On-call engineer manually restarted app server
- `15:05` — Service restored

**Root Cause:** Unclosed database connection pool in checkout-service v2.3.1. Each request leaked ~2MB. After ~18,000 requests, memory exhausted.

**Impact:**
- Downtime: 18 minutes
- Failed checkouts: ~1,200 transactions
- Revenue impact: ~$48,000

**Fix applied:** Service patched to v2.3.2 (connection pool cleanup)
**Permanent prevention:** Deploy memory limit container guardrails

**Confidence: 97%**""",

    "database": """**Database Performance Analysis**

Current status: ⚠️ **Degraded**

**Slow queries detected:**
1. `SELECT * FROM orders WHERE user_id=?` — avg **8,500ms** (normal: 180ms)
2. `JOIN orders o, products p ON o.product_id = p.id` — avg **3,200ms**
3. `SELECT COUNT(*) FROM audit_log` — avg **12,000ms**

**Root cause:** Missing index on `orders.user_id` and `orders.created_at`

**Fix (auto-applicable):**
```sql
CREATE INDEX idx_orders_user ON orders(user_id, created_at);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
ANALYZE TABLE orders;
```

**Expected improvement:** Query time → **150-200ms** (95% reduction)
**Risk:** Low — read-only index creation, no table lock

Want me to apply these optimizations now?""",

    "security": """**Security Threat Report — Last 24 Hours**

**Threats blocked: 3** 🛡️

1. **Brute Force Attack** (CRITICAL — Auto-blocked)
   - Source: 185.220.101.42 (known Tor exit node)
   - Attempts: 247 in 2 minutes targeting admin accounts
   - Status: ✅ IP blocked, accounts locked, team notified

2. **Unusual Data Access** (HIGH — Under investigation)
   - Employee account `jsmith@company.com` accessed 1,847 customer records at 2 AM
   - Pattern: Never accessed this data before, outside business hours
   - Status: ⚠️ Account suspended, security team alerted

3. **Port Scan** (MEDIUM — Monitored)
   - Source: 91.108.4.x subnet
   - Scanned ports 22, 80, 443, 3306 on 3 servers
   - Status: ✅ No successful connections, traffic rate-limited

**Recommendations:**
- Enable MFA for all admin accounts immediately
- Review jsmith account activity (potential insider threat)
- Update firewall rules to block Tor exit nodes

**Confidence: 94%**""",

    "predict": """**Predictive Analysis — Next 24 Hours**

Based on current trends and historical patterns:

🔴 **HIGH RISK (act within 2 hours)**
- **prod-server-03 memory** will reach 100% in ~3.2 hours
  - Current: 89%, growing at 100MB/10min
  - Recommended: Restart checkout-service now

🟡 **MEDIUM RISK (act today)**
- **db-server-02 disk** will reach 95% in ~8 hours
  - Current: 91%, log files growing 2GB/hour during peak
  - Recommended: Schedule log rotation

🟢 **LOW RISK (monitor)**
- CPU across all servers expected to peak at 78% during 2-4 PM
  - Normal for Tuesday afternoon traffic pattern
  - No action needed

**Predicted uptime if no action taken: 96.2%**
**Predicted uptime with recommended actions: 99.9%**

Want me to auto-apply all recommended fixes?""",

    "servers": """**Server Fleet Status — Live**

| Server | Status | CPU | Memory | Disk |
|--------|--------|-----|--------|------|
| prod-server-01 | ✅ Healthy | 42% | 58% | 51% |
| prod-server-02 | ✅ Healthy | 38% | 62% | 49% |
| prod-server-03 | 🔴 Critical | 67% | 89% | 72% |
| db-server-01 | ✅ Healthy | 29% | 71% | 68% |
| db-server-02 | ⚠️ Warning | 44% | 65% | 91% |
| auth-server-01 | ✅ Healthy | 22% | 45% | 38% |
| api-gateway-01 | ⚠️ Warning | 78% | 69% | 55% |
| worker-node-01 | ✅ Healthy | 51% | 55% | 44% |
| worker-node-07 | ✅ Healthy | 38% | 52% | 47% |

**2 servers need attention**
Shall I fix the critical ones automatically?""",
}

class AIOPSCopilot:
    def __init__(self):
        self.groq_key = os.environ.get("GROQ_API_KEY", "")
        self.use_groq = bool(self.groq_key)

    def answer(self, question: str, history: list = []) -> str:
        q = question.lower().strip()

        # Smart keyword matching for demo
        if any(w in q for w in ["morning", "overnight", "summary", "night", "sleep"]):
            return DEMO_RESPONSES["morning"]
        if any(w in q for w in ["crash", "yesterday", "incident", "downtime", "outage"]):
            return DEMO_RESPONSES["crash"]
        if any(w in q for w in ["database", "db", "slow query", "query", "sql"]):
            return DEMO_RESPONSES["database"]
        if any(w in q for w in ["security", "attack", "hacker", "breach", "threat"]):
            return DEMO_RESPONSES["security"]
        if any(w in q for w in ["predict", "forecast", "next", "future", "will"]):
            return DEMO_RESPONSES["predict"]
        if any(w in q for w in ["server", "fleet", "status", "all server", "servers"]):
            return DEMO_RESPONSES["servers"]

        # Try Groq if key available
        if self.use_groq:
            try:
                return self._call_groq(question, history)
            except Exception as e:
                pass

        return self._smart_fallback(question)

    def _call_groq(self, question: str, history: list) -> str:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in history[-6:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        messages.append({"role": "user", "content": question})

        resp = requests.post(
            GROQ_API_URL,
            headers={"Authorization": f"Bearer {self.groq_key}", "Content-Type": "application/json"},
            json={"model": "llama3-8b-8192", "messages": messages, "max_tokens": 600, "temperature": 0.7},
            timeout=10
        )
        data = resp.json()
        return data["choices"][0]["message"]["content"]

    def _smart_fallback(self, question: str) -> str:
        q = question.lower()
        if any(w in q for w in ["memory", "ram", "leak"]):
            return """**Memory Analysis**

Current memory status across fleet:
- **prod-server-03**: 🔴 89% (CRITICAL — memory leak detected)
- **db-server-01**: ⚠️ 71% (elevated)
- All others: ✅ Normal (42-65%)

**Root cause on prod-server-03:** checkout-service has unclosed DB connections.
Memory growing at ~100MB per 10 minutes.

**Auto-fix available:** Restart checkout-service (zero-downtime rolling restart)
**ETA to full memory exhaustion:** ~3.2 hours if untreated

Shall I apply the fix now? **Confidence: 93%**"""

        if any(w in q for w in ["cpu", "processor", "spike", "high cpu"]):
            return """**CPU Analysis — Current Status**

Fleet CPU average: **52%** (normal range: 30-65%)

**Elevated servers:**
- api-gateway-01: **78%** — High traffic, consider scaling
- worker-node-07: **67%** — Background jobs running

**Not concerning yet.** CPU tends to peak 2-4 PM.

**Recommendations:**
- Monitor api-gateway-01 — if it crosses 85%, auto-scale
- Check if worker jobs can be deferred to off-peak hours

No immediate action needed. **Confidence: 89%**"""

        if any(w in q for w in ["fix", "resolve", "repair", "remediat"]):
            return """**Auto-Remediation Status**

**I can fix these automatically right now:**
- 🔴 Memory leak on prod-server-03 (restart service)
- ⚠️ Disk full on db-server-02 (clean old logs)

**Estimated fix time:** 45 seconds total
**Risk:** Very low — both are routine operations

Shall I proceed with automated fixes? I'll send you a report when done."""

        if any(w in q for w in ["cost", "revenue", "money", "save", "impact"]):
            return """**Business Impact Report — Today**

**Prevented losses (auto-fixes):**
- Security attack blocked: ~$120,000 potential breach cost
- Server crash prevented: $48,000 (3h downtime at $16k/hr)
- Database optimization: $8,000 (performance SLA maintained)

**Total prevented today: $176,000** 💰

**Platform cost today:** ~$45 (infrastructure)
**ROI:** 3,900x return on monitoring investment

**Year-to-date:** $2.1M in prevented incidents
**Uptime maintained:** 99.97%"""

        return f"""I'm analyzing your query: *"{question}"*

Based on current system state:
- **12 servers** monitored, 2 need attention
- **Health score:** 94/100
- **Active alerts:** 5 (2 critical, 2 high, 1 medium)
- **Last incident:** 8 hours ago (auto-resolved)

For a detailed answer, try asking:
- *"What crashed yesterday?"*
- *"Show me all server status"*
- *"Any security threats?"*
- *"What will fail next?"*

Or add your **GROQ_API_KEY** to `.env` for full AI responses."""
