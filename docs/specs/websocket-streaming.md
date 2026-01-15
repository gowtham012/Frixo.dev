# WebSocket & Streaming Specification

## Overview

This document defines the real-time communication protocols for the AI Agent Platform using **WebSocket** for bidirectional communication and **Server-Sent Events (SSE)** for unidirectional streaming.

---

## Architecture

```
┌──────────────┐     WebSocket/SSE      ┌──────────────────────┐
│   Frontend   │◄─────────────────────►│    API Gateway       │
│   (Client)   │                        │    (WebSocket Hub)   │
└──────────────┘                        └──────────────────────┘
                                                  │
                                                  ▼
                                        ┌──────────────────────┐
                                        │    Redis Pub/Sub     │
                                        │    (Message Broker)  │
                                        └──────────────────────┘
                                                  │
                         ┌────────────────────────┼────────────────────────┐
                         ▼                        ▼                        ▼
                ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
                │  Agent       │        │  Execution   │        │  Notification │
                │  Runtime     │        │  Service     │        │  Service      │
                └──────────────┘        └──────────────┘        └──────────────┘
```

---

## WebSocket Protocol

### Connection

```javascript
// Client connection
const ws = new WebSocket('wss://api.agentplatform.com/ws');

// With authentication
const ws = new WebSocket('wss://api.agentplatform.com/ws?token=jwt_token_here');
```

### Authentication

After connection, authenticate within 5 seconds:

```json
{
  "type": "auth",
  "payload": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Success Response:**

```json
{
  "type": "auth_success",
  "payload": {
    "user_id": "usr_abc123",
    "org_id": "org_xyz789",
    "connection_id": "conn_123abc"
  }
}
```

**Failure Response:**

```json
{
  "type": "auth_error",
  "payload": {
    "code": "INVALID_TOKEN",
    "message": "Token expired or invalid"
  }
}
```

### Message Format

All WebSocket messages follow this structure:

```json
{
  "type": "message_type",
  "id": "msg_unique_id",
  "timestamp": "2026-01-12T10:00:00.000Z",
  "payload": { }
}
```

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `auth` | Client → Server | Authentication |
| `auth_success` | Server → Client | Auth successful |
| `auth_error` | Server → Client | Auth failed |
| `subscribe` | Client → Server | Subscribe to channel |
| `unsubscribe` | Client → Server | Unsubscribe from channel |
| `subscribed` | Server → Client | Subscription confirmed |
| `execute` | Client → Server | Start agent execution |
| `execution_start` | Server → Client | Execution started |
| `execution_token` | Server → Client | Token streamed |
| `execution_tool` | Server → Client | Tool call |
| `execution_complete` | Server → Client | Execution finished |
| `execution_error` | Server → Client | Execution failed |
| `ping` | Client → Server | Keep-alive ping |
| `pong` | Server → Client | Keep-alive pong |

---

## Subscriptions

### Subscribe to Channel

```json
{
  "type": "subscribe",
  "id": "sub_123",
  "payload": {
    "channel": "executions",
    "filters": {
      "agent_id": "agt_abc123"
    }
  }
}
```

### Available Channels

| Channel | Description | Filters |
|---------|-------------|---------|
| `executions` | Execution updates | `agent_id`, `user_id` |
| `agents` | Agent status changes | `agent_id` |
| `notifications` | User notifications | - |
| `billing` | Billing alerts | - |

### Unsubscribe

```json
{
  "type": "unsubscribe",
  "id": "unsub_456",
  "payload": {
    "channel": "executions",
    "subscription_id": "sub_123"
  }
}
```

---

## Agent Execution Streaming

### Start Execution

```json
{
  "type": "execute",
  "id": "exec_req_001",
  "payload": {
    "agent_id": "agt_abc123",
    "input": "What is the weather in Paris?",
    "session_id": "sess_xyz789",
    "stream": true
  }
}
```

### Execution Events

**Start:**

```json
{
  "type": "execution_start",
  "id": "evt_001",
  "timestamp": "2026-01-12T10:00:00.000Z",
  "payload": {
    "execution_id": "exec_abc123",
    "agent_id": "agt_abc123",
    "status": "running"
  }
}
```

**Token Stream:**

```json
{
  "type": "execution_token",
  "id": "evt_002",
  "timestamp": "2026-01-12T10:00:00.100Z",
  "payload": {
    "execution_id": "exec_abc123",
    "token": "The ",
    "index": 0
  }
}
```

```json
{
  "type": "execution_token",
  "id": "evt_003",
  "timestamp": "2026-01-12T10:00:00.150Z",
  "payload": {
    "execution_id": "exec_abc123",
    "token": "weather ",
    "index": 1
  }
}
```

**Tool Call:**

```json
{
  "type": "execution_tool",
  "id": "evt_010",
  "timestamp": "2026-01-12T10:00:01.000Z",
  "payload": {
    "execution_id": "exec_abc123",
    "tool_call": {
      "id": "tool_001",
      "name": "get_weather",
      "status": "calling",
      "arguments": {
        "city": "Paris",
        "unit": "celsius"
      }
    }
  }
}
```

**Tool Result:**

```json
{
  "type": "execution_tool",
  "id": "evt_011",
  "timestamp": "2026-01-12T10:00:02.000Z",
  "payload": {
    "execution_id": "exec_abc123",
    "tool_call": {
      "id": "tool_001",
      "name": "get_weather",
      "status": "completed",
      "result": {
        "temperature": 18,
        "condition": "partly cloudy"
      }
    }
  }
}
```

**Completion:**

```json
{
  "type": "execution_complete",
  "id": "evt_020",
  "timestamp": "2026-01-12T10:00:05.000Z",
  "payload": {
    "execution_id": "exec_abc123",
    "status": "completed",
    "output": "The weather in Paris is currently 18°C and partly cloudy.",
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 45,
      "total_tokens": 195
    },
    "latency_ms": 5000
  }
}
```

**Error:**

```json
{
  "type": "execution_error",
  "id": "evt_err_001",
  "timestamp": "2026-01-12T10:00:05.000Z",
  "payload": {
    "execution_id": "exec_abc123",
    "status": "failed",
    "error": {
      "code": "TOOL_EXECUTION_FAILED",
      "message": "Weather API is temporarily unavailable",
      "details": {
        "tool_name": "get_weather",
        "retry_after": 60
      }
    }
  }
}
```

---

## Server-Sent Events (SSE)

For clients that prefer HTTP-based streaming.

### Endpoint

```http
GET /v1/agents/{agent_id}/execute/stream
Authorization: Bearer {token}
Accept: text/event-stream

{
  "input": "What is the weather?",
  "session_id": "sess_xyz"
}
```

### Event Format

```
event: execution_start
id: evt_001
data: {"execution_id":"exec_abc123","status":"running"}

event: token
id: evt_002
data: {"token":"The ","index":0}

event: token
id: evt_003
data: {"token":"weather ","index":1}

event: tool_call
id: evt_010
data: {"id":"tool_001","name":"get_weather","status":"calling"}

event: tool_result
id: evt_011
data: {"id":"tool_001","name":"get_weather","status":"completed","result":{...}}

event: complete
id: evt_020
data: {"status":"completed","output":"The weather...","usage":{...}}

event: done
data: {}
```

### Retry Mechanism

```
retry: 3000
```

### Error Events

```
event: error
id: err_001
data: {"code":"RATE_LIMITED","message":"Too many requests","retry_after":60}
```

---

## Backend Implementation

### WebSocket Handler (FastAPI)

```python
# app/api/websocket.py
from fastapi import WebSocket, WebSocketDisconnect
from app.services.websocket_manager import WebSocketManager

manager = WebSocketManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        # Wait for authentication
        auth_msg = await asyncio.wait_for(
            websocket.receive_json(),
            timeout=5.0
        )

        if auth_msg.get("type") != "auth":
            await websocket.close(code=4001, reason="Authentication required")
            return

        # Validate token
        user = await authenticate_websocket(auth_msg["payload"]["token"])
        if not user:
            await websocket.send_json({
                "type": "auth_error",
                "payload": {"code": "INVALID_TOKEN", "message": "Invalid token"}
            })
            await websocket.close(code=4001)
            return

        # Register connection
        connection_id = await manager.connect(websocket, user)
        await websocket.send_json({
            "type": "auth_success",
            "payload": {
                "user_id": str(user.id),
                "org_id": str(user.organization_id),
                "connection_id": connection_id
            }
        })

        # Handle messages
        while True:
            message = await websocket.receive_json()
            await handle_message(websocket, user, message)

    except WebSocketDisconnect:
        await manager.disconnect(connection_id)
    except asyncio.TimeoutError:
        await websocket.close(code=4001, reason="Authentication timeout")
```

### WebSocket Manager

```python
# app/services/websocket_manager.py
from typing import Dict, Set
from dataclasses import dataclass
import asyncio
import redis.asyncio as redis

@dataclass
class Connection:
    websocket: WebSocket
    user_id: str
    org_id: str
    subscriptions: Set[str]

class WebSocketManager:
    def __init__(self):
        self.connections: Dict[str, Connection] = {}
        self.redis = redis.from_url("redis://localhost:6379")

    async def connect(self, websocket: WebSocket, user) -> str:
        connection_id = str(uuid.uuid4())
        self.connections[connection_id] = Connection(
            websocket=websocket,
            user_id=str(user.id),
            org_id=str(user.organization_id),
            subscriptions=set()
        )

        # Start listening to Redis pub/sub for this user
        asyncio.create_task(self._listen_redis(connection_id))

        return connection_id

    async def disconnect(self, connection_id: str):
        if connection_id in self.connections:
            del self.connections[connection_id]

    async def subscribe(self, connection_id: str, channel: str, filters: dict):
        conn = self.connections.get(connection_id)
        if conn:
            subscription_key = f"{channel}:{conn.org_id}"
            conn.subscriptions.add(subscription_key)
            await self.redis.subscribe(subscription_key)

    async def broadcast_to_org(self, org_id: str, channel: str, message: dict):
        """Broadcast message to all connections in an organization."""
        await self.redis.publish(
            f"{channel}:{org_id}",
            json.dumps(message)
        )

    async def send_to_user(self, user_id: str, message: dict):
        """Send message to specific user's connections."""
        for conn in self.connections.values():
            if conn.user_id == user_id:
                await conn.websocket.send_json(message)

    async def _listen_redis(self, connection_id: str):
        """Listen for messages from Redis and forward to WebSocket."""
        conn = self.connections.get(connection_id)
        if not conn:
            return

        pubsub = self.redis.pubsub()

        try:
            while connection_id in self.connections:
                for sub in conn.subscriptions:
                    await pubsub.subscribe(sub)

                async for message in pubsub.listen():
                    if message["type"] == "message":
                        data = json.loads(message["data"])
                        await conn.websocket.send_json(data)
        finally:
            await pubsub.unsubscribe()
```

### SSE Streaming

```python
# app/api/routes/executions.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter()

@router.post("/agents/{agent_id}/execute/stream")
async def stream_execution(
    agent_id: str,
    request: ExecutionRequest,
    current_user: User = Depends(get_current_user)
):
    async def event_generator():
        # Start execution
        execution = await executor.start(agent_id, request.input)

        yield f"event: execution_start\n"
        yield f"id: {execution.id}_start\n"
        yield f"data: {json.dumps({'execution_id': execution.id, 'status': 'running'})}\n\n"

        # Stream tokens
        async for event in executor.stream(execution.id):
            if event.type == "token":
                yield f"event: token\n"
                yield f"id: {event.id}\n"
                yield f"data: {json.dumps({'token': event.token, 'index': event.index})}\n\n"

            elif event.type == "tool_call":
                yield f"event: tool_call\n"
                yield f"id: {event.id}\n"
                yield f"data: {json.dumps(event.tool_call)}\n\n"

            elif event.type == "complete":
                yield f"event: complete\n"
                yield f"id: {event.id}\n"
                yield f"data: {json.dumps(event.result)}\n\n"

            elif event.type == "error":
                yield f"event: error\n"
                yield f"id: {event.id}\n"
                yield f"data: {json.dumps(event.error)}\n\n"

        yield f"event: done\n"
        yield f"data: {{}}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        }
    )
```

---

## Frontend Implementation

### React Hook

```typescript
// hooks/useAgentStream.ts
import { useState, useCallback, useRef } from 'react';

interface StreamState {
  status: 'idle' | 'streaming' | 'complete' | 'error';
  content: string;
  toolCalls: ToolCall[];
  error?: Error;
}

export function useAgentStream(agentId: string) {
  const [state, setState] = useState<StreamState>({
    status: 'idle',
    content: '',
    toolCalls: [],
  });

  const abortController = useRef<AbortController | null>(null);

  const execute = useCallback(async (input: string) => {
    abortController.current = new AbortController();

    setState({ status: 'streaming', content: '', toolCalls: [] });

    try {
      const response = await fetch(`/api/v1/agents/${agentId}/execute/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({ input }),
        signal: abortController.current.signal,
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const events = parseSSEChunk(chunk);

        for (const event of events) {
          switch (event.type) {
            case 'token':
              setState(prev => ({
                ...prev,
                content: prev.content + event.data.token,
              }));
              break;

            case 'tool_call':
              setState(prev => ({
                ...prev,
                toolCalls: [...prev.toolCalls, event.data],
              }));
              break;

            case 'complete':
              setState(prev => ({
                ...prev,
                status: 'complete',
              }));
              break;

            case 'error':
              setState(prev => ({
                ...prev,
                status: 'error',
                error: new Error(event.data.message),
              }));
              break;
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: error as Error,
        }));
      }
    }
  }, [agentId]);

  const cancel = useCallback(() => {
    abortController.current?.abort();
  }, []);

  return { ...state, execute, cancel };
}
```

### WebSocket Hook

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketState {
  connected: boolean;
  error?: Error;
}

export function useWebSocket(token: string) {
  const [state, setState] = useState<WebSocketState>({ connected: false });
  const ws = useRef<WebSocket | null>(null);
  const handlers = useRef<Map<string, Function>>(new Map());

  useEffect(() => {
    ws.current = new WebSocket(`wss://api.agentplatform.com/ws`);

    ws.current.onopen = () => {
      // Authenticate
      ws.current?.send(JSON.stringify({
        type: 'auth',
        payload: { token }
      }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'auth_success') {
        setState({ connected: true });
      } else if (message.type === 'auth_error') {
        setState({ connected: false, error: new Error(message.payload.message) });
      } else {
        // Handle subscribed events
        const handler = handlers.current.get(message.type);
        if (handler) {
          handler(message.payload);
        }
      }
    };

    ws.current.onerror = () => {
      setState(prev => ({ ...prev, error: new Error('WebSocket error') }));
    };

    ws.current.onclose = () => {
      setState({ connected: false });
    };

    return () => {
      ws.current?.close();
    };
  }, [token]);

  const subscribe = useCallback((channel: string, filters: object, handler: Function) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'subscribe',
        payload: { channel, filters }
      }));

      handlers.current.set(channel, handler);
    }
  }, []);

  const send = useCallback((type: string, payload: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  return { ...state, subscribe, send };
}
```

---

## Connection Management

### Heartbeat

Client sends ping every 30 seconds:

```json
{"type": "ping", "id": "ping_001"}
```

Server responds:

```json
{"type": "pong", "id": "ping_001"}
```

### Reconnection

```typescript
class ReconnectingWebSocket {
  private maxRetries = 5;
  private retryCount = 0;
  private baseDelay = 1000;

  async connect() {
    try {
      await this._connect();
      this.retryCount = 0;
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        const delay = this.baseDelay * Math.pow(2, this.retryCount);
        this.retryCount++;
        setTimeout(() => this.connect(), delay);
      }
    }
  }
}
```

### Connection Limits

| Limit | Value |
|-------|-------|
| Max connections per user | 5 |
| Max connections per org | 100 |
| Max message size | 64KB |
| Idle timeout | 5 minutes |
| Auth timeout | 5 seconds |

---

## Scaling

### Redis Pub/Sub

All WebSocket servers subscribe to Redis for message distribution.

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  WS 1   │     │  WS 2   │     │  WS 3   │
└────┬────┘     └────┬────┘     └────┬────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
              ┌──────┴──────┐
              │    Redis    │
              │   Pub/Sub   │
              └─────────────┘
```

### Load Balancing

Use sticky sessions for WebSocket connections:

```nginx
upstream websocket {
    ip_hash;  # Sticky sessions
    server ws1.internal:8000;
    server ws2.internal:8000;
    server ws3.internal:8000;
}

server {
    location /ws {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```
