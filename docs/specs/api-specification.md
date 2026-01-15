# API Specification

## Overview

This document defines the REST API for the AI Agent Platform. All APIs follow RESTful conventions with JSON request/response bodies.

**Base URL:** `https://api.agentplatform.com/v1`

**API Version:** v1

---

## Authentication

All API requests require authentication via Bearer token.

```
Authorization: Bearer <access_token>
```

### Token Types
| Type | Lifetime | Use Case |
|------|----------|----------|
| Access Token | 15 minutes | API requests |
| Refresh Token | 7 days | Get new access token |
| API Key | Until revoked | Server-to-server, SDK |

---

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-01-11T10:00:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-01-11T10:00:00Z"
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `AGENT_EXECUTION_FAILED` | 422 | Agent execution error |
| `INTEGRATION_ERROR` | 502 | Third-party API error |
| `QUOTA_EXCEEDED` | 402 | Usage quota exceeded |

---

## Rate Limits

| Tier | Requests/min | Requests/day |
|------|-------------|--------------|
| Starter | 60 | 10,000 |
| Pro | 300 | 50,000 |
| Team | 1,000 | 200,000 |
| Enterprise | Custom | Custom |

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704970800
```

---

# API Endpoints

## Authentication

### Register User
```
POST /auth/register
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2026-01-11T10:00:00Z"
    },
    "tokens": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ...",
      "expires_in": 900
    }
  }
}
```

### Login
```
POST /auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "tokens": {
      "access_token": "eyJ...",
      "refresh_token": "eyJ...",
      "expires_in": 900
    }
  }
}
```

### Refresh Token
```
POST /auth/refresh
```

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "expires_in": 900
  }
}
```

### Logout
```
POST /auth/logout
```

**Response:** `204 No Content`

---

## Users

### Get Current User
```
GET /users/me
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://...",
    "organization_id": "org_xyz789",
    "role": "admin",
    "created_at": "2026-01-11T10:00:00Z"
  }
}
```

### Update Current User
```
PATCH /users/me
```

**Request:**
```json
{
  "name": "John Updated",
  "avatar_url": "https://..."
}
```

**Response:** `200 OK`

### Generate API Key
```
POST /users/me/api-keys
```

**Request:**
```json
{
  "name": "Production Key",
  "scopes": ["agents:read", "agents:execute"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "key_abc123",
    "name": "Production Key",
    "key": "ap_live_xxxxxxxxxxxx",  // Only shown once
    "scopes": ["agents:read", "agents:execute"],
    "created_at": "2026-01-11T10:00:00Z"
  }
}
```

### List API Keys
```
GET /users/me/api-keys
```

### Revoke API Key
```
DELETE /users/me/api-keys/{key_id}
```

---

## Organizations

### Get Organization
```
GET /organizations/{org_id}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "org_xyz789",
    "name": "Acme Corp",
    "tier": "pro",
    "members_count": 5,
    "agents_count": 12,
    "usage": {
      "executions_this_month": 5420,
      "tokens_this_month": 1250000
    },
    "created_at": "2026-01-11T10:00:00Z"
  }
}
```

### Update Organization
```
PATCH /organizations/{org_id}
```

### List Organization Members
```
GET /organizations/{org_id}/members
```

### Invite Member
```
POST /organizations/{org_id}/invites
```

**Request:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

### Remove Member
```
DELETE /organizations/{org_id}/members/{user_id}
```

---

## Agents

### List Agents
```
GET /agents
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Items per page (default: 20, max: 100) |
| `status` | string | Filter by status: draft, active, archived |
| `search` | string | Search by name or description |
| `sort` | string | Sort field: created_at, updated_at, name |
| `order` | string | Sort order: asc, desc |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "agt_abc123",
      "name": "LinkedIn Content Poster",
      "description": "Automatically posts content to LinkedIn",
      "status": "active",
      "version": 3,
      "executions_count": 1250,
      "last_executed_at": "2026-01-11T09:00:00Z",
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-10T15:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Create Agent
```
POST /agents
```

**Request:**
```json
{
  "name": "LinkedIn Content Poster",
  "description": "Automatically posts content to LinkedIn",
  "config": {
    "model": "gpt-4o",
    "temperature": 0.7,
    "max_tokens": 2000,
    "system_prompt": "You are a professional content creator...",
    "tools": ["linkedin_post", "web_search"],
    "memory": {
      "type": "vector",
      "namespace": "linkedin-poster"
    }
  },
  "triggers": [
    {
      "type": "schedule",
      "cron": "0 9 * * 1-5"
    }
  ],
  "integrations": ["int_linkedin_123"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "agt_abc123",
    "name": "LinkedIn Content Poster",
    "description": "Automatically posts content to LinkedIn",
    "status": "draft",
    "version": 1,
    "config": { ... },
    "triggers": [ ... ],
    "integrations": [ ... ],
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T10:00:00Z"
  }
}
```

### Get Agent
```
GET /agents/{agent_id}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "agt_abc123",
    "name": "LinkedIn Content Poster",
    "description": "Automatically posts content to LinkedIn",
    "status": "active",
    "version": 3,
    "config": {
      "model": "gpt-4o",
      "temperature": 0.7,
      "max_tokens": 2000,
      "system_prompt": "You are a professional content creator...",
      "tools": ["linkedin_post", "web_search"],
      "memory": {
        "type": "vector",
        "namespace": "linkedin-poster"
      }
    },
    "triggers": [
      {
        "id": "trg_xyz",
        "type": "schedule",
        "cron": "0 9 * * 1-5",
        "enabled": true
      }
    ],
    "integrations": [
      {
        "id": "int_linkedin_123",
        "provider": "linkedin",
        "status": "connected"
      }
    ],
    "stats": {
      "total_executions": 1250,
      "success_rate": 0.98,
      "avg_latency_ms": 3500,
      "tokens_used": 125000
    },
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-10T15:00:00Z"
  }
}
```

### Update Agent
```
PATCH /agents/{agent_id}
```

**Request:**
```json
{
  "name": "Updated Name",
  "config": {
    "temperature": 0.8
  }
}
```

### Delete Agent
```
DELETE /agents/{agent_id}
```

**Response:** `204 No Content`

### Activate Agent
```
POST /agents/{agent_id}/activate
```

### Deactivate Agent
```
POST /agents/{agent_id}/deactivate
```

### Clone Agent
```
POST /agents/{agent_id}/clone
```

**Request:**
```json
{
  "name": "LinkedIn Poster - Copy"
}
```

---

## Agent Execution

### Execute Agent
```
POST /agents/{agent_id}/execute
```

**Request:**
```json
{
  "input": {
    "topic": "AI trends in 2026",
    "tone": "professional"
  },
  "options": {
    "stream": false,
    "timeout": 30000,
    "sandbox": true
  }
}
```

**Response:** `200 OK` (non-streaming)
```json
{
  "success": true,
  "data": {
    "execution_id": "exec_abc123",
    "status": "completed",
    "input": { ... },
    "output": {
      "content": "Here's your LinkedIn post about AI trends...",
      "actions_taken": [
        {
          "tool": "web_search",
          "input": "AI trends 2026",
          "output": "..."
        },
        {
          "tool": "linkedin_post",
          "input": { "content": "..." },
          "output": { "post_id": "..." }
        }
      ]
    },
    "metrics": {
      "latency_ms": 3500,
      "tokens_input": 500,
      "tokens_output": 800,
      "cost_usd": 0.015
    },
    "created_at": "2026-01-11T10:00:00Z",
    "completed_at": "2026-01-11T10:00:03Z"
  }
}
```

### Execute Agent (Streaming)
```
POST /agents/{agent_id}/execute
Content-Type: application/json
Accept: text/event-stream
```

**Request:**
```json
{
  "input": { ... },
  "options": {
    "stream": true
  }
}
```

**Response:** `200 OK` (Server-Sent Events)
```
event: start
data: {"execution_id": "exec_abc123"}

event: thinking
data: {"content": "Analyzing the topic..."}

event: tool_call
data: {"tool": "web_search", "input": "AI trends 2026"}

event: tool_result
data: {"tool": "web_search", "output": "..."}

event: output
data: {"content": "Here's your LinkedIn post..."}

event: complete
data: {"metrics": {"latency_ms": 3500, "tokens_input": 500, "tokens_output": 800}}
```

### Get Execution
```
GET /agents/{agent_id}/executions/{execution_id}
```

### List Executions
```
GET /agents/{agent_id}/executions
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `per_page` | integer | Items per page |
| `status` | string | Filter: pending, running, completed, failed |
| `from` | datetime | Start date filter |
| `to` | datetime | End date filter |

### Cancel Execution
```
POST /agents/{agent_id}/executions/{execution_id}/cancel
```

---

## Agent Tests

### List Tests
```
GET /agents/{agent_id}/tests
```

### Create Test
```
POST /agents/{agent_id}/tests
```

**Request:**
```json
{
  "name": "Content Quality Test",
  "type": "quality",
  "config": {
    "criteria": [
      {
        "name": "professional_tone",
        "description": "Content should be professional",
        "weight": 0.3
      },
      {
        "name": "relevance",
        "description": "Content should be relevant to topic",
        "weight": 0.5
      },
      {
        "name": "length",
        "description": "Content should be 100-300 words",
        "weight": 0.2
      }
    ],
    "passing_score": 0.8
  }
}
```

### Run Tests
```
POST /agents/{agent_id}/tests/run
```

**Request:**
```json
{
  "test_ids": ["test_abc", "test_xyz"],  // Optional, runs all if empty
  "samples": 10
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "run_id": "run_abc123",
    "status": "running",
    "tests": ["test_abc", "test_xyz"],
    "created_at": "2026-01-11T10:00:00Z"
  }
}
```

### Get Test Run Results
```
GET /agents/{agent_id}/tests/runs/{run_id}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "run_id": "run_abc123",
    "status": "completed",
    "results": [
      {
        "test_id": "test_abc",
        "name": "Content Quality Test",
        "passed": true,
        "score": 0.87,
        "details": {
          "professional_tone": 0.9,
          "relevance": 0.85,
          "length": 0.88
        }
      }
    ],
    "summary": {
      "total": 2,
      "passed": 2,
      "failed": 0,
      "overall_score": 0.85
    },
    "completed_at": "2026-01-11T10:01:00Z"
  }
}
```

---

## Integrations

### List Available Integrations
```
GET /integrations/available
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "provider": "linkedin",
      "name": "LinkedIn",
      "category": "social",
      "description": "Post content and manage LinkedIn presence",
      "scopes": [
        {
          "id": "w_member_social",
          "name": "Post on behalf of user",
          "required": true
        }
      ],
      "actions": ["post_content", "get_profile", "get_analytics"]
    },
    {
      "provider": "slack",
      "name": "Slack",
      "category": "communication",
      "description": "Send messages and interact with Slack",
      "scopes": [...],
      "actions": ["send_message", "create_channel", "list_channels"]
    }
  ]
}
```

### List Connected Integrations
```
GET /integrations
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "int_abc123",
      "provider": "linkedin",
      "name": "LinkedIn - John Doe",
      "status": "connected",
      "scopes": ["w_member_social", "r_liteprofile"],
      "connected_at": "2026-01-01T10:00:00Z",
      "expires_at": "2026-04-01T10:00:00Z"
    }
  ]
}
```

### Connect Integration (Start OAuth)
```
POST /integrations/connect
```

**Request:**
```json
{
  "provider": "linkedin",
  "scopes": ["w_member_social", "r_liteprofile"],
  "redirect_url": "https://app.agentplatform.com/integrations/callback"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "auth_url": "https://www.linkedin.com/oauth/v2/authorization?...",
    "state": "state_xyz123"
  }
}
```

### Complete OAuth Callback
```
POST /integrations/callback
```

**Request:**
```json
{
  "provider": "linkedin",
  "code": "oauth_code_from_provider",
  "state": "state_xyz123"
}
```

### Disconnect Integration
```
DELETE /integrations/{integration_id}
```

### Test Integration
```
POST /integrations/{integration_id}/test
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "latency_ms": 250,
    "account": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

## Marketplace

### List Marketplace Agents
```
GET /marketplace/agents
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `per_page` | integer | Items per page |
| `category` | string | Filter by category |
| `price_min` | integer | Min price in cents |
| `price_max` | integer | Max price in cents |
| `rating_min` | float | Min rating (0-5) |
| `sort` | string | Sort: popular, newest, price_asc, price_desc, rating |
| `search` | string | Search query |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "mkt_abc123",
      "agent_id": "agt_xyz",
      "name": "LinkedIn Content Automator",
      "description": "Automatically create and post LinkedIn content",
      "seller": {
        "id": "usr_seller",
        "name": "AI Solutions Inc",
        "verified": true
      },
      "price_cents": 2900,
      "category": "social_media",
      "tags": ["linkedin", "content", "automation"],
      "rating": 4.8,
      "reviews_count": 125,
      "downloads": 1500,
      "tier": "verified",
      "preview_images": ["https://..."],
      "created_at": "2026-01-01T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Get Marketplace Agent
```
GET /marketplace/agents/{listing_id}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "mkt_abc123",
    "agent_id": "agt_xyz",
    "name": "LinkedIn Content Automator",
    "description": "Full description...",
    "long_description": "Detailed markdown description...",
    "seller": {
      "id": "usr_seller",
      "name": "AI Solutions Inc",
      "verified": true,
      "total_sales": 5000,
      "member_since": "2025-06-01T10:00:00Z"
    },
    "price_cents": 2900,
    "category": "social_media",
    "tags": ["linkedin", "content", "automation"],
    "rating": 4.8,
    "reviews_count": 125,
    "downloads": 1500,
    "tier": "verified",
    "preview_images": ["https://..."],
    "demo_video_url": "https://...",
    "features": [
      "Auto-generate content from topics",
      "Schedule posts",
      "Analytics tracking"
    ],
    "requirements": {
      "integrations": ["linkedin"],
      "tier": "pro"
    },
    "test_results": {
      "functional": { "passed": true, "score": 0.95 },
      "safety": { "passed": true, "score": 0.98 },
      "quality": { "passed": true, "score": 0.88 }
    },
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-10T15:00:00Z"
  }
}
```

### Purchase Agent
```
POST /marketplace/agents/{listing_id}/purchase
```

**Request:**
```json
{
  "payment_method_id": "pm_abc123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "purchase_id": "pur_abc123",
    "agent_id": "agt_cloned_xyz",
    "amount_cents": 2900,
    "status": "completed",
    "receipt_url": "https://...",
    "created_at": "2026-01-11T10:00:00Z"
  }
}
```

### List My Purchases
```
GET /marketplace/purchases
```

### Create Listing (Sell Agent)
```
POST /marketplace/listings
```

**Request:**
```json
{
  "agent_id": "agt_abc123",
  "price_cents": 2900,
  "category": "social_media",
  "tags": ["linkedin", "content"],
  "long_description": "Detailed markdown description...",
  "preview_images": ["https://..."],
  "demo_video_url": "https://..."
}
```

### Update Listing
```
PATCH /marketplace/listings/{listing_id}
```

### Delete Listing
```
DELETE /marketplace/listings/{listing_id}
```

### List My Listings (Seller)
```
GET /marketplace/listings/mine
```

### Get Sales Analytics (Seller)
```
GET /marketplace/analytics
```

---

## Reviews

### List Reviews
```
GET /marketplace/agents/{listing_id}/reviews
```

### Create Review
```
POST /marketplace/agents/{listing_id}/reviews
```

**Request:**
```json
{
  "rating": 5,
  "title": "Excellent agent!",
  "body": "This agent saved me hours of work..."
}
```

---

## Billing

### Get Current Plan
```
GET /billing/plan
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tier": "pro",
    "price_cents": 9900,
    "billing_cycle": "monthly",
    "current_period_start": "2026-01-01T00:00:00Z",
    "current_period_end": "2026-02-01T00:00:00Z",
    "limits": {
      "agents": 50,
      "executions_per_month": 10000,
      "team_members": 5
    },
    "usage": {
      "agents": 12,
      "executions_this_month": 5420,
      "team_members": 3
    }
  }
}
```

### Get Usage
```
GET /billing/usage
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | datetime | Start date |
| `to` | datetime | End date |
| `granularity` | string | day, week, month |

### List Invoices
```
GET /billing/invoices
```

### Get Invoice
```
GET /billing/invoices/{invoice_id}
```

### Update Payment Method
```
POST /billing/payment-methods
```

### Change Plan
```
POST /billing/plan/change
```

**Request:**
```json
{
  "tier": "team",
  "billing_cycle": "yearly"
}
```

---

## Webhooks

### List Webhooks
```
GET /webhooks
```

### Create Webhook
```
POST /webhooks
```

**Request:**
```json
{
  "url": "https://your-server.com/webhook",
  "events": [
    "agent.execution.completed",
    "agent.execution.failed",
    "agent.test.completed"
  ],
  "secret": "whsec_your_secret"
}
```

### Update Webhook
```
PATCH /webhooks/{webhook_id}
```

### Delete Webhook
```
DELETE /webhooks/{webhook_id}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `agent.created` | Agent was created |
| `agent.updated` | Agent was updated |
| `agent.deleted` | Agent was deleted |
| `agent.execution.started` | Execution started |
| `agent.execution.completed` | Execution completed successfully |
| `agent.execution.failed` | Execution failed |
| `agent.test.completed` | Test run completed |
| `integration.connected` | Integration connected |
| `integration.disconnected` | Integration disconnected |
| `integration.failed` | Integration action failed |
| `marketplace.purchase` | Agent was purchased |
| `marketplace.sale` | You made a sale |

### Webhook Payload
```json
{
  "id": "evt_abc123",
  "type": "agent.execution.completed",
  "created_at": "2026-01-11T10:00:00Z",
  "data": {
    "agent_id": "agt_abc123",
    "execution_id": "exec_xyz",
    "status": "completed",
    ...
  }
}
```

---

## Health & Status

### Health Check
```
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-11T10:00:00Z"
}
```

### System Status
```
GET /status
```

**Response:** `200 OK`
```json
{
  "status": "operational",
  "services": {
    "api": "operational",
    "database": "operational",
    "cache": "operational",
    "agent_runtime": "operational",
    "integrations": "operational"
  },
  "updated_at": "2026-01-11T10:00:00Z"
}
```

---

## SDK Endpoints

These endpoints are optimized for SDK usage.

### SDK: Execute Agent (Simplified)
```
POST /sdk/agents/{agent_id}/run
```

**Request:**
```json
{
  "input": "Create a LinkedIn post about AI trends"
}
```

### SDK: Stream Execute
```
POST /sdk/agents/{agent_id}/stream
```

### SDK: Get Agent Config
```
GET /sdk/agents/{agent_id}/config
```

---

## OpenAPI Specification

Full OpenAPI 3.0 specification available at:
```
GET /openapi.json
GET /openapi.yaml
```

Interactive documentation:
```
GET /docs      # Swagger UI
GET /redoc     # ReDoc
```
