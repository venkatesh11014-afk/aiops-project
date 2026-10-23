import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv


# ============================================================
# ENVIRONMENT
# ============================================================

# Project structure:
#
# aiops-project/
# ├── .env
# ├── backend/
# │   ├── app.py
# │   └── copilot.py
# └── frontend/

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = PROJECT_ROOT / ".env"

load_dotenv(ENV_FILE)


# ============================================================
# GROQ CONFIGURATION
# ============================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b"
)

GROQ_API_URL = (
    "https://api.groq.com/openai/v1/chat/completions"
)


# ============================================================
# SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are AIOps Copilot for an IT monitoring platform.

Analyze the monitoring evidence provided by the application.

You may receive:
- server status
- CPU
- memory
- disk
- network
- logs
- anomalies
- alerts

Rules:
1. Answer the user's exact question directly.
2. Use the supplied monitoring data as the primary evidence.
3. Mention actual server names and metric values when relevant.
4. Correlate metrics, logs, anomalies, and alerts.
5. Separate observed facts from possible causes.
6. Say "likely cause" when the evidence is not conclusive.
7. Never invent logs, servers, metrics, timestamps, users, IPs,
   incidents, or financial values.
8. If the data is insufficient, clearly say what is missing.
9. Give practical investigation steps when useful.
10. Never claim a fix was executed unless the application actually
    executed it.
11. Keep the answer concise and technical.
12. Use %, ms, MB, and GB when appropriate.
13. For predictions, explain the evidence and give confidence.
"""


# ============================================================
# AIOPS COPILOT
# ============================================================

class AIOPSCopilot:

    def __init__(self):

        self.groq_key = GROQ_API_KEY
        self.groq_model = GROQ_MODEL
        self.use_groq = bool(self.groq_key)

        print("----------------------------------------")
        print("AIOps Copilot")
        print("----------------------------------------")

        if self.use_groq:
            print("✅ Groq AI enabled")
            print("Model:", self.groq_model)
            print("Env:", ENV_FILE)
        else:
            print("⚠️ GROQ_API_KEY not found")
            print("⚠️ Using fallback response")

        print("----------------------------------------")


    # ========================================================
    # MAIN ANSWER
    # ========================================================

    def answer(
        self,
        question: str,
        history=None,
        monitoring_context=None
    ) -> str:

        if history is None:
            history = []

        if monitoring_context is None:
            monitoring_context = {}

        question = str(question).strip()

        if not question:
            return "Please enter a question."

        # ----------------------------------------------------
        # TRY GROQ
        # ----------------------------------------------------

        if self.use_groq:

            try:

                print("----------------------------------------")
                print("🤖 AIOps Copilot")
                print("Question:", question)
                print("Monitoring context: available")
                print("----------------------------------------")

                return self._call_groq(
                    question=question,
                    history=history,
                    monitoring_context=monitoring_context
                )

            except Exception as error:

                print("❌ Groq error:", error)
                print("↳ Using fallback response...")

        # ----------------------------------------------------
        # FALLBACK
        # ----------------------------------------------------

        return self._fallback(question)


    # ========================================================
    # GROQ API
    # ========================================================

    def _call_groq(
        self,
        question: str,
        history: list,
        monitoring_context: dict
    ) -> str:

        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            }
        ]


        # ----------------------------------------------------
        # SMALL CHAT HISTORY
        # ----------------------------------------------------

        for item in history[-3:]:

            if not isinstance(item, dict):
                continue

            role = item.get("role", "user")
            content = item.get("content", "")

            if role not in ["user", "assistant"]:
                role = "user"

            if not content:
                continue

            content = str(content)

            # Prevent old answers from becoming huge
            if len(content) > 1200:
                content = content[:1200] + "\n...[truncated]"

            messages.append({
                "role": role,
                "content": content
            })


        # ----------------------------------------------------
        # COMPACT MONITORING CONTEXT
        # ----------------------------------------------------

        compact_context = self._compact_monitoring_context(
            monitoring_context
        )


        # ----------------------------------------------------
        # BUILD USER PROMPT
        # ----------------------------------------------------

        user_prompt = f"""
CURRENT MONITORING DATA
=======================

{compact_context}


USER QUESTION
=============

{question}


TASK
====

Answer the user's question using the monitoring evidence.

For performance questions:
- identify the affected server
- report relevant CPU/memory/disk/network values
- check alerts and anomalies
- check relevant logs
- explain the likely cause only when supported
- give the next investigation step

Do not give generic troubleshooting advice first when the
monitoring data already contains the answer.
"""

        messages.append({
            "role": "user",
            "content": user_prompt
        })


        # ----------------------------------------------------
        # GROQ REQUEST
        # ----------------------------------------------------

        payload = {
            "model": self.groq_model,
            "messages": messages,
            "max_completion_tokens": 600,
            "temperature": 0.2,
            "reasoning_effort": "low"
        }


        response = requests.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {self.groq_key}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=30
        )


        # ----------------------------------------------------
        # HANDLE API ERRORS
        # ----------------------------------------------------

        if not response.ok:

            try:

                error_data = response.json()

                error_message = (
                    error_data
                    .get("error", {})
                    .get(
                        "message",
                        response.text
                    )
                )

            except Exception:

                error_message = response.text


            raise RuntimeError(
                f"Groq API error "
                f"{response.status_code}: "
                f"{error_message}"
            )


        # ----------------------------------------------------
        # PARSE RESPONSE
        # ----------------------------------------------------

        try:

            data = response.json()

        except Exception as error:

            raise RuntimeError(
                f"Invalid JSON response from Groq: {error}"
            )


        if "choices" not in data:
            raise RuntimeError(
                "Groq response does not contain choices."
            )


        if not data["choices"]:
            raise RuntimeError(
                "Groq returned no choices."
            )


        message = data["choices"][0].get(
            "message",
            {}
        )


        answer = message.get(
            "content",
            ""
        )


        if not answer:
            raise RuntimeError(
                "Groq returned an empty answer."
            )


        print("✅ Groq response received")

        return answer.strip()


    # ========================================================
    # COMPACT MONITORING DATA
    # ========================================================

    def _compact_monitoring_context(
        self,
        monitoring_context: dict
    ) -> str:

        if not isinstance(monitoring_context, dict):
            return "{}"


        # ----------------------------------------------------
        # COPY ONLY IMPORTANT SECTIONS
        # ----------------------------------------------------

        compact = {}


        # Current metrics
        if "current_metrics" in monitoring_context:

            compact["current_metrics"] = (
                monitoring_context["current_metrics"]
            )

        elif "metrics" in monitoring_context:

            compact["current_metrics"] = (
                monitoring_context["metrics"]
            )


        # Server status
        if "server_status" in monitoring_context:

            compact["server_status"] = (
                monitoring_context["server_status"]
            )

        elif "servers" in monitoring_context:

            compact["server_status"] = (
                monitoring_context["servers"]
            )


        # Important logs
        if "important_logs" in monitoring_context:

            logs = monitoring_context["important_logs"]

            if isinstance(logs, list):

                compact["important_logs"] = logs[-8:]

            else:

                compact["important_logs"] = logs


        elif "recent_logs" in monitoring_context:

            logs = monitoring_context["recent_logs"]

            if isinstance(logs, list):

                compact["important_logs"] = logs[-8:]

            else:

                compact["important_logs"] = logs


        # Anomalies
        if "anomalies" in monitoring_context:

            anomalies = monitoring_context["anomalies"]

            if isinstance(anomalies, list):

                compact["anomalies"] = anomalies[-6:]

            else:

                compact["anomalies"] = anomalies


        # Alerts
        if "active_alerts" in monitoring_context:

            alerts = monitoring_context["active_alerts"]

            if isinstance(alerts, list):

                compact["active_alerts"] = alerts[-6:]

            else:

                compact["active_alerts"] = alerts


        # ----------------------------------------------------
        # CONVERT TO JSON
        # ----------------------------------------------------

        try:

            result = json.dumps(
                compact,
                separators=(",", ":"),
                default=str
            )

        except Exception as error:

            print(
                "⚠️ Monitoring data serialization error:",
                error
            )

            return "{}"


        # ----------------------------------------------------
        # HARD CONTEXT LIMIT
        # ----------------------------------------------------

        # Keep the prompt comfortably below your 8K TPM limit.
        max_chars = 9000

        if len(result) > max_chars:

            result = (
                result[:max_chars]
                + "...[context truncated]"
            )


        return result


    # ========================================================
    # FALLBACK
    # ========================================================

    def _fallback(
        self,
        question: str
    ) -> str:

        return f"""
**AIOps Copilot**

Groq is currently unavailable.

Your question:

> "{question}"

No AI monitoring conclusion was generated.

Check the Flask terminal for:

- Groq API status
- model name
- API key
- rate-limit errors
- network errors
"""