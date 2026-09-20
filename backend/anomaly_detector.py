import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import random

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42, n_estimators=100)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.active_alerts = []
        self._seed_alerts()

    def _seed_alerts(self):
        alert_templates = [
            {"id": "ALT001", "type": "MEMORY_LEAK", "severity": "CRITICAL",
             "message": "Memory usage at 89% on prod-server-03, growing +100MB/10min",
             "server": "prod-server-03", "auto_fixed": False,
             "timestamp": (datetime.now() - timedelta(minutes=8)).isoformat()},
            {"id": "ALT002", "type": "SECURITY_ATTACK", "severity": "HIGH",
             "message": "Brute force detected: 247 failed logins from 185.220.101.42",
             "server": "auth-server-01", "auto_fixed": True,
             "timestamp": (datetime.now() - timedelta(minutes=22)).isoformat()},
            {"id": "ALT003", "type": "DISK_FULL", "severity": "HIGH",
             "message": "Disk at 91% on db-server-02, estimated full in 3 hours",
             "server": "db-server-02", "auto_fixed": True,
             "timestamp": (datetime.now() - timedelta(minutes=45)).isoformat()},
            {"id": "ALT004", "type": "PERFORMANCE_DEGRADATION", "severity": "MEDIUM",
             "message": "API response time 8.5s (normal: 150ms) on api-gateway",
             "server": "api-gateway-01", "auto_fixed": False,
             "timestamp": (datetime.now() - timedelta(hours=1)).isoformat()},
            {"id": "ALT005", "type": "CPU_SPIKE", "severity": "MEDIUM",
             "message": "CPU sustained at 94% for 15min on worker-node-07",
             "server": "worker-node-07", "auto_fixed": True,
             "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()},
        ]
        self.active_alerts = alert_templates

    def train(self):
        normal_data = []
        for _ in range(500):
            normal_data.append({
                'cpu': random.gauss(45, 10),
                'memory': random.gauss(55, 8),
                'disk': random.gauss(50, 5),
                'errors': random.gauss(2, 1),
                'response_ms': random.gauss(150, 30),
                'failed_logins': random.gauss(0.5, 0.5),
                'network_in': random.gauss(20, 5),
                'network_out': random.gauss(10, 3),
            })

        df = pd.DataFrame(normal_data)
        df = df.clip(lower=0)
        scaled = self.scaler.fit_transform(df)
        self.model.fit(scaled)
        self.is_trained = True
        print("✅ Anomaly detection model trained")

    def detect(self, logs):
        if not self.is_trained:
            self.train()

        features = []
        for log in logs:
            features.append({
                'cpu': log.get('cpu_usage', 50),
                'memory': log.get('memory_usage', 60),
                'disk': log.get('disk_usage', 50),
                'errors': log.get('error_count', 0),
                'response_ms': log.get('response_time_ms', 150),
                'failed_logins': log.get('failed_logins', 0),
                'network_in': log.get('network_in_mb', 20),
                'network_out': log.get('network_out_mb', 10),
            })

        df = pd.DataFrame(features)
        scaled = self.scaler.transform(df)
        predictions = self.model.predict(scaled)
        scores = self.model.score_samples(scaled)

        anomalies = []
        for i, (pred, score) in enumerate(zip(predictions, scores)):
            if pred == -1:
                issue = self._identify_issue(df.iloc[i])
                severity = self._classify_severity(score)
                anomalies.append({
                    'id': f"ANO{random.randint(1000,9999)}",
                    'log': logs[i],
                    'issue_type': issue,
                    'severity': severity,
                    'anomaly_score': round(float(score), 3),
                    'confidence': round(min(100, abs(float(score)) * 60), 1),
                    'timestamp': datetime.now().isoformat(),
                    'recommended_action': self._get_action(issue),
                    'auto_fixable': issue in ['DISK_FULL', 'SECURITY_ATTACK', 'CPU_SPIKE']
                })

        return anomalies

    def _identify_issue(self, row):
        if row['failed_logins'] > 20:
            return 'SECURITY_ATTACK'
        if row['memory'] > 85:
            return 'MEMORY_LEAK'
        if row['disk'] > 90:
            return 'DISK_FULL'
        if row['cpu'] > 90:
            return 'CPU_SPIKE'
        if row['response_ms'] > 3000:
            return 'PERFORMANCE_DEGRADATION'
        if row['errors'] > 50:
            return 'APPLICATION_ERROR'
        return 'UNKNOWN_ANOMALY'

    def _classify_severity(self, score):
        if score < -0.5:
            return 'CRITICAL'
        elif score < -0.3:
            return 'HIGH'
        elif score < -0.1:
            return 'MEDIUM'
        return 'LOW'

    def _get_action(self, issue):
        actions = {
            'MEMORY_LEAK': 'Restart application service to clear memory',
            'CPU_SPIKE': 'Kill high-CPU processes and scale horizontally',
            'DISK_FULL': 'Delete logs older than 30 days and compress archives',
            'SECURITY_ATTACK': 'Block attacker IP and force account password reset',
            'PERFORMANCE_DEGRADATION': 'Add database indexes and optimize slow queries',
            'APPLICATION_ERROR': 'Check application logs and restart failed services',
            'UNKNOWN_ANOMALY': 'Investigate system metrics for root cause',
        }
        return actions.get(issue, 'Investigate manually')

    def get_active_alerts(self):
        # Add a fresh random alert occasionally
        if random.random() < 0.3:
            new_alert = {
                "id": f"ALT{random.randint(100, 999)}",
                "type": random.choice(["CPU_SPIKE", "MEMORY_LEAK", "NETWORK_ANOMALY"]),
                "severity": random.choice(["MEDIUM", "HIGH"]),
                "message": f"Anomaly detected on server-{random.randint(1,10):02d}",
                "server": f"worker-node-{random.randint(1,10):02d}",
                "auto_fixed": random.choice([True, False]),
                "timestamp": datetime.now().isoformat()
            }
            if len(self.active_alerts) > 8:
                self.active_alerts.pop()
            self.active_alerts.insert(0, new_alert)

        return self.active_alerts
