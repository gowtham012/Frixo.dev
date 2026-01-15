# Agent Examples

This section contains detailed documentation for example agents that demonstrate the platform's capabilities.

## Available Agent Examples

### 1. LinkedIn Content Poster
**Type:** Scheduled (Cron-based)

An automated agent that posts content to LinkedIn on a daily schedule. Demonstrates:
- Scheduled triggers
- News API integration
- LLM content generation
- Quality/safety evaluations
- OAuth-based social media posting

[View Full Documentation →](./linkedin-content-poster.md)

---

### 2. Meeting Prep Assistant
**Type:** Event-driven (Calendar-based)

An intelligent agent that prepares briefings before calendar meetings. Demonstrates:
- Event-driven triggers
- Parallel API calls
- Multi-source data aggregation
- LLM synthesis
- Multi-channel delivery

[View Full Documentation →](./meeting-prep-assistant.md)

---

## Agent Patterns

### Scheduled Agents
Agents triggered on a time-based schedule (cron).

```yaml
trigger:
  type: "schedule"
  cron: "0 10 * * *"  # Daily at 10am
  timezone: "America/New_York"
```

**Use cases:**
- Daily reports
- Scheduled social posts
- Periodic data sync
- Regular maintenance tasks

### Event-Driven Agents
Agents triggered by external events.

```yaml
trigger:
  type: "event"
  source: "calendar"
  event: "meeting_starting"
  offset: "-1 hour"
```

**Use cases:**
- Meeting preparation
- Webhook handlers
- Email processors
- File watchers

### On-Demand Agents
Agents triggered manually by users.

```yaml
trigger:
  type: "manual"
  # Or via API call
```

**Use cases:**
- Research assistants
- Content generators
- Data analyzers
- Custom workflows

---

## Common Agent Components

### Permissions
```yaml
permissions:
  linkedin:
    - "write:posts"
    - "read:profile"
  web_search:
    - "search:news"
  llm:
    - "generate:text"
```

### Settings
```yaml
settings:
  research_depth: "comprehensive"
  delivery_channel: "slack"
  auto_retry: true
  max_retries: 3
```

### Evaluations
```yaml
evals:
  quality:
    - grammar_check: true
    - readability_score: "> 60"
  safety:
    - no_pii: true
    - brand_safe: true
```

---

## Creating Your Own Agent

1. **Define the trigger** - What starts your agent?
2. **Specify permissions** - What APIs/tools does it need?
3. **Configure settings** - Customize behavior
4. **Set up evaluations** - Quality gates before output
5. **Handle errors** - Graceful failure handling

See the example agents for detailed implementation patterns.

---

## Related Documentation

- [Platform Architecture](../architecture/README.md)
- [Platform-Provided APIs](../architecture/platform-provided-apis.md)
- [Custom API Integration](../integrations/custom-api-integration.md)
