# Agent-to-Agent (A2A) Protocol Specification

## Overview

This document defines the **Agent-to-Agent (A2A) Protocol** - a standardized way for AI agents to discover, communicate, and collaborate with each other on the Agent Platform.

---

## Design Goals

1. **Interoperability** - Agents built with different frameworks can communicate
2. **Discovery** - Agents can find other agents with specific capabilities
3. **Security** - All communications are authenticated and authorized
4. **Observability** - Full tracing of agent-to-agent interactions
5. **Reliability** - Built-in retry, timeout, and circuit breaker patterns

---

## Protocol Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Agent Platform                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     A2A Protocol      ┌──────────────┐           │
│  │   Agent A    │◄────────────────────►│   Agent B    │           │
│  │  (Caller)    │                       │  (Callee)    │           │
│  └──────────────┘                       └──────────────┘           │
│         │                                      │                    │
│         │                                      │                    │
│         ▼                                      ▼                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      A2A Router                              │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │   │
│  │   │  Discovery  │  │   Auth      │  │   Tracing   │        │   │
│  │   │   Service   │  │   Gateway   │  │   Context   │        │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Agent Card

Every agent that participates in A2A communication must have an **Agent Card** - a JSON document describing its capabilities.

### Schema

```json
{
  "$schema": "https://agentplatform.com/schemas/agent-card/v1",
  "id": "agt_abc123xyz",
  "name": "Research Assistant",
  "description": "An agent that can search and summarize information from the web",
  "version": "1.2.0",

  "capabilities": {
    "streaming": true,
    "a2a": true,
    "memory": true
  },

  "skills": [
    {
      "name": "web_search",
      "description": "Search the web for information",
      "input_schema": {
        "type": "object",
        "properties": {
          "query": {"type": "string", "description": "Search query"},
          "max_results": {"type": "integer", "default": 10}
        },
        "required": ["query"]
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "results": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": {"type": "string"},
                "url": {"type": "string"},
                "snippet": {"type": "string"}
              }
            }
          }
        }
      }
    },
    {
      "name": "summarize",
      "description": "Summarize text content",
      "input_schema": {
        "type": "object",
        "properties": {
          "content": {"type": "string"},
          "max_length": {"type": "integer", "default": 500}
        },
        "required": ["content"]
      },
      "output_schema": {
        "type": "object",
        "properties": {
          "summary": {"type": "string"}
        }
      }
    }
  ],

  "authentication": {
    "type": "bearer",
    "scopes_required": ["a2a:call"]
  },

  "rate_limits": {
    "requests_per_minute": 60,
    "concurrent_requests": 10
  },

  "endpoint": "https://api.agentplatform.com/v1/agents/agt_abc123xyz/a2a"
}
```

---

## Discovery Protocol

### Agent Registry

Agents register their capabilities with the central registry for discovery.

```http
POST /v1/a2a/registry
Authorization: Bearer {agent_token}
Content-Type: application/json

{
  "agent_card": { ... }
}
```

### Search for Agents

Other agents can search for agents with specific capabilities.

```http
GET /v1/a2a/discover?skill=web_search&min_rating=4.0
Authorization: Bearer {agent_token}
```

**Response:**

```json
{
  "agents": [
    {
      "id": "agt_abc123xyz",
      "name": "Research Assistant",
      "skills": ["web_search", "summarize"],
      "rating": 4.8,
      "response_time_p95_ms": 2500,
      "availability": 0.999
    }
  ],
  "total": 15,
  "next_cursor": "eyJvZmZzZXQiOjIwfQ=="
}
```

### Get Agent Card

```http
GET /v1/a2a/agents/{agent_id}/card
Authorization: Bearer {agent_token}
```

---

## Communication Protocol

### Request Format

```http
POST /v1/a2a/call
Authorization: Bearer {caller_agent_token}
Content-Type: application/json
X-Request-ID: req_123abc
X-Trace-ID: trace_456def
X-Span-ID: span_789ghi

{
  "target_agent_id": "agt_abc123xyz",
  "skill": "web_search",
  "input": {
    "query": "latest AI developments",
    "max_results": 5
  },
  "options": {
    "timeout_ms": 30000,
    "priority": "normal",
    "callback_url": "https://caller-agent.example.com/callback"
  },
  "context": {
    "conversation_id": "conv_xyz",
    "parent_execution_id": "exec_123",
    "metadata": {
      "user_id": "usr_abc",
      "org_id": "org_xyz"
    }
  }
}
```

### Response Format

```json
{
  "id": "a2a_call_abc123",
  "status": "completed",
  "result": {
    "results": [
      {
        "title": "OpenAI announces GPT-5",
        "url": "https://example.com/article",
        "snippet": "OpenAI has announced..."
      }
    ]
  },
  "usage": {
    "tokens": 1500,
    "cost_usd": 0.0045
  },
  "timing": {
    "queued_at": "2026-01-12T10:00:00.000Z",
    "started_at": "2026-01-12T10:00:00.050Z",
    "completed_at": "2026-01-12T10:00:02.500Z",
    "duration_ms": 2450
  },
  "trace": {
    "trace_id": "trace_456def",
    "span_id": "span_new123"
  }
}
```

### Error Response

```json
{
  "id": "a2a_call_abc123",
  "status": "failed",
  "error": {
    "code": "AGENT_TIMEOUT",
    "message": "Target agent did not respond within timeout",
    "details": {
      "timeout_ms": 30000,
      "agent_id": "agt_abc123xyz"
    }
  },
  "timing": {
    "queued_at": "2026-01-12T10:00:00.000Z",
    "started_at": "2026-01-12T10:00:00.050Z",
    "failed_at": "2026-01-12T10:00:30.050Z"
  }
}
```

---

## Streaming Protocol

For long-running tasks, agents can stream responses using Server-Sent Events (SSE).

### Request

```http
POST /v1/a2a/call/stream
Authorization: Bearer {caller_agent_token}
Content-Type: application/json
Accept: text/event-stream

{
  "target_agent_id": "agt_abc123xyz",
  "skill": "summarize",
  "input": {
    "content": "Very long article text...",
    "max_length": 500
  }
}
```

### Response Stream

```
event: start
data: {"call_id": "a2a_call_abc123", "status": "started"}

event: progress
data: {"progress": 0.25, "message": "Reading document..."}

event: progress
data: {"progress": 0.50, "message": "Analyzing key points..."}

event: chunk
data: {"content": "The article discusses "}

event: chunk
data: {"content": "three main topics: "}

event: progress
data: {"progress": 0.90, "message": "Finalizing summary..."}

event: complete
data: {"status": "completed", "result": {"summary": "The article discusses three main topics: ..."}, "usage": {"tokens": 800}}

event: done
data: {}
```

---

## Async Protocol

For very long-running tasks, use the async pattern with callbacks.

### Initiate Async Call

```http
POST /v1/a2a/call/async
Authorization: Bearer {caller_agent_token}
Content-Type: application/json

{
  "target_agent_id": "agt_abc123xyz",
  "skill": "deep_research",
  "input": {
    "topic": "Quantum computing applications"
  },
  "callback": {
    "url": "https://caller-agent.example.com/a2a/callback",
    "headers": {
      "X-Callback-Secret": "secret123"
    }
  }
}
```

### Response

```json
{
  "call_id": "a2a_call_abc123",
  "status": "queued",
  "estimated_duration_ms": 120000
}
```

### Callback Delivery

```http
POST https://caller-agent.example.com/a2a/callback
Content-Type: application/json
X-Callback-Secret: secret123
X-Signature: sha256=abc123...

{
  "call_id": "a2a_call_abc123",
  "status": "completed",
  "result": { ... },
  "usage": { ... }
}
```

### Poll Status

```http
GET /v1/a2a/call/{call_id}/status
Authorization: Bearer {caller_agent_token}
```

---

## Orchestration Patterns

### Sequential Chain

Agent A → Agent B → Agent C

```python
# SDK Example
from agentplatform import Agent
from agentplatform.a2a import call_agent

async def research_and_write(topic: str):
    # Step 1: Research
    research_result = await call_agent(
        agent_id="agt_researcher",
        skill="web_search",
        input={"query": topic}
    )

    # Step 2: Analyze
    analysis = await call_agent(
        agent_id="agt_analyst",
        skill="analyze",
        input={"data": research_result}
    )

    # Step 3: Write
    article = await call_agent(
        agent_id="agt_writer",
        skill="write_article",
        input={"analysis": analysis, "topic": topic}
    )

    return article
```

### Parallel Fan-Out

Agent A → [Agent B, Agent C, Agent D] → Aggregate

```python
import asyncio
from agentplatform.a2a import call_agent

async def multi_source_research(topic: str):
    # Fan out to multiple agents in parallel
    tasks = [
        call_agent("agt_news_researcher", "search", {"query": topic}),
        call_agent("agt_academic_researcher", "search", {"query": topic}),
        call_agent("agt_social_researcher", "search", {"query": topic}),
    ]

    results = await asyncio.gather(*tasks)

    # Aggregate results
    aggregated = await call_agent(
        "agt_aggregator",
        "merge_results",
        {"results": results}
    )

    return aggregated
```

### Hierarchical Delegation

Manager agent delegates to specialist agents.

```python
class ManagerAgent(Agent):
    def __init__(self):
        super().__init__(
            name="Manager",
            instructions="Delegate tasks to specialist agents."
        )
        self.specialists = {
            "code": "agt_code_specialist",
            "research": "agt_research_specialist",
            "writing": "agt_writing_specialist",
        }

    async def handle_task(self, task: str):
        # Determine task type
        task_type = await self.classify_task(task)

        # Delegate to specialist
        specialist_id = self.specialists.get(task_type)
        if specialist_id:
            return await call_agent(
                specialist_id,
                "handle",
                {"task": task}
            )
        else:
            # Handle directly
            return await self.run(task)
```

---

## Security

### Authentication

All A2A calls require valid agent authentication.

```http
Authorization: Bearer {agent_api_key}
```

### Authorization

Agents must have the `a2a:call` scope to initiate calls.

```json
{
  "scopes": ["a2a:call", "a2a:receive"]
}
```

### Request Signing

For sensitive operations, requests are signed with HMAC-SHA256.

```
X-Signature: sha256=<hmac_signature>
X-Timestamp: 1704979200
```

Verification:

```python
import hmac
import hashlib

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
```

### Rate Limiting

Each agent has configurable rate limits for incoming A2A calls.

```json
{
  "rate_limits": {
    "requests_per_minute": 60,
    "requests_per_hour": 1000,
    "concurrent_requests": 10
  }
}
```

---

## Error Codes

| Code | Description | Retry |
|------|-------------|-------|
| `AGENT_NOT_FOUND` | Target agent does not exist | No |
| `AGENT_UNAVAILABLE` | Agent is offline or paused | Yes |
| `SKILL_NOT_FOUND` | Requested skill not available | No |
| `VALIDATION_ERROR` | Input validation failed | No |
| `AUTHORIZATION_ERROR` | Caller not authorized | No |
| `RATE_LIMITED` | Too many requests | Yes (backoff) |
| `AGENT_TIMEOUT` | Agent did not respond in time | Yes |
| `AGENT_ERROR` | Agent returned an error | Depends |
| `CIRCUIT_OPEN` | Circuit breaker is open | Yes (later) |

---

## Observability

### Trace Propagation

A2A calls propagate trace context for distributed tracing.

```
X-Trace-ID: trace_456def
X-Span-ID: span_789ghi
X-Parent-Span-ID: span_123abc
```

### Metrics

| Metric | Type | Labels |
|--------|------|--------|
| `a2a_calls_total` | Counter | caller_id, target_id, skill, status |
| `a2a_call_duration_seconds` | Histogram | caller_id, target_id, skill |
| `a2a_call_queue_size` | Gauge | target_id |
| `a2a_circuit_breaker_state` | Gauge | target_id |

### Logging

```json
{
  "timestamp": "2026-01-12T10:00:00.000Z",
  "level": "info",
  "message": "A2A call completed",
  "call_id": "a2a_call_abc123",
  "caller_agent_id": "agt_caller123",
  "target_agent_id": "agt_target456",
  "skill": "web_search",
  "status": "completed",
  "duration_ms": 2450,
  "trace_id": "trace_456def"
}
```

---

## SDK Integration

### Python

```python
from agentplatform import Agent
from agentplatform.a2a import A2AClient, call_agent

# As a tool within an agent
@tool
async def delegate_research(query: str) -> dict:
    """Delegate research to specialist agent."""
    return await call_agent(
        agent_id="agt_researcher",
        skill="web_search",
        input={"query": query},
        timeout_ms=30000
    )

agent = Agent(
    name="Coordinator",
    instructions="Coordinate research tasks.",
    tools=[delegate_research],
)

# Direct A2A client usage
client = A2AClient(api_key="...")

result = await client.call(
    target="agt_researcher",
    skill="summarize",
    input={"content": "..."}
)
```

### TypeScript

```typescript
import { Agent, a2a } from '@agentplatform/sdk';

// As a tool
const delegateResearch = a2a.tool({
  agentId: 'agt_researcher',
  skill: 'web_search',
  name: 'delegate_research',
  description: 'Delegate research to specialist',
});

const agent = new Agent({
  name: 'Coordinator',
  instructions: 'Coordinate research tasks.',
  tools: [delegateResearch],
});

// Direct call
const result = await a2a.call({
  target: 'agt_researcher',
  skill: 'summarize',
  input: { content: '...' },
});
```

---

## Best Practices

### DO

- Set appropriate timeouts for each skill type
- Implement circuit breakers for unreliable agents
- Use streaming for long-running operations
- Propagate trace context for debugging
- Version your agent cards

### DON'T

- Create circular dependencies between agents
- Make synchronous calls in tight loops
- Ignore rate limits
- Skip input validation
- Hardcode agent IDs (use discovery)
