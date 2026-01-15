# Rate Limiting Strategy

## Overview

This document defines the rate limiting strategy for the AI Agent Platform to ensure fair usage, prevent abuse, and maintain system stability.

---

## Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Client     │────►│  API Gateway    │────►│   Backend    │
└──────────────┘     │  (Rate Limiter) │     │   Services   │
                     └─────────────────┘     └──────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │     Redis       │
                     │  (Rate State)   │
                     └─────────────────┘
```

---

## Rate Limit Tiers

### By Plan

| Plan | API Requests/min | Executions/min | Tokens/day | WebSocket Connections |
|------|------------------|----------------|------------|----------------------|
| Free | 20 | 5 | 10,000 | 1 |
| Starter | 100 | 20 | 100,000 | 3 |
| Pro | 500 | 100 | 1,000,000 | 10 |
| Team | 2,000 | 500 | 5,000,000 | 50 |
| Enterprise | Custom | Custom | Custom | Custom |

### By Endpoint Category

| Category | Rate Limit | Burst |
|----------|------------|-------|
| Authentication | 10/min | 20 |
| Read operations | 100/min | 200 |
| Write operations | 50/min | 100 |
| Agent executions | Plan-based | 2x |
| Webhooks | 1000/min | 2000 |
| Admin operations | 20/min | 40 |

---

## Implementation

### Token Bucket Algorithm

```python
# app/core/rate_limiter.py
import time
from dataclasses import dataclass
from typing import Optional
import redis.asyncio as redis

@dataclass
class RateLimitResult:
    allowed: bool
    remaining: int
    reset_at: float
    retry_after: Optional[float] = None


class TokenBucketRateLimiter:
    """
    Token bucket rate limiter using Redis.

    Allows bursting while maintaining average rate.
    """

    def __init__(
        self,
        redis_client: redis.Redis,
        rate: int,  # tokens per interval
        interval: int = 60,  # seconds
        burst: Optional[int] = None,  # max burst size
    ):
        self.redis = redis_client
        self.rate = rate
        self.interval = interval
        self.burst = burst or rate * 2

    async def check(self, key: str) -> RateLimitResult:
        """Check if request is allowed and consume a token."""
        now = time.time()
        bucket_key = f"ratelimit:{key}"

        # Lua script for atomic token bucket operation
        lua_script = """
        local key = KEYS[1]
        local rate = tonumber(ARGV[1])
        local interval = tonumber(ARGV[2])
        local burst = tonumber(ARGV[3])
        local now = tonumber(ARGV[4])

        local bucket = redis.call('HMGET', key, 'tokens', 'last_update')
        local tokens = tonumber(bucket[1]) or burst
        local last_update = tonumber(bucket[2]) or now

        -- Calculate tokens to add based on time elapsed
        local elapsed = now - last_update
        local tokens_to_add = (elapsed / interval) * rate
        tokens = math.min(burst, tokens + tokens_to_add)

        -- Check if we have tokens available
        if tokens >= 1 then
            tokens = tokens - 1
            redis.call('HMSET', key, 'tokens', tokens, 'last_update', now)
            redis.call('EXPIRE', key, interval * 2)
            return {1, tokens, now + ((1 - tokens) / rate) * interval}
        else
            -- Calculate when next token will be available
            local retry_after = ((1 - tokens) / rate) * interval
            return {0, 0, now + retry_after, retry_after}
        end
        """

        result = await self.redis.execute_command(
            "EVAL",
            lua_script,
            1,
            bucket_key,
            self.rate,
            self.interval,
            self.burst,
            now
        )

        return RateLimitResult(
            allowed=bool(result[0]),
            remaining=int(result[1]),
            reset_at=float(result[2]),
            retry_after=float(result[3]) if len(result) > 3 else None
        )
```

### Sliding Window Counter

```python
# app/core/sliding_window.py

class SlidingWindowRateLimiter:
    """
    Sliding window rate limiter.

    More accurate than fixed windows, prevents boundary issues.
    """

    def __init__(
        self,
        redis_client: redis.Redis,
        limit: int,
        window_size: int = 60,  # seconds
    ):
        self.redis = redis_client
        self.limit = limit
        self.window_size = window_size

    async def check(self, key: str) -> RateLimitResult:
        now = time.time()
        window_key = f"ratelimit:window:{key}"

        # Remove old entries
        cutoff = now - self.window_size
        await self.redis.zremrangebyscore(window_key, 0, cutoff)

        # Count current window
        count = await self.redis.zcard(window_key)

        if count < self.limit:
            # Add this request
            await self.redis.zadd(window_key, {str(now): now})
            await self.redis.expire(window_key, self.window_size)

            return RateLimitResult(
                allowed=True,
                remaining=self.limit - count - 1,
                reset_at=now + self.window_size
            )
        else:
            # Get oldest entry to calculate retry time
            oldest = await self.redis.zrange(window_key, 0, 0, withscores=True)
            retry_after = self.window_size - (now - oldest[0][1]) if oldest else self.window_size

            return RateLimitResult(
                allowed=False,
                remaining=0,
                reset_at=now + retry_after,
                retry_after=retry_after
            )
```

### Rate Limit Middleware

```python
# app/core/middleware.py
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.rate_limiter import TokenBucketRateLimiter

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, redis_client):
        super().__init__(app)
        self.limiters = {
            "default": TokenBucketRateLimiter(redis_client, rate=100, burst=200),
            "auth": TokenBucketRateLimiter(redis_client, rate=10, burst=20),
            "executions": TokenBucketRateLimiter(redis_client, rate=20, burst=40),
        }

    async def dispatch(self, request: Request, call_next):
        # Determine rate limit category
        category = self._get_category(request.url.path)
        limiter = self.limiters.get(category, self.limiters["default"])

        # Get rate limit key (user_id or IP)
        key = self._get_key(request)

        # Check rate limit
        result = await limiter.check(key)

        # Set rate limit headers
        response = None
        if result.allowed:
            response = await call_next(request)
        else:
            raise HTTPException(
                status_code=429,
                detail={
                    "code": "RATE_LIMITED",
                    "message": "Too many requests",
                    "retry_after": result.retry_after
                }
            )

        # Add headers
        response.headers["X-RateLimit-Limit"] = str(limiter.rate)
        response.headers["X-RateLimit-Remaining"] = str(result.remaining)
        response.headers["X-RateLimit-Reset"] = str(int(result.reset_at))

        return response

    def _get_category(self, path: str) -> str:
        if "/auth" in path:
            return "auth"
        if "/execute" in path or "/run" in path:
            return "executions"
        return "default"

    def _get_key(self, request: Request) -> str:
        # Prefer user ID, fall back to IP
        if hasattr(request.state, "user"):
            return f"user:{request.state.user.id}"
        return f"ip:{request.client.host}"
```

---

## Response Headers

All rate-limited responses include these headers:

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Max requests in window | `100` |
| `X-RateLimit-Remaining` | Remaining requests | `45` |
| `X-RateLimit-Reset` | Unix timestamp when limit resets | `1704979260` |
| `Retry-After` | Seconds to wait (when limited) | `30` |

### Example Response (Rate Limited)

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704979260
Retry-After: 45

{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please retry after 45 seconds.",
    "retry_after": 45
  }
}
```

---

## Per-Endpoint Limits

### Authentication

```python
RATE_LIMITS = {
    "POST /api/v1/auth/login": {"rate": 5, "interval": 60},
    "POST /api/v1/auth/register": {"rate": 3, "interval": 60},
    "POST /api/v1/auth/forgot-password": {"rate": 3, "interval": 300},
    "POST /api/v1/auth/refresh": {"rate": 30, "interval": 60},
}
```

### Agents

```python
RATE_LIMITS = {
    "GET /api/v1/agents": {"rate": 100, "interval": 60},
    "POST /api/v1/agents": {"rate": 10, "interval": 60},
    "POST /api/v1/agents/{id}/run": "plan_based",  # Uses plan limits
    "POST /api/v1/agents/{id}/run/stream": "plan_based",
}
```

---

## Distributed Rate Limiting

### Redis Cluster

```python
# For high availability
redis_cluster = RedisCluster(
    startup_nodes=[
        {"host": "redis-1", "port": 6379},
        {"host": "redis-2", "port": 6379},
        {"host": "redis-3", "port": 6379},
    ]
)
```

### Consistent Hashing

Ensure same user always hits same Redis node:

```python
def get_redis_node(user_id: str) -> redis.Redis:
    # Consistent hash to select node
    hash_value = hashlib.md5(user_id.encode()).hexdigest()
    node_index = int(hash_value, 16) % len(redis_nodes)
    return redis_nodes[node_index]
```

---

## Cost-Based Rate Limiting

For LLM operations, limit by token usage instead of request count:

```python
class TokenUsageRateLimiter:
    """Rate limit based on token consumption."""

    def __init__(self, redis_client, daily_limit: int):
        self.redis = redis_client
        self.daily_limit = daily_limit

    async def check_and_reserve(
        self,
        user_id: str,
        estimated_tokens: int
    ) -> RateLimitResult:
        today = datetime.now().strftime("%Y-%m-%d")
        key = f"tokens:{user_id}:{today}"

        current = await self.redis.get(key) or 0
        current = int(current)

        if current + estimated_tokens > self.daily_limit:
            return RateLimitResult(
                allowed=False,
                remaining=max(0, self.daily_limit - current),
                reset_at=self._next_midnight(),
                retry_after=self._seconds_until_midnight()
            )

        # Reserve tokens
        await self.redis.incrby(key, estimated_tokens)
        await self.redis.expireat(key, self._next_midnight())

        return RateLimitResult(
            allowed=True,
            remaining=self.daily_limit - current - estimated_tokens,
            reset_at=self._next_midnight()
        )

    async def refund(self, user_id: str, tokens: int):
        """Refund unused reserved tokens."""
        today = datetime.now().strftime("%Y-%m-%d")
        key = f"tokens:{user_id}:{today}"
        await self.redis.decrby(key, tokens)
```

---

## Bypass & Exemptions

### Allowlisting

```python
RATE_LIMIT_ALLOWLIST = {
    "internal_services": ["10.0.0.0/8"],
    "health_checks": ["/health", "/ready"],
    "static_assets": ["/static/", "/favicon.ico"],
}

async def should_bypass(request: Request) -> bool:
    # Check if internal service
    if is_internal_ip(request.client.host):
        return True

    # Check if health check
    if request.url.path in RATE_LIMIT_ALLOWLIST["health_checks"]:
        return True

    return False
```

---

## Monitoring

### Metrics

```python
# Prometheus metrics
rate_limit_hits = Counter(
    "rate_limit_hits_total",
    "Total rate limit hits",
    ["endpoint", "user_tier"]
)

rate_limit_remaining = Gauge(
    "rate_limit_remaining",
    "Remaining rate limit quota",
    ["user_id"]
)
```

### Alerts

```yaml
# prometheus/alerts/rate_limiting.yaml
groups:
  - name: rate-limiting
    rules:
      - alert: HighRateLimitHits
        expr: rate(rate_limit_hits_total[5m]) > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High rate of rate limit hits"
```

---

## Client Best Practices

### Exponential Backoff

```typescript
async function requestWithRetry(url: string, options: RequestInit) {
  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      const backoff = Math.min(retryAfter * 1000, Math.pow(2, retryCount) * 1000);

      await new Promise(resolve => setTimeout(resolve, backoff));
      retryCount++;
      continue;
    }

    return response;
  }

  throw new Error('Max retries exceeded');
}
```

---

## Best Practices

### DO

- Use sliding windows for accuracy
- Include rate limit headers in all responses
- Implement graceful degradation
- Monitor rate limit hits
- Provide clear error messages

### DON'T

- Rate limit health check endpoints
- Use only IP-based limiting (easy to bypass)
- Set limits too aggressively
- Forget to handle clock skew in distributed systems
- Ignore burst traffic patterns
