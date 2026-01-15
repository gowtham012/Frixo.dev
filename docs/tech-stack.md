# Technology Stack

## Overview

This document outlines the complete technology stack for the AI Agent Platform using a **Python-first approach**.

### Design Principles
- **Simplicity**: One backend language reduces complexity
- **AI-Native**: Python is the language of AI/ML
- **Fast Iteration**: Ship features quickly, optimize later
- **Hire-ability**: Python talent is abundant

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                   Next.js (TypeScript)                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│                    Kong / Traefik                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Python)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Core API   │  │Agent Runtime│  │  Testing    │          │
│  │  (FastAPI)  │  │  (FastAPI)  │  │   Engine    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Integration │  │  A2A Orch   │  │  Scheduler  │          │
│  │   Proxy     │  │   Engine    │  │  (Celery)   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  PostgreSQL │ Redis │ Pinecone/Weaviate │ S3               │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14+ (TypeScript) | Dashboard, marketplace, agent builder |
| **Backend** | FastAPI (Python 3.11+) | All API services |
| **Agent Runtime** | Python + Custom SDK | Agent execution engine |
| **Task Queue** | Celery + Redis | Background jobs, scheduling |
| **Primary DB** | PostgreSQL 15+ | User data, agent configs, audit |
| **Cache** | Redis Cluster | Session, rate limiting, pub/sub |
| **Vector DB** | Pinecone or Weaviate | Agent memory, semantic search |
| **Object Storage** | S3 / CloudFlare R2 | Files, artifacts, exports |
| **Secrets** | HashiCorp Vault | Credential management |
| **Container** | Kubernetes (EKS/GKE) | Orchestration |
| **Monitoring** | Prometheus + Grafana | Metrics and dashboards |

---

## Backend Services (All Python)

### Core API Service
```python
# Framework: FastAPI
# Purpose: User management, agent CRUD, marketplace, billing

from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to DB, Redis, etc.
    await init_connections()
    yield
    # Shutdown: cleanup
    await close_connections()

app = FastAPI(lifespan=lifespan)

# Endpoints
# - /api/v1/users
# - /api/v1/agents
# - /api/v1/marketplace
# - /api/v1/billing
# - /api/v1/organizations
```

**Key Features:**
- Async by default (handles high concurrency)
- Automatic OpenAPI docs
- Pydantic for validation
- Dependency injection

### Agent Runtime Service
```python
# Framework: FastAPI + Custom Agent SDK
# Purpose: Execute agents, manage tools, handle LLM calls

from fastapi import FastAPI
from agent_sdk import AgentExecutor, Tool

app = FastAPI()

@app.post("/execute/{agent_id}")
async def execute_agent(agent_id: str, input: AgentInput):
    executor = AgentExecutor(agent_id)
    result = await executor.run(input)
    return result

# Features:
# - Streaming responses via SSE
# - Tool orchestration
# - Memory management
# - LLM provider routing
```

### Integration Proxy Service
```python
# Framework: FastAPI
# Purpose: Secure proxy for third-party APIs

from fastapi import FastAPI
from vault import get_credential

app = FastAPI()

@app.post("/proxy/{integration}/{action}")
async def proxy_request(integration: str, action: str, request: ProxyRequest):
    # 1. Validate permissions
    # 2. Get credential from Vault (agent never sees it)
    # 3. Make request to third-party API
    # 4. Log for audit
    # 5. Return sanitized response
    pass
```

### Testing Engine Service
```python
# Framework: FastAPI + Celery
# Purpose: Run agent tests, generate reports, continuous monitoring

from fastapi import FastAPI
from celery import Celery

app = FastAPI()
celery_app = Celery('testing', broker='redis://localhost:6379')

@celery_app.task
def run_test_suite(agent_id: str, suite_id: str):
    # Run all tests in background
    pass

@app.post("/tests/{agent_id}/trigger")
async def trigger_tests(agent_id: str):
    task = run_test_suite.delay(agent_id, "default")
    return {"task_id": task.id}
```

### A2A Orchestration Service
```python
# Framework: FastAPI + Redis Pub/Sub
# Purpose: Agent-to-agent communication and workflows

from fastapi import FastAPI
import redis.asyncio as redis

app = FastAPI()
pubsub = redis.Redis()

@app.post("/a2a/send")
async def send_message(message: A2AMessage):
    # Route message to target agent
    await pubsub.publish(f"agent:{message.target}", message.json())

@app.websocket("/a2a/subscribe/{agent_id}")
async def subscribe(websocket: WebSocket, agent_id: str):
    # Real-time message streaming
    pass
```

### Scheduler Service
```python
# Framework: Celery Beat
# Purpose: Scheduled agent executions, cron jobs

from celery import Celery
from celery.schedules import crontab

celery_app = Celery('scheduler', broker='redis://localhost:6379')

celery_app.conf.beat_schedule = {
    # Dynamic schedules loaded from DB
}

@celery_app.task
def execute_scheduled_agent(agent_id: str, trigger_config: dict):
    # Trigger agent execution
    pass
```

---

## Database Schema

### PostgreSQL Tables

```sql
-- Users & Organizations
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) DEFAULT 'starter', -- starter, pro, team, enterprise
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB NOT NULL, -- Agent configuration
    status VARCHAR(50) DEFAULT 'draft',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Executions (Partitioned by date)
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    input JSONB,
    output JSONB,
    status VARCHAR(50),
    tokens_used INTEGER,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Integrations & Credentials
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    provider VARCHAR(100) NOT NULL, -- 'linkedin', 'slack', etc.
    credential_ref VARCHAR(255), -- Reference to Vault
    scopes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    seller_id UUID REFERENCES users(id),
    price_cents INTEGER,
    tier VARCHAR(50) DEFAULT 'unverified',
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Tests
CREATE TABLE agent_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    type VARCHAR(50), -- functional, safety, quality, etc.
    config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES agent_tests(id),
    execution_id UUID REFERENCES executions(id),
    passed BOOLEAN,
    score DECIMAL(5,4),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Redis Usage

```python
# Cache patterns
CACHE_PATTERNS = {
    "session": "session:{user_id}",           # TTL: 24h
    "rate_limit": "rate:{org_id}:{endpoint}", # TTL: 1min
    "agent_config": "agent:{agent_id}:config", # TTL: 5min
    "hot_agents": "marketplace:hot",           # TTL: 1h
}

# Pub/Sub channels
PUBSUB_CHANNELS = {
    "agent_events": "events:agent:{agent_id}",
    "a2a_messages": "a2a:{agent_id}",
    "notifications": "notify:{user_id}",
}

# Celery queues
CELERY_QUEUES = {
    "default": "celery",
    "agents": "celery:agents",      # Agent executions
    "testing": "celery:testing",    # Test jobs
    "integrations": "celery:int",   # External API calls
}
```

---

## LLM Integration

### Multi-Provider Gateway
```python
from litellm import completion
import os

class LLMGateway:
    """Route LLM calls to appropriate provider with fallback."""

    PROVIDERS = {
        "gpt-4o": "openai/gpt-4o",
        "claude-sonnet": "anthropic/claude-3-5-sonnet-20241022",
        "gemini-pro": "google/gemini-pro",
    }

    async def complete(
        self,
        messages: list,
        model: str = "gpt-4o",
        fallback: str = "claude-sonnet",
        **kwargs
    ):
        try:
            response = await completion(
                model=self.PROVIDERS[model],
                messages=messages,
                **kwargs
            )
            return response
        except Exception as e:
            # Fallback to secondary provider
            return await completion(
                model=self.PROVIDERS[fallback],
                messages=messages,
                **kwargs
            )
```

### Supported Providers
| Provider | Models | Use Case |
|----------|--------|----------|
| OpenAI | GPT-4o, GPT-4o-mini | Default, general purpose |
| Anthropic | Claude 3.5 Sonnet/Haiku | Complex reasoning, safety |
| Google | Gemini Pro/Flash | Cost-effective, multimodal |
| Azure OpenAI | GPT-4 | Enterprise compliance |

---

## Frontend Stack

### Next.js Application
```typescript
// Framework: Next.js 14+ with App Router
// Language: TypeScript
// Styling: Tailwind CSS + Shadcn/ui

// Project structure
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── agents/
│   │   ├── marketplace/
│   │   ├── integrations/
│   │   └── settings/
│   └── api/         # API routes (if needed)
├── components/
│   ├── ui/          # Shadcn components
│   ├── agents/      # Agent-specific components
│   └── shared/      # Shared components
├── lib/
│   ├── api.ts       # API client
│   └── utils.ts     # Utilities
└── hooks/           # Custom React hooks
```

### State Management
```typescript
// Server state: TanStack Query
import { useQuery, useMutation } from '@tanstack/react-query';

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get('/agents'),
  });
}

// Client state: Zustand
import { create } from 'zustand';

interface AppState {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
}));
```

### Real-time Updates
```typescript
// Socket.io for real-time agent execution streaming
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_WS_URL);

socket.on('agent:output', (data) => {
  // Stream agent output to UI
});

socket.on('agent:complete', (data) => {
  // Execution finished
});
```

---

## Infrastructure

### Kubernetes Deployment
```yaml
# Namespace
apiVersion: v1
kind: Namespace
metadata:
  name: agent-platform

---
# Core API Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-api
  namespace: agent-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: core-api
  template:
    metadata:
      labels:
        app: core-api
    spec:
      containers:
      - name: core-api
        image: agent-platform/core-api:latest
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: url
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: core-api-hpa
  namespace: agent-platform
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: core-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Services Overview
| Service | Replicas | CPU | Memory |
|---------|----------|-----|--------|
| core-api | 3-20 | 500m-1 | 512Mi-1Gi |
| agent-runtime | 5-50 | 1-2 | 1Gi-2Gi |
| integration-proxy | 3-10 | 500m | 512Mi |
| testing-engine | 2-10 | 1 | 1Gi |
| celery-worker | 5-30 | 500m | 512Mi |
| celery-beat | 1 | 250m | 256Mi |

---

## Observability

### Prometheus Metrics
```python
from prometheus_client import Counter, Histogram, Gauge

# Request metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

# Agent metrics
AGENT_EXECUTIONS = Counter(
    'agent_executions_total',
    'Total agent executions',
    ['agent_id', 'status']
)

AGENT_LATENCY = Histogram(
    'agent_execution_duration_seconds',
    'Agent execution latency',
    ['agent_id']
)

TOKEN_USAGE = Counter(
    'llm_tokens_total',
    'Total LLM tokens used',
    ['provider', 'model', 'type']  # type: input/output
)
```

### Key Dashboards
1. **System Health**: CPU, memory, request rates, error rates
2. **Agent Performance**: Executions, latency p50/p95/p99, success rate
3. **LLM Usage**: Token consumption, cost, provider distribution
4. **Business Metrics**: Active users, agent creations, marketplace sales

### Logging
```python
import structlog

logger = structlog.get_logger()

# Structured logging throughout
logger.info(
    "agent_executed",
    agent_id=agent_id,
    latency_ms=latency,
    tokens_used=tokens,
    status="success"
)
```

---

## Security

### API Authentication
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
import jwt

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Rate Limiting
```python
from fastapi import Request
from redis import Redis

redis_client = Redis()

async def rate_limit(request: Request, limit: int = 100, window: int = 60):
    key = f"rate:{request.client.host}:{request.url.path}"
    current = redis_client.incr(key)
    if current == 1:
        redis_client.expire(key, window)
    if current > limit:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
```

### Credential Isolation
```python
# Agents NEVER see credentials
# Integration proxy fetches from Vault and makes request

async def proxy_integration_request(
    agent_id: str,
    integration_id: str,
    action: str,
    payload: dict
):
    # 1. Verify agent has permission for this integration
    permission = await check_permission(agent_id, integration_id, action)
    if not permission:
        raise PermissionError("Agent not authorized")

    # 2. Get credential from Vault (not exposed to agent)
    credential = await vault.get_secret(f"integrations/{integration_id}")

    # 3. Make request to third-party
    response = await make_external_request(action, payload, credential)

    # 4. Audit log
    await log_integration_access(agent_id, integration_id, action)

    # 5. Return sanitized response (no credentials leaked)
    return sanitize_response(response)
```

---

## SDKs

### Python SDK
```python
# Installation: pip install agent-platform-sdk

from agent_platform import Agent, Tool, Memory

class MyAgent(Agent):
    name = "my-assistant"
    description = "A helpful assistant"

    tools = [
        Tool.builtin("web_search"),
        Tool.builtin("calculator"),
    ]

    memory = Memory.vector(namespace="my-assistant")

    async def run(self, input: str) -> str:
        # Agent logic
        result = await self.think(input)
        return result

# Deploy
agent = MyAgent()
agent.deploy()
```

### TypeScript SDK
```typescript
// Installation: npm install @agent-platform/sdk

import { Agent, Tool, Memory } from '@agent-platform/sdk';

const agent = new Agent({
  name: 'my-assistant',
  description: 'A helpful assistant',
  tools: [
    Tool.builtin('web_search'),
    Tool.builtin('calculator'),
  ],
  memory: Memory.vector({ namespace: 'my-assistant' }),
});

agent.onMessage(async (input) => {
  const result = await agent.think(input);
  return result;
});

agent.deploy();
```

---

## Development Setup

### Prerequisites
```bash
# Required
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- pnpm (for frontend)

# Optional
- kubectl (for K8s deployment)
- helm (for K8s packages)
```

### Local Development
```bash
# Clone repository
git clone https://github.com/your-org/agent-platform.git
cd agent-platform

# Start infrastructure
docker-compose up -d postgres redis

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup
cd frontend
pnpm install
pnpm dev

# Run Celery worker
celery -A worker worker --loglevel=info

# Run Celery beat (scheduler)
celery -A worker beat --loglevel=info
```

### Docker Compose (Local)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: agent_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  core-api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/agent_platform
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    depends_on:
      - core-api

volumes:
  postgres_data:
  redis_data:
```

---

## Cost Estimation

### Infrastructure (Monthly)

#### MVP Phase
| Component | Service | Monthly Cost |
|-----------|---------|-------------|
| Kubernetes | EKS (3 t3.medium) | $150 |
| PostgreSQL | RDS db.t3.medium | $50 |
| Redis | ElastiCache t3.micro | $25 |
| S3 | 100GB storage | $5 |
| Load Balancer | ALB | $20 |
| **Total** | | **~$250/month** |

#### Production Phase
| Component | Service | Monthly Cost |
|-----------|---------|-------------|
| Kubernetes | EKS (6 m5.large) | $600 |
| PostgreSQL | RDS db.r5.large Multi-AZ | $400 |
| Redis | ElastiCache r5.large cluster | $300 |
| Vector DB | Pinecone starter | $70 |
| S3 + CloudFront | 1TB | $100 |
| Vault | HashiCorp Cloud | $200 |
| Monitoring | Grafana Cloud | $100 |
| **Total** | | **~$1,800/month** |

#### Scale Phase
| Component | Service | Monthly Cost |
|-----------|---------|-------------|
| Kubernetes | EKS (20+ nodes) | $3,000 |
| PostgreSQL | RDS db.r5.2xlarge Multi-AZ | $1,500 |
| Redis | ElastiCache cluster | $800 |
| Vector DB | Pinecone standard | $500 |
| Kafka | MSK | $600 |
| All other | | $2,000 |
| **Total** | | **~$8,000/month** |

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-6)
- [ ] Project setup (monorepo, CI/CD)
- [ ] Core API service (FastAPI)
- [ ] PostgreSQL schema & migrations
- [ ] Basic authentication (JWT)
- [ ] Frontend scaffold (Next.js)
- [ ] Docker Compose for local dev

### Phase 2: Agent Runtime (Weeks 7-12)
- [ ] Agent execution engine
- [ ] LLM gateway (multi-provider)
- [ ] Basic tools (web search, calculator)
- [ ] Agent creation UI
- [ ] Python SDK v0.1

### Phase 3: Integrations (Weeks 13-18)
- [ ] Integration proxy service
- [ ] Vault integration for credentials
- [ ] OAuth flow for core integrations
- [ ] Slack, Google, LinkedIn connectors
- [ ] Integration management UI

### Phase 4: Testing & Marketplace (Weeks 19-24)
- [ ] Testing engine service
- [ ] Auto-generated tests
- [ ] Test dashboard
- [ ] Marketplace listings
- [ ] Payment integration (Stripe)

### Phase 5: Scale & Polish (Weeks 25-30)
- [ ] A2A orchestration
- [ ] Self-evolution engine
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

---

## When to Reconsider Languages

Add Go or Rust **only** when you have evidence of:

| Signal | Threshold | Action |
|--------|-----------|--------|
| API latency p99 | >500ms under load | Consider Go for hot paths |
| WebSocket connections | >50k concurrent | Consider Rust for WS server |
| CPU-bound processing | Python GIL bottleneck | Consider Rust for compute |

**Until then**: Python handles everything. Instagram serves 2B users on Python.
