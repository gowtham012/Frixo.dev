# Caching Strategy

## Overview

This document defines the caching strategy for the AI Agent Platform using **Redis** for distributed caching and application-level caching patterns.

---

## Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Client     │────►│  CDN (Edge)     │     │   Database   │
│   Browser    │     │  Cloudflare     │     │  PostgreSQL  │
└──────────────┘     └────────┬────────┘     └──────────────┘
                              │                      ▲
                              ▼                      │
                     ┌─────────────────┐     ┌──────┴───────┐
                     │   API Gateway   │────►│    Redis     │
                     │   (FastAPI)     │     │   Cache      │
                     └─────────────────┘     └──────────────┘
```

---

## Cache Layers

| Layer | Technology | TTL | Use Case |
|-------|------------|-----|----------|
| Browser | HTTP Cache | 1 hour | Static assets |
| CDN | Cloudflare | 5 min | Public API responses |
| Application | Redis | Varies | Session, user data, agent configs |
| Database | Query Cache | 1 min | Frequent queries |

---

## Redis Cache Implementation

### Cache Service

```python
# app/services/cache_service.py
import json
from typing import Optional, Any, TypeVar, Callable
from functools import wraps
import redis.asyncio as redis
from pydantic import BaseModel

T = TypeVar("T")

class CacheService:
    """Redis-based caching service."""

    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
        self.default_ttl = 300  # 5 minutes

    async def get(self, key: str) -> Optional[str]:
        """Get value from cache."""
        return await self.redis.get(key)

    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> None:
        """Set value in cache."""
        ttl = ttl or self.default_ttl
        if isinstance(value, BaseModel):
            value = value.model_dump_json()
        elif not isinstance(value, str):
            value = json.dumps(value)
        await self.redis.set(key, value, ex=ttl)

    async def delete(self, key: str) -> None:
        """Delete key from cache."""
        await self.redis.delete(key)

    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern."""
        keys = []
        async for key in self.redis.scan_iter(match=pattern):
            keys.append(key)
        if keys:
            return await self.redis.delete(*keys)
        return 0

    async def get_or_set(
        self,
        key: str,
        factory: Callable[[], T],
        ttl: Optional[int] = None
    ) -> T:
        """Get from cache or compute and cache."""
        cached = await self.get(key)
        if cached:
            return json.loads(cached)

        value = await factory() if asyncio.iscoroutinefunction(factory) else factory()
        await self.set(key, value, ttl)
        return value
```

### Cache Decorator

```python
# app/core/cache.py
from functools import wraps

def cached(
    key_prefix: str,
    ttl: int = 300,
    key_builder: Optional[Callable] = None
):
    """
    Decorator for caching function results.

    Usage:
        @cached("user", ttl=3600)
        async def get_user(user_id: str) -> User:
            return await db.users.get(user_id)

        @cached("agent", key_builder=lambda agent_id, version: f"{agent_id}:{version}")
        async def get_agent(agent_id: str, version: str) -> Agent:
            return await db.agents.get(agent_id, version)
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Build cache key
            if key_builder:
                cache_key = f"{key_prefix}:{key_builder(*args, **kwargs)}"
            else:
                key_parts = [str(arg) for arg in args]
                key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()))
                cache_key = f"{key_prefix}:{':'.join(key_parts)}"

            # Try cache
            cached = await cache_service.get(cache_key)
            if cached:
                return json.loads(cached)

            # Execute and cache
            result = await func(*args, **kwargs)
            await cache_service.set(cache_key, result, ttl)
            return result

        return wrapper
    return decorator
```

---

## Cache Key Patterns

### Naming Convention

```
{entity}:{identifier}:{optional_variant}
```

### Examples

| Pattern | Example | TTL |
|---------|---------|-----|
| User | `user:usr_abc123` | 1 hour |
| User permissions | `user:usr_abc123:permissions` | 5 min |
| Agent | `agent:agt_xyz789` | 30 min |
| Agent config | `agent:agt_xyz789:config` | 30 min |
| Organization | `org:org_123456` | 1 hour |
| Session | `session:sess_abc` | 24 hours |
| Rate limit | `ratelimit:user:usr_abc123` | 1 min |
| API response | `api:agents:list:org_123:page_1` | 1 min |

---

## Cache Invalidation

### Event-Based Invalidation

```python
# app/events/cache_invalidation.py
from app.core.events import EventBus

class CacheInvalidationHandler:
    def __init__(self, cache: CacheService):
        self.cache = cache

    async def on_user_updated(self, event: UserUpdatedEvent):
        """Invalidate user cache when user is updated."""
        await self.cache.delete(f"user:{event.user_id}")
        await self.cache.delete(f"user:{event.user_id}:permissions")

    async def on_agent_updated(self, event: AgentUpdatedEvent):
        """Invalidate agent cache when agent is updated."""
        await self.cache.delete(f"agent:{event.agent_id}")
        await self.cache.delete(f"agent:{event.agent_id}:config")
        # Also invalidate list caches
        await self.cache.delete_pattern(f"api:agents:list:*")

    async def on_organization_updated(self, event: OrgUpdatedEvent):
        """Invalidate org cache when org is updated."""
        await self.cache.delete(f"org:{event.org_id}")

# Register handlers
event_bus = EventBus()
handler = CacheInvalidationHandler(cache_service)
event_bus.subscribe("user.updated", handler.on_user_updated)
event_bus.subscribe("agent.updated", handler.on_agent_updated)
event_bus.subscribe("organization.updated", handler.on_organization_updated)
```

### Write-Through Cache

```python
class AgentRepository:
    def __init__(self, db, cache: CacheService):
        self.db = db
        self.cache = cache

    async def get(self, agent_id: str) -> Optional[Agent]:
        # Try cache first
        cached = await self.cache.get(f"agent:{agent_id}")
        if cached:
            return Agent.model_validate_json(cached)

        # Fetch from DB
        agent = await self.db.agents.get(agent_id)
        if agent:
            await self.cache.set(f"agent:{agent_id}", agent, ttl=1800)
        return agent

    async def update(self, agent_id: str, data: dict) -> Agent:
        # Update DB
        agent = await self.db.agents.update(agent_id, data)

        # Update cache (write-through)
        await self.cache.set(f"agent:{agent_id}", agent, ttl=1800)

        return agent

    async def delete(self, agent_id: str) -> None:
        # Delete from DB
        await self.db.agents.delete(agent_id)

        # Invalidate cache
        await self.cache.delete(f"agent:{agent_id}")
```

---

## Cache Strategies by Entity

### User Data

```python
USER_CACHE_CONFIG = {
    "user_profile": {"ttl": 3600, "key": "user:{user_id}"},
    "user_permissions": {"ttl": 300, "key": "user:{user_id}:permissions"},
    "user_settings": {"ttl": 3600, "key": "user:{user_id}:settings"},
}

@cached("user", ttl=3600)
async def get_user(user_id: str) -> User:
    return await db.users.get(user_id)

@cached("user", ttl=300, key_builder=lambda uid: f"{uid}:permissions")
async def get_user_permissions(user_id: str) -> List[str]:
    return await permission_service.get_permissions(user_id)
```

### Agent Data

```python
AGENT_CACHE_CONFIG = {
    "agent": {"ttl": 1800, "key": "agent:{agent_id}"},
    "agent_config": {"ttl": 1800, "key": "agent:{agent_id}:config"},
    "agent_tools": {"ttl": 1800, "key": "agent:{agent_id}:tools"},
}

@cached("agent", ttl=1800)
async def get_agent(agent_id: str) -> Agent:
    return await db.agents.get(agent_id)
```

### API Responses

```python
# Cache list responses for short duration
@cached("api:agents:list", ttl=60, key_builder=lambda org_id, page, limit: f"{org_id}:{page}:{limit}")
async def list_agents(org_id: str, page: int = 1, limit: int = 20):
    return await db.agents.filter(organization_id=org_id).paginate(page, limit)
```

---

## HTTP Caching

### Cache-Control Headers

```python
# app/api/routes/agents.py
from fastapi import Response

@router.get("/agents/{agent_id}")
async def get_agent(
    agent_id: str,
    response: Response,
    current_user: User = Depends(get_current_user)
):
    agent = await agent_service.get(agent_id)

    # Set cache headers
    response.headers["Cache-Control"] = "private, max-age=300"
    response.headers["ETag"] = f'"{agent.updated_at.isoformat()}"'

    return agent


@router.get("/agents")
async def list_agents(
    response: Response,
    current_user: User = Depends(get_current_user)
):
    agents = await agent_service.list(current_user.organization_id)

    # Short cache for list endpoints
    response.headers["Cache-Control"] = "private, max-age=60"

    return agents


@router.get("/marketplace/listings")
async def list_marketplace(response: Response):
    listings = await marketplace_service.list_public()

    # Public endpoint - longer cache
    response.headers["Cache-Control"] = "public, max-age=300, s-maxage=600"

    return listings
```

### ETag Support

```python
# app/core/middleware.py
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class ETagMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Check If-None-Match header
        if_none_match = request.headers.get("If-None-Match")
        etag = response.headers.get("ETag")

        if if_none_match and etag and if_none_match == etag:
            return Response(status_code=304)

        return response
```

---

## Session Caching

### Session Store

```python
# app/services/session_service.py
from typing import Optional
from datetime import timedelta

class SessionService:
    def __init__(self, cache: CacheService):
        self.cache = cache
        self.session_ttl = 86400  # 24 hours

    async def create_session(self, user_id: str, data: dict) -> str:
        session_id = f"sess_{generate_id()}"

        session_data = {
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            **data
        }

        await self.cache.set(
            f"session:{session_id}",
            session_data,
            ttl=self.session_ttl
        )

        return session_id

    async def get_session(self, session_id: str) -> Optional[dict]:
        data = await self.cache.get(f"session:{session_id}")
        return json.loads(data) if data else None

    async def extend_session(self, session_id: str) -> None:
        """Extend session TTL on activity."""
        key = f"session:{session_id}"
        await self.cache.redis.expire(key, self.session_ttl)

    async def delete_session(self, session_id: str) -> None:
        await self.cache.delete(f"session:{session_id}")

    async def delete_user_sessions(self, user_id: str) -> int:
        """Delete all sessions for a user (logout everywhere)."""
        return await self.cache.delete_pattern(f"session:*:{user_id}")
```

---

## Query Result Caching

### Database Query Cache

```python
# app/db/cache.py
from sqlalchemy.ext.asyncio import AsyncSession

class CachedQuery:
    """Wrapper for caching database query results."""

    def __init__(self, db: AsyncSession, cache: CacheService):
        self.db = db
        self.cache = cache

    async def get_or_query(
        self,
        cache_key: str,
        query: Select,
        ttl: int = 60
    ):
        # Try cache
        cached = await self.cache.get(cache_key)
        if cached:
            return json.loads(cached)

        # Execute query
        result = await self.db.execute(query)
        rows = result.fetchall()

        # Cache result
        data = [dict(row._mapping) for row in rows]
        await self.cache.set(cache_key, data, ttl)

        return data
```

---

## Cache Warming

### Startup Warming

```python
# app/main.py
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up critical caches on startup
    await warm_cache()
    yield

async def warm_cache():
    """Pre-populate frequently accessed cache entries."""
    logger.info("Warming cache...")

    # Cache active organizations
    orgs = await db.organizations.filter(is_active=True).limit(1000).all()
    for org in orgs:
        await cache_service.set(f"org:{org.id}", org, ttl=3600)

    # Cache popular marketplace listings
    popular = await db.marketplace_listings.order_by("-install_count").limit(100).all()
    for listing in popular:
        await cache_service.set(f"listing:{listing.id}", listing, ttl=1800)

    logger.info(f"Cache warmed: {len(orgs)} orgs, {len(popular)} listings")
```

### Background Refresh

```python
# app/tasks/cache_refresh.py
from celery import Celery

app = Celery("tasks")

@app.task
def refresh_popular_agents_cache():
    """Refresh cache for frequently accessed agents."""
    popular_agents = db.agents.filter(
        status="active",
        is_public=True
    ).order_by("-execution_count").limit(500)

    for agent in popular_agents:
        cache_service.set(f"agent:{agent.id}", agent, ttl=1800)

# Schedule every 15 minutes
app.conf.beat_schedule = {
    "refresh-popular-agents": {
        "task": "app.tasks.cache_refresh.refresh_popular_agents_cache",
        "schedule": 900.0,  # 15 minutes
    },
}
```

---

## Monitoring

### Cache Metrics

```python
# app/core/metrics.py
from prometheus_client import Counter, Histogram, Gauge

cache_hits = Counter(
    "cache_hits_total",
    "Total cache hits",
    ["cache_type"]
)

cache_misses = Counter(
    "cache_misses_total",
    "Total cache misses",
    ["cache_type"]
)

cache_latency = Histogram(
    "cache_latency_seconds",
    "Cache operation latency",
    ["operation"]
)

cache_size = Gauge(
    "cache_size_bytes",
    "Current cache size in bytes"
)
```

### Instrumented Cache

```python
class InstrumentedCacheService(CacheService):
    async def get(self, key: str) -> Optional[str]:
        with cache_latency.labels(operation="get").time():
            result = await super().get(key)

        cache_type = key.split(":")[0]
        if result:
            cache_hits.labels(cache_type=cache_type).inc()
        else:
            cache_misses.labels(cache_type=cache_type).inc()

        return result
```

---

## Best Practices

### DO

- Use consistent key naming patterns
- Set appropriate TTLs based on data volatility
- Implement cache invalidation on writes
- Monitor cache hit rates
- Use cache warming for predictable patterns

### DON'T

- Cache sensitive data without encryption
- Set extremely long TTLs
- Skip invalidation on updates
- Cache large objects unnecessarily
- Ignore cache failures (use fallback)
