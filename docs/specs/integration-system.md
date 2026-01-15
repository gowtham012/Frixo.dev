# Integration System Specification

> **Version:** 1.0
> **Date:** January 11, 2026
> **Status:** Design Phase

---

## Overview

The integration system enables agents to connect with external services securely. It follows a **hybrid model**: core connectors for popular services + an extensible SDK for custom integrations.

### Core Principles

1. **Proxy-Only Access**: Agents never see credentials
2. **Scoped Permissions**: Fine-grained access control
3. **Full Audit Trail**: Every action logged
4. **Graceful Degradation**: Handle failures elegantly

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   INTEGRATION ARCHITECTURE                       │
│                                                                  │
│  AGENT CODE                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  // Simple, clean API                                   │   │
│  │  const result = await platform.integrations.slack.send({│   │
│  │    channel: "#alerts",                                  │   │
│  │    message: "Hello world"                               │   │
│  │  });                                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  INTEGRATION SDK                        │   │
│  │  • Type-safe interfaces                                │   │
│  │  • Request serialization                               │   │
│  │  • Response parsing                                    │   │
│  │  • Error handling                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  INTEGRATION PROXY                      │   │
│  │                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │ Permission  │  │ Credential  │  │ Rate        │    │   │
│  │  │ Check       │→ │ Injection   │→ │ Limiting    │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  │         │                │                │            │   │
│  │         ▼                ▼                ▼            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │ Request     │  │ Execute     │  │ Response    │    │   │
│  │  │ Transform   │→ │ API Call    │→ │ Sanitize    │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  │                          │                             │   │
│  │                          ▼                             │   │
│  │                   ┌─────────────┐                      │   │
│  │                   │ Audit Log   │                      │   │
│  │                   └─────────────┘                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  EXTERNAL SERVICES                      │   │
│  │  Slack, Google, Salesforce, LinkedIn, etc.             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Connectors

### Tier 1: Launch Connectors (MVP)

| Service | Auth Type | Key Actions |
|---------|-----------|-------------|
| **Slack** | OAuth 2.0 | Send messages, read channels, reactions |
| **Google Calendar** | OAuth 2.0 | Read events, attendees, create events |
| **Gmail** | OAuth 2.0 | Read threads, send emails, search |
| **Notion** | OAuth 2.0 | Read/write pages, databases |
| **Salesforce** | OAuth 2.0 | Read/write contacts, opportunities |

### Tier 2: Growth Connectors

| Service | Auth Type | Key Actions |
|---------|-----------|-------------|
| **HubSpot** | OAuth 2.0 | CRM operations |
| **Jira** | OAuth 2.0 | Issue management |
| **GitHub** | OAuth 2.0 | Repos, issues, PRs |
| **LinkedIn** | OAuth 2.0 | Profile data (read) |
| **Microsoft 365** | OAuth 2.0 | Outlook, Teams, OneDrive |
| **Airtable** | API Key | Database operations |
| **Zapier** | OAuth 2.0 | Trigger Zaps |
| **Twilio** | API Key | SMS, voice |
| **SendGrid** | API Key | Email sending |
| **Stripe** | API Key | Payment operations |

### Tier 3: Utility Connectors

| Service | Auth Type | Key Actions |
|---------|-----------|-------------|
| **Web Search** | Platform | Search queries |
| **Web Scraper** | Platform | Fetch & parse URLs |
| **News API** | API Key | News search |
| **Weather** | API Key | Weather data |
| **Stock Data** | API Key | Financial data |

---

## Connector Specification

### Example: Slack Connector

```yaml
connector:
  id: "slack"
  name: "Slack"
  version: "1.0.0"
  category: "communication"

  auth:
    type: "oauth2"
    authorization_url: "https://slack.com/oauth/v2/authorize"
    token_url: "https://slack.com/api/oauth.v2.access"
    scopes:
      - "chat:write"
      - "channels:read"
      - "users:read"
      - "reactions:write"

  actions:
    send_message:
      description: "Send a message to a channel or DM"
      permissions_required: ["chat:write"]
      parameters:
        channel:
          type: "string"
          required: true
          description: "Channel ID or name"
        message:
          type: "string"
          required: true
          description: "Message content"
        thread_ts:
          type: "string"
          required: false
          description: "Thread timestamp for replies"
      rate_limit:
        requests_per_minute: 50
      example: |
        await platform.integrations.slack.send_message({
          channel: "#alerts",
          message: "Price dropped 20%!"
        });

    read_channel_history:
      description: "Read messages from a channel"
      permissions_required: ["channels:read"]
      parameters:
        channel:
          type: "string"
          required: true
        limit:
          type: "integer"
          default: 100
          max: 1000
      rate_limit:
        requests_per_minute: 50

    add_reaction:
      description: "Add an emoji reaction to a message"
      permissions_required: ["reactions:write"]
      parameters:
        channel:
          type: "string"
          required: true
        timestamp:
          type: "string"
          required: true
        emoji:
          type: "string"
          required: true

  webhooks:
    message_received:
      description: "Triggered when a message is received"
      event_type: "message"
      payload_schema:
        type: "object"
        properties:
          channel: { type: "string" }
          user: { type: "string" }
          text: { type: "string" }
          ts: { type: "string" }

  health_check:
    endpoint: "https://slack.com/api/api.test"
    method: "POST"
    expected_status: 200
```

---

## Permission Model

### Scoped Permissions

Every agent has explicit, fine-grained permissions:

```yaml
# Agent permission configuration
agent_permissions:
  agent_id: "meeting-prep-assistant"

  integrations:
    google_calendar:
      actions:
        - "read_events"
        - "read_attendees"
      scope_filters:
        calendars: ["primary"]  # Only primary calendar
      denied:
        - "write_events"
        - "delete_events"

    gmail:
      actions:
        - "read_threads"
        - "search"
      scope_filters:
        # Only threads involving meeting attendees
        query_template: "from:{{attendee_email}} OR to:{{attendee_email}}"
      denied:
        - "send_email"
        - "delete"

    linkedin:
      actions:
        - "read_public_profile"
      scope_filters:
        # Only profiles of meeting attendees
        allowed_profiles: "{{attendee_linkedin_urls}}"

    slack:
      actions:
        - "send_message"
      scope_filters:
        channels: ["@{{user}}", "#meeting-prep"]  # Only DM to user or specific channel
      denied:
        - "read_channel_history"
```

### Permission Enforcement

```
REQUEST: agent.gmail.search({ query: "salary negotiations" })
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 PERMISSION ENFORCEMENT                           │
│                                                                  │
│  1. Check action permission                                     │
│     └─→ gmail.search: ALLOWED ✓                                │
│                                                                  │
│  2. Check scope filter                                          │
│     └─→ Required: query must match "from:{{attendee}}"         │
│     └─→ Actual: "salary negotiations"                          │
│     └─→ VIOLATION: Query doesn't match scope filter            │
│                                                                  │
│  3. DENY REQUEST                                                │
│     └─→ Error: "Query must be scoped to meeting attendees"     │
│     └─→ Log: Permission violation attempt                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## OAuth Flow

### User Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    OAUTH CONNECTION FLOW                         │
│                                                                  │
│  1. USER INITIATES                                              │
│     ┌─────────────────────────────────────────────────────┐   │
│     │  User clicks "Connect Slack" in platform UI         │   │
│     └─────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  2. REDIRECT TO PROVIDER                                        │
│     ┌─────────────────────────────────────────────────────┐   │
│     │  Platform redirects to:                             │   │
│     │  https://slack.com/oauth/v2/authorize               │   │
│     │    ?client_id=PLATFORM_CLIENT_ID                   │   │
│     │    &scope=chat:write,channels:read                 │   │
│     │    &redirect_uri=https://platform/oauth/callback   │   │
│     │    &state=encrypted_session_state                  │   │
│     └─────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  3. USER AUTHORIZES                                             │
│     ┌─────────────────────────────────────────────────────┐   │
│     │  User sees Slack authorization screen:              │   │
│     │  "AgentPlatform wants to:                           │   │
│     │   ✓ Post messages in channels                       │   │
│     │   ✓ View channels and conversations"                │   │
│     │  [Authorize] [Cancel]                               │   │
│     └─────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  4. CALLBACK WITH CODE                                          │
│     ┌─────────────────────────────────────────────────────┐   │
│     │  Slack redirects to:                                │   │
│     │  https://platform/oauth/callback                    │   │
│     │    ?code=AUTHORIZATION_CODE                        │   │
│     │    &state=encrypted_session_state                  │   │
│     └─────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  5. EXCHANGE FOR TOKENS                                         │
│     ┌─────────────────────────────────────────────────────┐   │
│     │  Platform exchanges code for tokens:                │   │
│     │  POST https://slack.com/api/oauth.v2.access        │   │
│     │  → Receives: access_token, refresh_token           │   │
│     └─────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  6. SECURE STORAGE                                              │
│     ┌─────────────────────────────────────────────────────┐   │
│     │  Tokens encrypted and stored in Credential Vault    │   │
│     │  User sees: "Slack connected successfully"          │   │
│     └─────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Token Management

```yaml
# Token lifecycle management
token_management:
  storage:
    encryption: "AES-256-GCM"
    key_source: "HSM"

  refresh:
    strategy: "proactive"
    refresh_before_expiry: "5 minutes"
    retry_on_failure: 3
    fallback: "alert_user"

  revocation:
    on_user_disconnect: "immediate"
    on_security_incident: "immediate"
    propagation: "all_agents_using_credential"

  monitoring:
    track_usage: true
    alert_on_anomaly: true
    log_all_access: true
```

---

## Custom Tools SDK

### Tool Definition

Users can create custom tools for integrations not covered by core connectors:

```typescript
// Custom tool definition (TypeScript SDK)
import { defineTool, ToolContext } from '@agent-platform/sdk';

export const customCRMTool = defineTool({
  name: 'custom_crm',
  description: 'Integration with internal CRM system',
  version: '1.0.0',

  // Authentication configuration
  auth: {
    type: 'api_key',
    header: 'X-API-Key',
    // Key stored in user's credential vault
  },

  // Available actions
  actions: {
    getContact: {
      description: 'Retrieve a contact by email',
      parameters: {
        email: { type: 'string', required: true },
      },
      handler: async (params: { email: string }, ctx: ToolContext) => {
        const response = await ctx.http.get(
          `https://crm.internal/api/contacts`,
          { params: { email: params.email } }
        );
        return response.data;
      },
    },

    updateDealStage: {
      description: 'Update a deal stage',
      parameters: {
        dealId: { type: 'string', required: true },
        stage: { type: 'string', required: true },
      },
      handler: async (params, ctx: ToolContext) => {
        const response = await ctx.http.patch(
          `https://crm.internal/api/deals/${params.dealId}`,
          { stage: params.stage }
        );
        return response.data;
      },
    },
  },

  // Health check
  healthCheck: async (ctx: ToolContext) => {
    const response = await ctx.http.get('https://crm.internal/api/health');
    return response.status === 200;
  },
});
```

### Tool Registration

```yaml
# Tool registration in agent config
agent:
  name: "sales-assistant"

  tools:
    # Core connectors
    - connector: "slack"
      permissions: ["send_message"]

    - connector: "salesforce"
      permissions: ["read_opportunities"]

    # Custom tool
    - custom_tool: "./tools/custom_crm"
      permissions: ["getContact", "updateDealStage"]
      credential_ref: "user_crm_api_key"
```

---

## Error Handling

### Graceful Degradation

```yaml
# Integration error handling
error_handling:
  strategies:
    api_unavailable:
      action: "retry_with_backoff"
      max_retries: 3
      backoff: "exponential"
      fallback: "use_cached_data"
      notify_user: true

    rate_limited:
      action: "queue_and_retry"
      queue_timeout: "5 minutes"
      notify_user: false

    auth_expired:
      action: "refresh_token"
      fallback: "notify_user_to_reauthorize"

    permission_denied:
      action: "fail_fast"
      notify_user: true
      log_security_event: true

    data_validation_error:
      action: "fail_fast"
      return_error_details: true
```

### Example: Meeting Prep with Degraded LinkedIn

```
MEETING PREP EXECUTION
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│  RESEARCH PHASE (Parallel)                               │
│                                                          │
│  Calendar:  ✅ Success (attendees extracted)            │
│  Gmail:     ✅ Success (past threads found)             │
│  LinkedIn:  ⚠️ API Error (503 Service Unavailable)      │
│  Web:       ✅ Success (news articles found)            │
│                                                          │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│  GRACEFUL DEGRADATION                                    │
│                                                          │
│  LinkedIn failure handling:                              │
│  1. Check cache: Found 7-day-old profile data           │
│  2. Decision: Use cached data with warning              │
│                                                          │
│  Output includes:                                        │
│  "⚠️ LinkedIn data from 7 days ago - may be outdated"   │
│                                                          │
└──────────────────────────────────────────────────────────┘
         │
         ▼
     DELIVER (with warning)
```

---

## Rate Limiting

### Per-Integration Limits

```yaml
# Rate limiting configuration
rate_limits:
  slack:
    tier_1:  # Free tier
      requests_per_minute: 20
      requests_per_hour: 500
    tier_2:  # Pro tier
      requests_per_minute: 50
      requests_per_hour: 2000
    tier_3:  # Enterprise
      requests_per_minute: 100
      requests_per_hour: 10000

  google_calendar:
    # Google's limits are per-user, we add buffer
    requests_per_minute: 30
    requests_per_hour: 1000

  salesforce:
    # Based on Salesforce API limits
    requests_per_day: 15000  # Per org
    concurrent_requests: 25
```

### Rate Limit Response

```
REQUEST: agent.slack.send_message(...)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 RATE LIMIT CHECK                                 │
│                                                                  │
│  Agent: meeting-prep-assistant                                  │
│  Integration: slack                                              │
│  Action: send_message                                           │
│                                                                  │
│  Current usage (last minute): 48/50                             │
│  Status: APPROACHING LIMIT                                       │
│                                                                  │
│  Decision: ALLOW (but warn)                                     │
│  Response header: X-RateLimit-Remaining: 2                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Audit Trail

### Integration Audit Log

```yaml
# Integration audit log entry
audit_entry:
  id: "audit-uuid"
  timestamp: "2026-01-11T14:30:00.000Z"

  agent:
    id: "agent-uuid"
    name: "meeting-prep-assistant"
    owner: "user-uuid"

  integration:
    name: "slack"
    action: "send_message"

  request:
    parameters:
      channel: "#meeting-prep"
      message: "[CONTENT_HASH: abc123]"  # Not storing actual content
    size_bytes: 1247

  permission:
    check_result: "allowed"
    permission_used: "slack:write:#meeting-prep"

  execution:
    latency_ms: 234
    status: "success"
    response_code: 200

  security:
    credential_id: "cred-uuid"
    ip_address: "internal"
    trace_id: "trace-uuid"
```

### Audit Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  INTEGRATION AUDIT: meeting-prep-assistant                    │
│  ────────────────────────────────────────────────────────────│
│                                                              │
│  LAST 24 HOURS                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Total API Calls:         847                          │ │
│  │  Success Rate:            99.2%                        │ │
│  │  Avg Latency:             187ms                        │ │
│  │  Permission Denials:      3                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  BY INTEGRATION                                              │
│  ├── Google Calendar:   312 calls (100% success)           │
│  ├── Gmail:             245 calls (99.6% success)          │
│  ├── LinkedIn:          156 calls (97.4% success)          │
│  ├── Slack:             127 calls (100% success)           │
│  └── Web Search:          7 calls (100% success)           │
│                                                              │
│  RECENT FAILURES                                             │
│  ├── 14:23 - LinkedIn rate limited (retried, succeeded)    │
│  ├── 11:45 - Gmail token refresh (auto-refreshed)          │
│  └── 09:12 - Permission denied: gmail search scope         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Webhook Support

### Incoming Webhooks

Receive events from external services:

```yaml
# Webhook configuration
webhook:
  agent: "sales-alert-agent"

  triggers:
    - source: "salesforce"
      event: "opportunity_updated"
      filter:
        stage: ["Closed Won", "Closed Lost"]
      action: "trigger_agent"

    - source: "slack"
      event: "message_received"
      filter:
        channel: "#sales-requests"
        contains: "@agent"
      action: "trigger_agent"

  security:
    verify_signature: true
    allowed_ips: ["salesforce_ip_range"]
    replay_protection: true
```

### Webhook Processing

```
WEBHOOK RECEIVED
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│  WEBHOOK PROCESSOR                                        │
│                                                          │
│  1. VERIFY SIGNATURE                                     │
│     └─→ HMAC-SHA256 signature valid ✓                   │
│                                                          │
│  2. CHECK SOURCE                                         │
│     └─→ IP in Salesforce range ✓                        │
│                                                          │
│  3. REPLAY PROTECTION                                    │
│     └─→ Event ID not seen before ✓                      │
│                                                          │
│  4. MATCH TO AGENT                                       │
│     └─→ sales-alert-agent subscribed to this event ✓    │
│                                                          │
│  5. TRIGGER AGENT                                        │
│     └─→ Queued for execution                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

*Document created: January 11, 2026*
*Last updated: January 11, 2026*
