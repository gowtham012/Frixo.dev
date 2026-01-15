# API Versioning Strategy

## Overview

This document defines the API versioning strategy for the AI Agent Platform, ensuring backward compatibility, clear deprecation paths, and smooth migrations for API consumers.

---

## Versioning Approach

### URL Path Versioning

We use **URL path versioning** as the primary versioning method.

```
https://api.agentplatform.com/v1/agents
https://api.agentplatform.com/v2/agents
```

**Why URL Path Versioning:**

| Approach | Pros | Cons | Our Choice |
|----------|------|------|------------|
| URL Path (`/v1/`) | Clear, cacheable, easy routing | URL changes | ✅ Primary |
| Header (`API-Version: 1`) | Clean URLs | Hidden, harder to test | ❌ |
| Query Param (`?version=1`) | Flexible | Cache issues, messy | ❌ |
| Accept Header | RESTful | Complex, hidden | ❌ |

---

## Version Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        API Version Lifecycle                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │  Alpha   │───►│   Beta   │───►│ Stable   │───►│Deprecated│          │
│  │  (v2α)   │    │  (v2β)   │    │  (v2)    │    │  (v1)    │          │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘          │
│       │               │               │               │                 │
│       │               │               │               ▼                 │
│   Internal        Selected         General      ┌──────────┐           │
│    Only           Partners          Access      │  Sunset  │           │
│                                                 │ (Removed)│           │
│                                                 └──────────┘           │
│                                                                          │
│  Timeline:                                                               │
│  Alpha: 1-3 months (breaking changes allowed)                           │
│  Beta: 1-2 months (minor changes only)                                  │
│  Stable: 18+ months minimum support                                     │
│  Deprecated: 12 months notice before sunset                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Version States

| State | Description | Breaking Changes | Support |
|-------|-------------|------------------|---------|
| Alpha | Early development | Yes | None |
| Beta | Feature complete | Minor only | Best effort |
| Stable | Production ready | No | Full SLA |
| Deprecated | Being phased out | No | Maintenance only |
| Sunset | Removed | N/A | None |

---

## Semantic Versioning (Minor Changes)

Within a major version, we use **date-based minor versions** for non-breaking enhancements.

```
v1.2024-01-15  # Version 1, released January 15, 2024
v1.2024-03-01  # Version 1, released March 1, 2024
```

**Header for Minor Version:**

```http
GET /v1/agents HTTP/1.1
Host: api.agentplatform.com
API-Version: 2024-01-15
```

If omitted, defaults to latest stable minor version.

---

## Breaking vs Non-Breaking Changes

### Non-Breaking (Allowed in Minor Versions)

✅ Adding new endpoints
✅ Adding optional request parameters
✅ Adding new response fields
✅ Adding new enum values (with graceful handling)
✅ Increasing rate limits
✅ Adding new webhook events
✅ Performance improvements

### Breaking (Requires Major Version)

❌ Removing endpoints
❌ Removing response fields
❌ Changing field types
❌ Renaming fields
❌ Changing required parameters
❌ Changing authentication
❌ Changing error formats
❌ Reducing rate limits

---

## Implementation

### Router Structure

```python
# app/api/__init__.py
from fastapi import FastAPI

app = FastAPI()

# Version routers
from app.api.v1 import router as v1_router
from app.api.v2 import router as v2_router

app.include_router(v1_router, prefix="/v1")
app.include_router(v2_router, prefix="/v2")
```

### Version Module Structure

```
app/
├── api/
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── agents.py
│   │   │   ├── executions.py
│   │   │   └── integrations.py
│   │   ├── schemas/
│   │   │   ├── agent.py
│   │   │   └── execution.py
│   │   └── dependencies.py
│   └── v2/
│       ├── __init__.py
│       ├── routes/
│       ├── schemas/
│       └── dependencies.py
├── services/          # Shared business logic
├── repositories/      # Shared data access
└── models/           # Shared database models
```

### Shared Services Pattern

```python
# Services are version-agnostic
# app/services/agent_service.py
class AgentService:
    """Business logic shared across API versions."""

    async def create_agent(self, data: dict) -> Agent:
        """Create agent - called by both v1 and v2."""
        # Core business logic here
        pass

# V1 route uses the service
# app/api/v1/routes/agents.py
from app.services.agent_service import AgentService
from app.api.v1.schemas.agent import AgentCreateV1, AgentResponseV1

@router.post("/agents")
async def create_agent_v1(
    data: AgentCreateV1,
    service: AgentService = Depends()
) -> AgentResponseV1:
    agent = await service.create_agent(data.model_dump())
    return AgentResponseV1.from_model(agent)

# V2 route uses the same service with different schema
# app/api/v2/routes/agents.py
from app.services.agent_service import AgentService
from app.api.v2.schemas.agent import AgentCreateV2, AgentResponseV2

@router.post("/agents")
async def create_agent_v2(
    data: AgentCreateV2,
    service: AgentService = Depends()
) -> AgentResponseV2:
    agent = await service.create_agent(data.model_dump())
    return AgentResponseV2.from_model(agent)
```

### Schema Evolution

```python
# app/api/v1/schemas/agent.py
from pydantic import BaseModel

class AgentResponseV1(BaseModel):
    """V1 response - original format."""
    id: str
    name: str
    description: str
    model: str  # Simple string in v1
    created_at: datetime

    class Config:
        from_attributes = True


# app/api/v2/schemas/agent.py
class ModelConfig(BaseModel):
    """V2 introduces structured model config."""
    provider: str
    model_id: str
    temperature: float = 0.7
    max_tokens: int = 4096


class AgentResponseV2(BaseModel):
    """V2 response - enhanced format."""
    id: str
    name: str
    description: str
    model_config: ModelConfig  # Structured object in v2
    created_at: datetime
    updated_at: datetime  # New field in v2
    tags: List[str] = []  # New field in v2

    class Config:
        from_attributes = True

    @classmethod
    def from_model(cls, agent: Agent) -> "AgentResponseV2":
        """Convert database model to V2 response."""
        return cls(
            id=agent.id,
            name=agent.name,
            description=agent.description,
            model_config=ModelConfig(
                provider=agent.model_provider,
                model_id=agent.model_id,
                temperature=agent.temperature,
                max_tokens=agent.max_tokens,
            ),
            created_at=agent.created_at,
            updated_at=agent.updated_at,
            tags=agent.tags or [],
        )
```

---

## Deprecation Process

### Deprecation Headers

```python
# app/core/middleware.py
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

DEPRECATED_VERSIONS = {"v1": "2025-06-01"}

class DeprecationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Check if using deprecated version
        path = request.url.path
        for version, sunset_date in DEPRECATED_VERSIONS.items():
            if path.startswith(f"/{version}/"):
                response.headers["Deprecation"] = f"@{sunset_date}"
                response.headers["Sunset"] = sunset_date
                response.headers["Link"] = (
                    f'</v2{path[3:]}>; rel="successor-version"'
                )

        return response
```

### Response Headers Example

```http
HTTP/1.1 200 OK
Deprecation: @2025-06-01
Sunset: 2025-06-01
Link: </v2/agents>; rel="successor-version"
X-API-Warn: API version v1 is deprecated. Please migrate to v2.
```

### Deprecation Notices in Responses

```python
# app/api/v1/dependencies.py
from fastapi import Request

async def add_deprecation_warning(request: Request):
    """Add deprecation warning to v1 responses."""
    request.state.deprecation_warning = {
        "message": "API v1 is deprecated and will be removed on 2025-06-01",
        "migration_guide": "https://docs.agentplatform.com/api/migration/v1-to-v2",
        "successor": "/v2"
    }

# Include in response wrapper
class V1Response(BaseModel):
    data: Any
    deprecation: Optional[dict] = None
```

---

## Migration Support

### Migration Guide Structure

```markdown
# V1 to V2 Migration Guide

## Overview
V2 introduces enhanced agent configuration, improved error handling,
and new streaming capabilities.

## Timeline
- **2024-06-01**: V2 released (beta)
- **2024-07-01**: V2 stable
- **2024-07-15**: V1 deprecated
- **2025-06-01**: V1 sunset

## Breaking Changes

### 1. Agent Model Configuration
**V1:**
```json
{
  "model": "gpt-4"
}
```

**V2:**
```json
{
  "model_config": {
    "provider": "openai",
    "model_id": "gpt-4",
    "temperature": 0.7
  }
}
```

### 2. Error Response Format
[...]

## Migration Steps
1. Update SDK to latest version
2. Replace deprecated endpoints
3. Update request/response schemas
4. Test in staging environment
5. Deploy to production
```

### Compatibility Layer

```python
# app/api/v1/compat.py
"""V1 compatibility layer - translates v1 requests to v2 format."""

def translate_agent_create_v1_to_v2(v1_data: dict) -> dict:
    """Translate v1 agent create request to v2 format."""
    return {
        "name": v1_data["name"],
        "description": v1_data.get("description", ""),
        "model_config": {
            "provider": infer_provider(v1_data["model"]),
            "model_id": v1_data["model"],
            "temperature": v1_data.get("temperature", 0.7),
            "max_tokens": v1_data.get("max_tokens", 4096),
        },
        # New v2 fields with defaults
        "tags": [],
    }


def translate_agent_response_v2_to_v1(v2_response: dict) -> dict:
    """Translate v2 agent response back to v1 format."""
    return {
        "id": v2_response["id"],
        "name": v2_response["name"],
        "description": v2_response["description"],
        "model": v2_response["model_config"]["model_id"],  # Flatten
        "created_at": v2_response["created_at"],
        # Omit v2-only fields
    }
```

---

## SDK Versioning

### SDK Version Alignment

```
SDK Version     API Version    Status
─────────────────────────────────────
sdk 1.x         API v1         Deprecated
sdk 2.x         API v2         Current
sdk 3.x         API v2/v3      Future
```

### Multi-Version SDK Support

```python
# Python SDK
from agentplatform import Client

# Use specific API version
client = Client(api_key="...", api_version="v2")

# Or use latest stable (default)
client = Client(api_key="...")

# Methods automatically use correct endpoints
agent = client.agents.create(name="My Agent", ...)
```

```typescript
// TypeScript SDK
import { AgentPlatform } from '@agentplatform/sdk';

// Specify version
const client = new AgentPlatform({
  apiKey: '...',
  apiVersion: 'v2'
});

// Type definitions match API version
const agent = await client.agents.create({
  name: 'My Agent',
  modelConfig: {  // V2 schema
    provider: 'openai',
    modelId: 'gpt-4'
  }
});
```

---

## Webhook Versioning

### Webhook Payload Versions

```python
# Webhook payloads are also versioned
WEBHOOK_PAYLOAD_VERSIONS = {
    "2024-01-01": WebhookPayloadV1,
    "2024-06-01": WebhookPayloadV2,
}

async def send_webhook(endpoint: WebhookEndpoint, event: Event):
    """Send webhook with versioned payload."""
    # Use endpoint's configured API version
    payload_class = WEBHOOK_PAYLOAD_VERSIONS.get(
        endpoint.api_version,
        WebhookPayloadV2  # Default to latest
    )

    payload = payload_class.from_event(event)

    await http_client.post(
        endpoint.url,
        json=payload.model_dump(),
        headers={
            "X-Webhook-Version": endpoint.api_version,
            "X-Event-Type": event.type,
        }
    )
```

---

## Version Discovery

### API Info Endpoint

```python
@router.get("/")
async def api_info():
    """Return API version information."""
    return {
        "versions": {
            "v1": {
                "status": "deprecated",
                "sunset": "2025-06-01",
                "docs": "https://docs.agentplatform.com/api/v1"
            },
            "v2": {
                "status": "stable",
                "released": "2024-07-01",
                "docs": "https://docs.agentplatform.com/api/v2"
            }
        },
        "current": "v2",
        "latest": "v2"
    }
```

### OpenAPI Specs Per Version

```
https://api.agentplatform.com/v1/openapi.json
https://api.agentplatform.com/v2/openapi.json
```

---

## Monitoring & Analytics

### Version Usage Metrics

```python
# Track API version usage
from prometheus_client import Counter

api_requests = Counter(
    "api_requests_total",
    "Total API requests",
    ["version", "endpoint", "method"]
)

@app.middleware("http")
async def track_version_usage(request: Request, call_next):
    response = await call_next(request)

    # Extract version from path
    path_parts = request.url.path.split("/")
    version = path_parts[1] if len(path_parts) > 1 else "unknown"

    api_requests.labels(
        version=version,
        endpoint=request.url.path,
        method=request.method
    ).inc()

    return response
```

### Deprecation Dashboard

```yaml
# Grafana dashboard for version monitoring
panels:
  - title: "API Version Distribution"
    query: sum(rate(api_requests_total[1h])) by (version)

  - title: "Deprecated Version Usage"
    query: sum(rate(api_requests_total{version="v1"}[1h]))
    alert:
      threshold: 1000  # Alert if v1 still getting significant traffic
```

---

## Best Practices

### DO

- Plan versions ahead with clear timelines
- Provide comprehensive migration guides
- Support deprecated versions for 12+ months
- Use feature flags for gradual rollouts
- Version webhooks alongside APIs
- Communicate changes proactively

### DON'T

- Make breaking changes within a version
- Sunset versions without notice
- Create too many major versions (aim for 1-2 active)
- Force immediate migration
- Break SDKs without major version bump
