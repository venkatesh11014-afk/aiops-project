import random
import math
from datetime import datetime, timedelta

SERVERS = [
    "prod-server-01", "prod-server-02", "prod-server-03",
    "db-server-01", "db-server-02",
    "auth-server-01", "api-gateway-01",
    "worker-node-01", "worker-node-02", "worker-node-07",
    "cache-server-01", "load-balancer-01"
]

SERVICES = ["nginx", "postgresql", "redis", "node-api", "auth-service",
            "payment-service", "notification-service", "worker", "scheduler"]

LOG_MESSAGES = {
    "INFO": [
        "Request processed successfully in {time}ms",
        "User authentication successful for user_id={uid}",
        "Cache hit for key={key}, served in {time}ms",
        "Database query completed in {time}ms rows={rows}",
        "Health check passed on {server}",
        "Backup completed successfully, size={size}MB",
        "Scheduled job {job} completed",
        "SSL certificate renewed for {domain}",
    ],
    "WARN": [
        "High memory usage detected: {pct}% on {server}",
        "Slow query detected: {time}ms (threshold: 500ms)",
        "Connection pool at {pct}% capacity",
        "Retry attempt {n}/3 for service {svc}",
        "Rate limit approaching: {pct}% of quota used",
        "Disk usage at {pct}% on {server}",
    ],
    "ERROR": [
        "Connection timeout to {server} after {time}ms",
        "Database connection failed: max connections reached",
        "Service {svc} returned 500 Internal Server Error",
        "Authentication failed for user_id={uid} from IP={ip}",
        "Payment processing failed: gateway timeout",
        "Memory allocation failed on {server}",
    ],
    "CRITICAL": [
        "System out of memory on {server} — OOM killer triggered",
        "Disk full on {server}: write operations failing",
        "Brute force attack detected from IP={ip}: {n} attempts",
        "Database replication lag: {time}s behind master",
        "Service {svc} has crashed and failed to restart",
    ]
}

class LogGenerator:
    def __init__(self):
        self._counter = 0

    def _make_log(self, level=None, inject_anomaly=False):
        self._counter += 1
        if level is None:
            if inject_anomaly:
                level = random.choice(["ERROR", "CRITICAL"])
            else:
                level = random.choices(
                    ["INFO", "WARN", "ERROR", "CRITICAL"],
                    weights=[70, 18, 10, 2]
                )[0]

        templates = LOG_MESSAGES[level]
        template = random.choice(templates)
        message = template.format(
            time=random.randint(10, 9000),
            uid=random.randint(10000, 99999),
            key=f"cache:{random.choice(['user','product','session'])}:{random.randint(1,999)}",
            rows=random.randint(1, 10000),
            server=random.choice(SERVERS),
            svc=random.choice(SERVICES),
            pct=random.randint(70, 99),
            n=random.randint(1, 500),
            ip=f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
            size=random.randint(100, 5000),
            job=random.choice(["cleanup", "backup", "report", "sync"]),
            domain=random.choice(["api.example.com", "auth.example.com"]),
        )

        cpu = random.uniform(10, 60)
        memory = random.uniform(30, 70)
        disk = random.uniform(20, 65)
        errors = random.randint(0, 5)
        response_ms = random.randint(50, 500)
        failed_logins = random.randint(0, 2)

        if inject_anomaly:
            anomaly_type = random.choice(["memory", "cpu", "disk", "attack", "slow"])
            if anomaly_type == "memory":
                memory = random.uniform(87, 99)
            elif anomaly_type == "cpu":
                cpu = random.uniform(92, 100)
            elif anomaly_type == "disk":
                disk = random.uniform(91, 99)
            elif anomaly_type == "attack":
                failed_logins = random.randint(50, 300)
            elif anomaly_type == "slow":
                response_ms = random.randint(5000, 15000)

        return {
            "id": f"LOG{self._counter:08d}",
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "server": random.choice(SERVERS),
            "service": random.choice(SERVICES),
            "message": message,
            "cpu_usage": round(cpu, 1),
            "memory_usage": round(memory, 1),
            "disk_usage": round(disk, 1),
            "error_count": errors,
            "response_time_ms": response_ms,
            "failed_logins": failed_logins,
            "network_in_mb": round(random.uniform(5, 100), 1),
            "network_out_mb": round(random.uniform(2, 50), 1),
            "thread_count": random.randint(10, 200),
            "open_connections": random.randint(5, 500),
        }

    def generate_logs(self, count=20):
        logs = []
        for i in range(count):
            inject = (i % 7 == 0)
            logs.append(self._make_log(inject_anomaly=inject))
        return logs

    def search_logs(self, query="", level="all"):
        logs = self.generate_logs(100)
        if level != "all":
            logs = [l for l in logs if l["level"] == level.upper()]
        if query:
            logs = [l for l in logs if query.lower() in l["message"].lower()
                    or query.lower() in l["server"].lower()
                    or query.lower() in l["service"].lower()]
        return logs[:50]

    def get_system_metrics(self):
        t = datetime.now().timestamp()
        return {
            "cpu": round(45 + 20 * math.sin(t / 60) + random.uniform(-5, 5), 1),
            "memory": round(60 + 15 * math.sin(t / 90 + 1) + random.uniform(-3, 3), 1),
            "disk": round(72 + random.uniform(-1, 1), 1),
            "network_in": round(25 + 15 * abs(math.sin(t / 30)) + random.uniform(-5, 5), 1),
            "network_out": round(12 + 8 * abs(math.sin(t / 45)) + random.uniform(-3, 3), 1),
            "requests_per_sec": random.randint(800, 2500),
            "active_connections": random.randint(200, 1500),
            "error_rate": round(random.uniform(0.1, 2.5), 2),
            "avg_response_ms": random.randint(100, 400),
            "timestamp": datetime.now().isoformat(),
        }

    def get_metrics_history(self, hours=6):
        history = []
        now = datetime.now()
        points = hours * 12  # every 5 minutes
        for i in range(points):
            t = now - timedelta(minutes=(points - i) * 5)
            ts = t.timestamp()
            history.append({
                "time": t.strftime("%H:%M"),
                "cpu": round(45 + 20 * math.sin(ts / 300) + random.uniform(-5, 5), 1),
                "memory": round(60 + 15 * math.sin(ts / 450 + 1) + random.uniform(-3, 3), 1),
                "errors": max(0, round(2 + 3 * abs(math.sin(ts / 600)) + random.uniform(-1, 1), 0)),
                "response_ms": max(50, round(180 + 100 * abs(math.sin(ts / 360)) + random.uniform(-20, 20))),
                "requests": max(100, round(1200 + 600 * abs(math.sin(ts / 240)) + random.uniform(-100, 100))),
            })
        return history

    def get_server_status(self):
        statuses = []
        for s in SERVERS:
            health = random.choices(["healthy", "warning", "critical"], weights=[75, 20, 5])[0]
            statuses.append({
                "name": s,
                "status": health,
                "cpu": round(random.uniform(10 if health == "healthy" else 70, 60 if health == "healthy" else 99), 1),
                "memory": round(random.uniform(30 if health == "healthy" else 75, 70 if health == "healthy" else 95), 1),
                "disk": round(random.uniform(20, 85), 1),
                "uptime": f"{random.randint(1, 365)}d {random.randint(0,23)}h",
                "requests_per_sec": random.randint(50, 2000),
                "last_checked": datetime.now().isoformat(),
            })
        return statuses
