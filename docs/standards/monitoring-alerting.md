# Monitoring & Alerting

## Overview

This document defines the observability strategy for the AI Agent Platform using **Prometheus** for metrics, **Grafana** for visualization, **Loki** for logs, and **Jaeger** for distributed tracing.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Observability Stack                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│  │  Prometheus  │     │    Loki      │     │   Jaeger     │            │
│  │   (Metrics)  │     │   (Logs)     │     │  (Traces)    │            │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘            │
│         │                    │                    │                     │
│         └────────────────────┼────────────────────┘                     │
│                              │                                          │
│                       ┌──────▼───────┐                                  │
│                       │   Grafana    │                                  │
│                       │ (Dashboards) │                                  │
│                       └──────┬───────┘                                  │
│                              │                                          │
│                       ┌──────▼───────┐                                  │
│                       │ AlertManager │────► PagerDuty / Slack          │
│                       └──────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Metrics

### Application Metrics

```python
# app/core/metrics.py
from prometheus_client import Counter, Histogram, Gauge, Info

# Request metrics
http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration",
    ["method", "endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

# Agent metrics
agent_executions_total = Counter(
    "agent_executions_total",
    "Total agent executions",
    ["agent_id", "status"]
)

agent_execution_duration_seconds = Histogram(
    "agent_execution_duration_seconds",
    "Agent execution duration",
    ["agent_id"],
    buckets=[0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0, 120.0]
)

agent_tokens_used = Counter(
    "agent_tokens_used_total",
    "Total tokens used",
    ["agent_id", "model"]
)

# Business metrics
active_users = Gauge(
    "active_users",
    "Currently active users"
)

active_agents = Gauge(
    "active_agents_total",
    "Total active agents",
    ["organization_id"]
)

# System metrics
db_connections_active = Gauge(
    "db_connections_active",
    "Active database connections"
)

redis_connections_active = Gauge(
    "redis_connections_active",
    "Active Redis connections"
)

# App info
app_info = Info(
    "app",
    "Application information"
)
app_info.info({"version": "1.0.0", "environment": "production"})
```

### Metrics Middleware

```python
# app/core/middleware.py
import time
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.metrics import http_requests_total, http_request_duration_seconds

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.perf_counter()

        response = await call_next(request)

        duration = time.perf_counter() - start_time
        endpoint = self._get_endpoint(request)

        http_requests_total.labels(
            method=request.method,
            endpoint=endpoint,
            status=response.status_code
        ).inc()

        http_request_duration_seconds.labels(
            method=request.method,
            endpoint=endpoint
        ).observe(duration)

        return response

    def _get_endpoint(self, request) -> str:
        # Normalize endpoint for consistent labeling
        path = request.url.path
        # Replace IDs with placeholders
        import re
        path = re.sub(r'/[a-f0-9-]{36}', '/{id}', path)
        path = re.sub(r'/\d+', '/{id}', path)
        return path
```

### Prometheus Endpoint

```python
# app/api/routes/metrics.py
from fastapi import APIRouter
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

router = APIRouter()

@router.get("/metrics")
async def metrics():
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )
```

---

## Dashboards

### System Overview Dashboard

```json
{
  "title": "Agent Platform - System Overview",
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(http_requests_total[5m])",
          "legendFormat": "{{method}} {{endpoint}}"
        }
      ]
    },
    {
      "title": "Error Rate",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m]) * 100",
          "legendFormat": "Error %"
        }
      ]
    },
    {
      "title": "Response Time (p95)",
      "type": "graph",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
          "legendFormat": "p95"
        }
      ]
    },
    {
      "title": "Active Connections",
      "type": "stat",
      "targets": [
        {
          "expr": "db_connections_active",
          "legendFormat": "DB"
        },
        {
          "expr": "redis_connections_active",
          "legendFormat": "Redis"
        }
      ]
    }
  ]
}
```

### Agent Execution Dashboard

```json
{
  "title": "Agent Platform - Executions",
  "panels": [
    {
      "title": "Executions per Minute",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(agent_executions_total[1m]) * 60",
          "legendFormat": "{{status}}"
        }
      ]
    },
    {
      "title": "Execution Duration (p50, p95, p99)",
      "type": "graph",
      "targets": [
        {
          "expr": "histogram_quantile(0.50, rate(agent_execution_duration_seconds_bucket[5m]))",
          "legendFormat": "p50"
        },
        {
          "expr": "histogram_quantile(0.95, rate(agent_execution_duration_seconds_bucket[5m]))",
          "legendFormat": "p95"
        },
        {
          "expr": "histogram_quantile(0.99, rate(agent_execution_duration_seconds_bucket[5m]))",
          "legendFormat": "p99"
        }
      ]
    },
    {
      "title": "Token Usage",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(agent_tokens_used_total[5m]) * 60",
          "legendFormat": "{{model}}"
        }
      ]
    },
    {
      "title": "Success Rate",
      "type": "gauge",
      "targets": [
        {
          "expr": "rate(agent_executions_total{status=\"success\"}[5m]) / rate(agent_executions_total[5m]) * 100"
        }
      ]
    }
  ]
}
```

---

## Alerts

### Alert Rules

```yaml
# prometheus/alerts/platform.yaml
groups:
  - name: platform-alerts
    rules:
      # High Error Rate
      - alert: HighErrorRate
        expr: |
          (
            rate(http_requests_total{status=~"5.."}[5m])
            / rate(http_requests_total[5m])
          ) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} over the last 5 minutes"

      # Slow Response Time
      - alert: SlowResponseTime
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow response times"
          description: "95th percentile response time is {{ $value }}s"

      # High Latency Agent Executions
      - alert: SlowAgentExecutions
        expr: |
          histogram_quantile(0.95, rate(agent_execution_duration_seconds_bucket[5m])) > 30
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Agent executions are slow"
          description: "95th percentile execution time is {{ $value }}s"

      # Database Connection Pool Exhaustion
      - alert: DatabaseConnectionPoolLow
        expr: db_connections_active > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connection pool running low"
          description: "{{ $value }} active connections (threshold: 80)"

      # High Token Usage
      - alert: HighTokenUsage
        expr: |
          increase(agent_tokens_used_total[1h]) > 1000000
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "High token usage"
          description: "{{ $value }} tokens used in the last hour"

      # Service Down
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.job }} has been down for more than 1 minute"
```

### Infrastructure Alerts

```yaml
# prometheus/alerts/infrastructure.yaml
groups:
  - name: infrastructure-alerts
    rules:
      # High CPU
      - alert: HighCPUUsage
        expr: |
          100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}%"

      # High Memory
      - alert: HighMemoryUsage
        expr: |
          (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 > 85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value }}%"

      # Disk Space
      - alert: LowDiskSpace
        expr: |
          (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes) * 100 < 15
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space on {{ $labels.instance }}"
          description: "Only {{ $value }}% disk space remaining"

      # Pod Restart
      - alert: PodRestarting
        expr: |
          increase(kube_pod_container_status_restarts_total[1h]) > 3
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Pod {{ $labels.pod }} restarting frequently"
          description: "{{ $value }} restarts in the last hour"
```

---

## AlertManager Configuration

```yaml
# alertmanager/config.yaml
global:
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@agentplatform.com'

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default'

  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      continue: true

    - match:
        severity: warning
      receiver: 'slack-warnings'

receivers:
  - name: 'default'
    email_configs:
      - to: 'oncall@agentplatform.com'

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
        severity: critical

  - name: 'slack-warnings'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname']
```

---

## Distributed Tracing

### OpenTelemetry Setup

```python
# app/core/tracing.py
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor

def setup_tracing(app, service_name: str):
    # Set up tracer provider
    provider = TracerProvider()

    # Configure Jaeger exporter
    jaeger_exporter = JaegerExporter(
        agent_host_name="jaeger",
        agent_port=6831,
    )

    provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
    trace.set_tracer_provider(provider)

    # Instrument libraries
    FastAPIInstrumentor.instrument_app(app)
    HTTPXClientInstrumentor().instrument()
    SQLAlchemyInstrumentor().instrument()
    RedisInstrumentor().instrument()

    return trace.get_tracer(service_name)
```

### Custom Spans

```python
# app/services/agent_service.py
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

class AgentService:
    async def execute(self, agent_id: str, input: str):
        with tracer.start_as_current_span("agent_execution") as span:
            span.set_attribute("agent_id", agent_id)
            span.set_attribute("input_length", len(input))

            # Load agent
            with tracer.start_as_current_span("load_agent"):
                agent = await self.get_agent(agent_id)

            # Execute LLM
            with tracer.start_as_current_span("llm_call") as llm_span:
                llm_span.set_attribute("model", agent.model)
                result = await self.call_llm(agent, input)
                llm_span.set_attribute("tokens_used", result.tokens)

            # Process tools
            with tracer.start_as_current_span("tool_execution"):
                final_result = await self.process_tools(result)

            span.set_attribute("status", "success")
            return final_result
```

---

## Log Aggregation

### Loki Configuration

```yaml
# loki/config.yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1

schema_config:
  configs:
    - from: 2026-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h  # 7 days
```

### Log Queries (LogQL)

```logql
# All errors in last hour
{app="agent-platform"} |= "level=error"

# Errors by service
sum by (service) (rate({app="agent-platform"} |= "level=error" [5m]))

# Slow requests (>1s)
{app="agent-platform"} | json | duration_ms > 1000

# Failed agent executions
{app="agent-platform", component="agent_service"} |= "execution failed"

# Authentication failures
{app="agent-platform"} |= "Login failed" | json | count_over_time([1h])
```

---

## Health Checks

### Endpoints

```python
# app/api/routes/health.py
from fastapi import APIRouter
from app.db import database
from app.services.redis import redis_client

router = APIRouter()

@router.get("/health")
async def health():
    """Basic health check."""
    return {"status": "healthy"}

@router.get("/ready")
async def readiness():
    """Readiness check - verify dependencies."""
    checks = {}

    # Database
    try:
        await database.execute("SELECT 1")
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {e}"

    # Redis
    try:
        await redis_client.ping()
        checks["redis"] = "healthy"
    except Exception as e:
        checks["redis"] = f"unhealthy: {e}"

    all_healthy = all(v == "healthy" for v in checks.values())
    status_code = 200 if all_healthy else 503

    return JSONResponse(
        content={"status": "ready" if all_healthy else "not_ready", "checks": checks},
        status_code=status_code
    )

@router.get("/live")
async def liveness():
    """Liveness check - is the process alive."""
    return {"status": "alive"}
```

### Kubernetes Probes

```yaml
# kubernetes/deployment.yaml
spec:
  containers:
    - name: api
      livenessProbe:
        httpGet:
          path: /live
          port: 8000
        initialDelaySeconds: 10
        periodSeconds: 10
        failureThreshold: 3

      readinessProbe:
        httpGet:
          path: /ready
          port: 8000
        initialDelaySeconds: 5
        periodSeconds: 5
        failureThreshold: 3

      startupProbe:
        httpGet:
          path: /health
          port: 8000
        initialDelaySeconds: 5
        periodSeconds: 5
        failureThreshold: 30
```

---

## SLOs and SLIs

### Service Level Indicators

| SLI | Target | Measurement |
|-----|--------|-------------|
| Availability | 99.9% | `up{job="api"}` |
| Latency (p95) | < 500ms | `histogram_quantile(0.95, http_request_duration_seconds)` |
| Error Rate | < 0.1% | `rate(http_requests_total{status=~"5.."}[5m])` |
| Agent Success Rate | > 95% | `rate(agent_executions_total{status="success"}[5m])` |

### SLO Dashboard

```json
{
  "title": "SLO Dashboard",
  "panels": [
    {
      "title": "Availability (30d)",
      "type": "stat",
      "targets": [
        {
          "expr": "avg_over_time(up{job=\"api\"}[30d]) * 100"
        }
      ],
      "thresholds": [
        {"value": 99.9, "color": "green"},
        {"value": 99.5, "color": "yellow"},
        {"value": 0, "color": "red"}
      ]
    },
    {
      "title": "Error Budget Remaining",
      "type": "gauge",
      "targets": [
        {
          "expr": "1 - (sum(rate(http_requests_total{status=~\"5..\"}[30d])) / sum(rate(http_requests_total[30d]))) / 0.001 * 100"
        }
      ]
    }
  ]
}
```

---

## Best Practices

### DO

- Use consistent metric naming
- Add relevant labels (but not too many)
- Set up dashboards for each service
- Configure alerts with appropriate thresholds
- Include runbooks in alert annotations

### DON'T

- Create high-cardinality labels
- Alert on every metric
- Ignore alert fatigue
- Skip distributed tracing
- Forget to monitor dependencies
