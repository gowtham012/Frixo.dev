# Agent Platform Architecture Documentation

This documentation covers the technical architecture of the Agent Platform, including agent flows, API management, and integration patterns.

## Documentation Index

### Agent Examples
- [LinkedIn Content Poster Agent](../agents/linkedin-content-poster.md) - Automated daily content posting
- [Meeting Prep Assistant Agent](../agents/meeting-prep-assistant.md) - Calendar-triggered meeting preparation

### Platform Architecture
- [Platform-Provided APIs](./platform-provided-apis.md) - How the platform manages external API integrations
- [Custom API Integration](../integrations/custom-api-integration.md) - How users add their own APIs

### Quick Links
- [Agent Flow Diagrams](#agent-flows)
- [API Management](#api-management)
- [Security Model](#security-model)

---

## Platform Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENT PLATFORM                                     │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Agent     │  │   Agent     │  │   Agent     │  │   Agent     │       │
│  │  LinkedIn   │  │  Meeting    │  │  Research   │  │   Custom    │       │
│  │  Poster     │  │   Prep      │  │  Assistant  │  │   Agent     │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │                │               │
│         └────────────────┴────────────────┴────────────────┘               │
│                                   │                                         │
│                    ┌──────────────┴──────────────┐                         │
│                    │      PLATFORM LAYER         │                         │
│                    │                             │                         │
│                    │  ┌─────────────────────┐   │                         │
│                    │  │   Tool Abstraction  │   │                         │
│                    │  │   Layer             │   │                         │
│                    │  └─────────────────────┘   │                         │
│                    │            │               │                         │
│                    │  ┌─────────┴─────────┐    │                         │
│                    │  │                   │    │                         │
│                    │  ▼                   ▼    │                         │
│                    │ Platform          Custom  │                         │
│                    │ APIs              APIs    │                         │
│                    └──────────────────────────┘                         │
│                              │                                           │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
    ┌───────────┐       ┌───────────┐       ┌───────────┐
    │  NewsAPI  │       │  LinkedIn │       │  User's   │
    │  OpenAI   │       │  Slack    │       │  Custom   │
    │  Bing     │       │  Gmail    │       │  APIs     │
    └───────────┘       └───────────┘       └───────────┘
```

## Core Concepts

### 1. Agents
Agents are autonomous programs that execute tasks on behalf of users. They can be:
- **Scheduled** (cron-based triggers)
- **Event-driven** (calendar events, webhooks)
- **On-demand** (user-initiated)

### 2. Platform Tools
Abstraction layer that provides:
- Unified interface for external APIs
- Credential management (users never see API keys)
- Rate limiting and fallback handling
- Usage tracking and billing

### 3. Security Model
- Agents run in sandboxed environments
- Credentials stored in encrypted vault
- All API calls proxied through platform
- Full audit logging

---

## Agent Flows

### LinkedIn Content Poster
Automated agent that posts content daily:
1. Triggered at scheduled time (e.g., 10am daily)
2. Researches trending topics via News APIs
3. Generates content via LLM
4. Runs quality/safety evals
5. Posts to LinkedIn via OAuth proxy
6. Logs results and updates analytics

[Full Documentation →](../agents/linkedin-content-poster.md)

### Meeting Prep Assistant
Event-driven agent that prepares briefings:
1. Triggered by calendar events (1 hour before meeting)
2. Parses attendee information
3. Parallel research: LinkedIn, News, Email history, CRM
4. Synthesizes into structured briefing
5. Delivers to user's preferred channel

[Full Documentation →](../agents/meeting-prep-assistant.md)

---

## API Management

### Platform-Provided APIs
The platform manages accounts, keys, and billing for common APIs:
- News APIs (NewsAPI, Bing News, Google News)
- LLM APIs (OpenAI, Anthropic)
- Social APIs (LinkedIn, Twitter)

Benefits:
- Zero setup for users
- Automatic key rotation
- Fallback chains for reliability
- Cost included in subscription

[Full Documentation →](./platform-provided-apis.md)

### Custom API Integration
Users can add their own APIs:
- Define via OpenAPI spec or manual configuration
- Multiple auth types (API Key, OAuth, Bearer, Basic)
- Secure credential storage
- Support for internal/private APIs via tunnels

[Full Documentation →](../integrations/custom-api-integration.md)

---

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│  SECURITY LAYERS                                            │
│                                                             │
│  Layer 1: Agent Sandbox                                     │
│  ├── No direct network access                              │
│  ├── No file system access                                 │
│  ├── No credential visibility                              │
│  └── Isolated execution environment                        │
│                                                             │
│  Layer 2: Platform Gateway                                  │
│  ├── Request validation                                    │
│  ├── Rate limiting (per user, per API)                     │
│  ├── URL allowlist enforcement                             │
│  └── Response sanitization                                 │
│                                                             │
│  Layer 3: Credential Management                             │
│  ├── Encrypted vault storage                               │
│  ├── Automatic key rotation                                │
│  ├── Audit logging                                         │
│  └── Scoped permissions                                    │
│                                                             │
│  Layer 4: External API Proxy                               │
│  ├── TLS verification                                      │
│  ├── Timeout enforcement                                   │
│  ├── Response size limits                                  │
│  └── Error sanitization                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. Review [Agent Examples](../agents/) for implementation patterns
2. Understand [Platform APIs](./platform-provided-apis.md) for available tools
3. Learn about [Custom Integrations](../integrations/custom-api-integration.md) for extending the platform
