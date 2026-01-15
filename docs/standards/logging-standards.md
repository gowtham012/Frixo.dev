# Logging Standards

## Overview

This document defines the logging strategy for the AI Agent Platform using **structured logging** with **structlog** for Python services.

---

## Logging Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Application Logging | structlog | Structured JSON logs |
| Log Aggregation | Loki / ELK | Centralized storage |
| Visualization | Grafana | Log search & dashboards |
| Alerting | Grafana Alerts | Log-based alerts |

---

## Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| `DEBUG` | Detailed diagnostic info | Variable values, function entry/exit |
| `INFO` | Normal operations | User logged in, agent started |
| `WARNING` | Unexpected but handled | Retry attempt, deprecated usage |
| `ERROR` | Error that needs attention | Failed operation, exception caught |
| `CRITICAL` | System-wide failure | Database down, out of memory |

### Level Guidelines

```python
# DEBUG - Verbose debugging (disabled in production)
logger.debug("Processing request", request_id=req_id, payload=payload)

# INFO - Normal operations
logger.info("Agent created", agent_id=agent.id, user_id=user.id)

# WARNING - Something unexpected happened
logger.warning("Retry attempt", attempt=3, max_attempts=5, error=str(e))

# ERROR - Operation failed
logger.error("Agent execution failed", agent_id=agent_id, error=str(e))

# CRITICAL - System failure
logger.critical("Database connection lost", host=db_host)
```

---

## Structured Logging Setup

### Configuration

```python
# app/utils/logging.py

import structlog
import logging
import sys
from app.config import settings


def setup_logging():
    """Configure structured logging."""

    # Determine processors based on environment
    if settings.is_production:
        # JSON format for production (machine-readable)
        renderer = structlog.processors.JSONRenderer()
    else:
        # Pretty console output for development
        renderer = structlog.dev.ConsoleRenderer(colors=True)

    structlog.configure(
        processors=[
            # Add context
            structlog.contextvars.merge_contextvars,
            # Add log level
            structlog.stdlib.add_log_level,
            # Add logger name
            structlog.stdlib.add_logger_name,
            # Add timestamp
            structlog.processors.TimeStamper(fmt="iso"),
            # Add stack info for exceptions
            structlog.processors.StackInfoRenderer(),
            # Format exceptions
            structlog.processors.format_exc_info,
            # Render to JSON or console
            renderer,
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL),
    )

    # Reduce noise from third-party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
```

### Usage

```python
import structlog

logger = structlog.get_logger(__name__)

# Simple logging
logger.info("Application started")

# With context
logger.info("User logged in", user_id="usr_123", email="user@example.com")

# With exception
try:
    await process_data()
except Exception as e:
    logger.error("Processing failed", error=str(e), exc_info=True)
```

---

## Log Context

### Request Context Middleware

```python
# app/core/middleware.py

import uuid
import structlog
from starlette.middleware.base import BaseHTTPMiddleware

class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Generate request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        # Bind context for all logs in this request
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            path=request.url.path,
            method=request.method,
        )

        # Add request ID to response headers
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id

        return response
```

### User Context

```python
# app/api/deps.py

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    user = await auth_service.get_user_from_token(token)

    # Bind user context for logging
    structlog.contextvars.bind_contextvars(
        user_id=str(user.id),
        org_id=str(user.organization_id),
    )

    return user
```

---

## Log Format

### Production (JSON)

```json
{
  "timestamp": "2026-01-11T10:30:00.123456Z",
  "level": "info",
  "logger": "app.services.agent_service",
  "message": "Agent execution completed",
  "request_id": "req_abc123",
  "user_id": "usr_xyz789",
  "org_id": "org_123456",
  "agent_id": "agt_abc123",
  "latency_ms": 1523,
  "tokens_used": 850
}
```

### Development (Console)

```
2026-01-11 10:30:00 [info     ] Agent execution completed    agent_id=agt_abc123 latency_ms=1523 request_id=req_abc123 tokens_used=850 user_id=usr_xyz789
```

---

## What to Log

### Always Log

```python
# Authentication events
logger.info("User logged in", user_id=user.id, method="password")
logger.info("User logged out", user_id=user.id)
logger.warning("Login failed", email=email, reason="invalid_password")

# Authorization events
logger.warning("Permission denied", user_id=user.id, resource="agent", action="delete")

# Business operations
logger.info("Agent created", agent_id=agent.id, user_id=user.id)
logger.info("Agent execution started", agent_id=agent.id, input_size=len(input))
logger.info("Agent execution completed", agent_id=agent.id, latency_ms=latency)

# External integrations
logger.info("Integration connected", provider="linkedin", user_id=user.id)
logger.error("Integration failed", provider="slack", error=str(e))

# Billing events
logger.info("Subscription created", org_id=org.id, plan="pro")
logger.warning("Quota exceeded", org_id=org.id, resource="executions")
```

### Never Log

```python
# NEVER log these - security risk!
password = "secret123"
logger.info("User login", password=password)  # NEVER!

api_key = "sk-xxx"
logger.debug("API call", api_key=api_key)  # NEVER!

credit_card = "4111..."
logger.info("Payment", card=credit_card)  # NEVER!
```

### Log Sensitive Data Safely

```python
# Mask sensitive data
def mask_email(email: str) -> str:
    parts = email.split("@")
    return f"{parts[0][:2]}***@{parts[1]}"

def mask_api_key(key: str) -> str:
    return f"{key[:8]}...{key[-4:]}"

logger.info("API key created", key=mask_api_key(api_key))
logger.info("User created", email=mask_email(user.email))
```

---

## Request/Response Logging

### Request Logging Middleware

```python
# app/core/middleware.py

import time
import structlog

logger = structlog.get_logger()

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.perf_counter()

        # Log request
        logger.info(
            "Request started",
            method=request.method,
            path=request.url.path,
            query=str(request.query_params),
            client_ip=request.client.host,
        )

        response = await call_next(request)

        # Calculate duration
        duration_ms = (time.perf_counter() - start_time) * 1000

        # Log response
        logger.info(
            "Request completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration_ms, 2),
        )

        return response
```

---

## Error Logging

### Exception Logging

```python
# Include full context for errors
try:
    result = await agent_executor.run(agent, input_data)
except Exception as e:
    logger.error(
        "Agent execution failed",
        agent_id=agent.id,
        agent_name=agent.name,
        input_size=len(str(input_data)),
        error_type=type(e).__name__,
        error_message=str(e),
        exc_info=True,  # Include stack trace
    )
    raise
```

### Error Aggregation

```python
# Track error patterns
from collections import defaultdict

error_counts = defaultdict(int)

def log_error_with_aggregation(error_type: str, **context):
    error_counts[error_type] += 1
    logger.error(
        "Error occurred",
        error_type=error_type,
        occurrence_count=error_counts[error_type],
        **context,
    )
```

---

## Performance Logging

### Operation Timing

```python
import time
from contextlib import contextmanager

@contextmanager
def log_timing(operation: str, **context):
    start = time.perf_counter()
    try:
        yield
    finally:
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            f"{operation} completed",
            duration_ms=round(duration_ms, 2),
            **context,
        )

# Usage
with log_timing("database_query", table="agents", query_type="select"):
    agents = await db.agents.filter(org_id=org_id).all()
```

### Slow Operation Warnings

```python
SLOW_THRESHOLD_MS = 1000

async def execute_with_timing(operation, *args, **kwargs):
    start = time.perf_counter()
    result = await operation(*args, **kwargs)
    duration_ms = (time.perf_counter() - start) * 1000

    if duration_ms > SLOW_THRESHOLD_MS:
        logger.warning(
            "Slow operation detected",
            operation=operation.__name__,
            duration_ms=round(duration_ms, 2),
            threshold_ms=SLOW_THRESHOLD_MS,
        )

    return result
```

---

## Audit Logging

### Audit Log Service

```python
# app/services/audit_service.py

import structlog

audit_logger = structlog.get_logger("audit")

class AuditService:
    async def log(
        self,
        action: str,
        resource_type: str,
        resource_id: str,
        user_id: str,
        org_id: str,
        details: dict | None = None,
    ):
        audit_logger.info(
            "Audit event",
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            user_id=user_id,
            org_id=org_id,
            details=details,
        )

        # Also persist to database for compliance
        await self.persist_audit_log(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            user_id=user_id,
            org_id=org_id,
            details=details,
        )

# Usage
await audit_service.log(
    action="delete",
    resource_type="agent",
    resource_id=agent.id,
    user_id=user.id,
    org_id=user.organization_id,
    details={"agent_name": agent.name},
)
```

---

## Log Retention

| Environment | Retention | Storage |
|-------------|-----------|---------|
| Development | 7 days | Local |
| Staging | 30 days | Loki |
| Production | 90 days | Loki + S3 archive |
| Audit Logs | 7 years | S3 Glacier |

---

## Grafana Queries

### Common Queries

```logql
# All errors in last hour
{app="agent-platform"} |= "level=error"

# Errors by service
sum by (logger) (rate({app="agent-platform"} |= "level=error" [5m]))

# Slow requests (>1s)
{app="agent-platform"} | json | duration_ms > 1000

# Failed agent executions
{app="agent-platform", logger="agent_service"} |= "Agent execution failed"

# User login failures
{app="agent-platform"} |= "Login failed"
```

---

## Best Practices

### DO

- Use structured logging (key-value pairs)
- Include request_id in all logs
- Log at appropriate levels
- Include relevant context
- Use consistent field names
- Rotate and archive logs

### DON'T

- Log sensitive data (passwords, keys, PII)
- Log at DEBUG in production
- Create log spam (thousands/second)
- Use print() instead of logger
- Log entire request/response bodies
- Forget to include error context
