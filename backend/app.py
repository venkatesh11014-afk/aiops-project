from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import random
import time
import math
from datetime import datetime, timedelta
from anomaly_detector import AnomalyDetector
from log_generator import LogGenerator
from remediator import AutoRemediator
from copilot import AIOPSCopilot

app = Flask(__name__)
CORS(app)

detector = AnomalyDetector()
generator = LogGenerator()
remediator = AutoRemediator()
copilot = AIOPSCopilot()

# Train model on startup
detector.train()

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

@app.route('/api/logs/live', methods=['GET'])
def live_logs():
    count = int(request.args.get('count', 20))
    logs = generator.generate_logs(count)
    return jsonify(logs)

@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():
    logs = generator.generate_logs(50)
    anomalies = detector.detect(logs)
    return jsonify(anomalies)

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    metrics = generator.get_system_metrics()
    return jsonify(metrics)

@app.route('/api/metrics/history', methods=['GET'])
def metrics_history():
    hours = int(request.args.get('hours', 6))
    history = generator.get_metrics_history(hours)
    return jsonify(history)

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    alerts = detector.get_active_alerts()
    return jsonify(alerts)

@app.route('/api/remediate', methods=['POST'])
def remediate():
    data = request.json
    issue_type = data.get('issue_type')
    result = remediator.fix(issue_type)
    return jsonify(result)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    stats = {
        "health_score": random.randint(85, 99),
        "total_logs_today": random.randint(180000, 250000),
        "anomalies_detected": random.randint(3, 12),
        "auto_fixed": random.randint(2, 8),
        "uptime_percent": round(random.uniform(99.2, 99.99), 2),
        "alerts_sent": random.randint(5, 20),
        "revenue_saved": random.randint(8000, 50000),
        "servers_monitored": 12,
        "avg_response_ms": random.randint(120, 350),
        "threats_blocked": random.randint(1, 5)
    }
    return jsonify(stats)

@app.route('/api/copilot/chat', methods=['POST'])
def chat():
    data = request.json
    question = data.get('question', '')
    history = data.get('history', [])
    response = copilot.answer(question, history)
    return jsonify({"response": response, "timestamp": datetime.now().isoformat()})

@app.route('/api/servers', methods=['GET'])
def get_servers():
    servers = generator.get_server_status()
    return jsonify(servers)

@app.route('/api/logs/search', methods=['POST'])
def search_logs():
    data = request.json
    query = data.get('query', '')
    level = data.get('level', 'all')
    logs = generator.search_logs(query, level)
    return jsonify(logs)

if __name__ == '__main__':
    print("🚀 AIOps Platform Starting...")
    app.run(host='0.0.0.0', port=5000, debug=True)
