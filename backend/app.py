from flask import Flask, jsonify, request
from flask_cors import CORS
import random
from datetime import datetime

from anomaly_detector import AnomalyDetector
from log_generator import LogGenerator
from remediator import AutoRemediator
from copilot import AIOPSCopilot


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# INITIALIZE SERVICES
# ============================================================

detector = AnomalyDetector()
generator = LogGenerator()
remediator = AutoRemediator()
copilot = AIOPSCopilot()


# ============================================================
# TRAIN ANOMALY MODEL ON STARTUP
# ============================================================

detector.train()


# ============================================================
# HEALTH
# ============================================================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    })


# ============================================================
# LIVE LOGS
# ============================================================

@app.route('/api/logs/live', methods=['GET'])
def live_logs():

    try:
        count = int(request.args.get('count', 20))

        # Protect endpoint from unreasonable values
        count = max(1, min(count, 500))

        logs = generator.generate_logs(count)

        return jsonify(logs)

    except Exception as e:

        print("❌ Live logs error:", e)

        return jsonify({
            "error": "Failed to generate live logs",
            "details": str(e)
        }), 500


# ============================================================
# ANOMALIES
# ============================================================

@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():

    try:

        logs = generator.generate_logs(50)

        anomalies = detector.detect(logs)

        return jsonify(anomalies)

    except Exception as e:

        print("❌ Anomaly detection error:", e)

        return jsonify({
            "error": "Failed to detect anomalies",
            "details": str(e)
        }), 500


# ============================================================
# CURRENT METRICS
# ============================================================

@app.route('/api/metrics', methods=['GET'])
def get_metrics():

    try:

        metrics = generator.get_system_metrics()

        return jsonify(metrics)

    except Exception as e:

        print("❌ Metrics error:", e)

        return jsonify({
            "error": "Failed to get metrics",
            "details": str(e)
        }), 500


# ============================================================
# METRICS HISTORY
# ============================================================

@app.route('/api/metrics/history', methods=['GET'])
def metrics_history():

    try:

        hours = int(request.args.get('hours', 6))

        # Protect endpoint
        hours = max(1, min(hours, 168))

        history = generator.get_metrics_history(hours)

        return jsonify(history)

    except Exception as e:

        print("❌ Metrics history error:", e)

        return jsonify({
            "error": "Failed to get metrics history",
            "details": str(e)
        }), 500


# ============================================================
# ACTIVE ALERTS
# ============================================================

@app.route('/api/alerts', methods=['GET'])
def get_alerts():

    try:

        alerts = detector.get_active_alerts()

        return jsonify(alerts)

    except Exception as e:

        print("❌ Alerts error:", e)

        return jsonify({
            "error": "Failed to get alerts",
            "details": str(e)
        }), 500


# ============================================================
# AUTO REMEDIATION
# ============================================================

@app.route('/api/remediate', methods=['POST'])
def remediate():

    try:

        data = request.get_json(silent=True) or {}

        issue_type = data.get('issue_type')

        if not issue_type:

            return jsonify({
                "error": "issue_type is required"
            }), 400

        result = remediator.fix(issue_type)

        return jsonify(result)

    except Exception as e:

        print("❌ Remediation error:", e)

        return jsonify({
            "error": "Remediation failed",
            "details": str(e)
        }), 500


# ============================================================
# DASHBOARD STATS
# ============================================================

@app.route('/api/stats', methods=['GET'])
def get_stats():

    try:

        stats = {
            "health_score": random.randint(85, 99),
            "total_logs_today": random.randint(180000, 250000),
            "anomalies_detected": random.randint(3, 12),
            "auto_fixed": random.randint(2, 8),
            "uptime_percent": round(
                random.uniform(99.2, 99.99),
                2
            ),
            "alerts_sent": random.randint(5, 20),
            "revenue_saved": random.randint(8000, 50000),
            "servers_monitored": 12,
            "avg_response_ms": random.randint(120, 350),
            "threats_blocked": random.randint(1, 5)
        }

        return jsonify(stats)

    except Exception as e:

        print("❌ Stats error:", e)

        return jsonify({
            "error": "Failed to get stats",
            "details": str(e)
        }), 500


# ============================================================
# AIOPS COPILOT
# ============================================================

@app.route('/api/copilot/chat', methods=['POST'])
def chat():

    try:

        data = request.get_json(silent=True) or {}

        question = str(
            data.get('question', '')
        ).strip()

        history = data.get('history', [])

        # ----------------------------------------------------
        # VALIDATE QUESTION
        # ----------------------------------------------------

        if not question:

            return jsonify({
                "error": "Question is required"
            }), 400


        # ----------------------------------------------------
        # CURRENT METRICS
        # ----------------------------------------------------

        try:

            metrics = generator.get_system_metrics()

        except Exception as e:

            print("⚠️ Copilot metrics error:", e)

            metrics = {}


        # ----------------------------------------------------
        # CURRENT SERVER STATUS
        # ----------------------------------------------------

        try:

            servers = generator.get_server_status()

        except Exception as e:

            print("⚠️ Copilot server error:", e)

            servers = []


        # ----------------------------------------------------
        # GENERATE SMALLER SET OF RECENT LOGS
        # ----------------------------------------------------

        try:

            # 20 logs instead of 50
            recent_logs = generator.generate_logs(20)

        except Exception as e:

            print("⚠️ Copilot logs error:", e)

            recent_logs = []


        # ----------------------------------------------------
        # DETECT ANOMALIES FROM SAME LOGS
        # ----------------------------------------------------

        try:

            anomalies = detector.detect(recent_logs)

        except Exception as e:

            print("⚠️ Copilot anomalies error:", e)

            anomalies = []


        # ----------------------------------------------------
        # ACTIVE ALERTS
        # ----------------------------------------------------

        try:

            alerts = detector.get_active_alerts()

        except Exception as e:

            print("⚠️ Copilot alerts error:", e)

            alerts = []


        # ====================================================
        # REDUCE CONTEXT BEFORE SENDING TO GROQ
        # ====================================================


        # ----------------------------------------------------
        # IMPORTANT LOGS ONLY
        # ----------------------------------------------------

        important_logs = []

        for log in recent_logs:

            if not isinstance(log, dict):
                continue

            level = str(
                log.get("level", "")
            ).upper()

            # Keep errors/warnings/critical events
            if level in [
                "ERROR",
                "CRITICAL",
                "WARNING",
                "WARN"
            ]:

                important_logs.append(log)


        # If there are no important logs,
        # keep only the last few logs.
        if not important_logs:

            important_logs = recent_logs[-5:]


        # Never send more than 10 logs
        important_logs = important_logs[-10:]


        # ----------------------------------------------------
        # LIMIT ANOMALIES
        # ----------------------------------------------------

        if isinstance(anomalies, list):

            anomalies_for_ai = anomalies[-8:]

        else:

            anomalies_for_ai = anomalies


        # ----------------------------------------------------
        # LIMIT ALERTS
        # ----------------------------------------------------

        if isinstance(alerts, list):

            alerts_for_ai = alerts[-8:]

        else:

            alerts_for_ai = alerts


        # ----------------------------------------------------
        # BUILD COMPACT MONITORING CONTEXT
        # ----------------------------------------------------

        monitoring_context = {

            "timestamp": datetime.now().isoformat(),

            "current_metrics": metrics,

            "server_status": servers,

            "important_logs": important_logs,

            "anomalies": anomalies_for_ai,

            "active_alerts": alerts_for_ai

        }


        # ====================================================
        # SEND TO COPILOT
        # ====================================================

        response = copilot.answer(

            question=question,

            history=history,

            monitoring_context=monitoring_context

        )


        # ====================================================
        # RETURN TO FRONTEND
        # ====================================================

        return jsonify({

            "response": response,

            "timestamp": datetime.now().isoformat()

        })


    except Exception as e:

        print("❌ Copilot endpoint error:", e)

        return jsonify({

            "error": "Copilot request failed",

            "details": str(e)

        }), 500


# ============================================================
# SERVERS
# ============================================================

@app.route('/api/servers', methods=['GET'])
def get_servers():

    try:

        servers = generator.get_server_status()

        return jsonify(servers)

    except Exception as e:

        print("❌ Servers error:", e)

        return jsonify({

            "error": "Failed to get server status",

            "details": str(e)

        }), 500


# ============================================================
# LOG SEARCH
# ============================================================

@app.route('/api/logs/search', methods=['POST'])
def search_logs():

    try:

        data = request.get_json(silent=True) or {}

        query = str(
            data.get('query', '')
        ).strip()

        level = data.get(
            'level',
            'all'
        )

        logs = generator.search_logs(
            query,
            level
        )

        return jsonify(logs)

    except Exception as e:

        print("❌ Log search error:", e)

        return jsonify({

            "error": "Failed to search logs",

            "details": str(e)

        }), 500


# ============================================================
# START APPLICATION
# ============================================================

if __name__ == '__main__':

    print("🚀 AIOps Platform Starting...")

    app.run(

        host='0.0.0.0',

        port=5000,

        debug=True

    )