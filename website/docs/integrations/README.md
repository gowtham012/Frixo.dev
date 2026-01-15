# Integrations

This section covers how to integrate external services and APIs with the Agent Platform.

## Integration Types

### Platform-Provided Integrations
Pre-built integrations managed by the platform. No API keys or setup required.

| Category | Services |
|----------|----------|
| **News & Search** | NewsAPI, Bing News, Google News |
| **LLM** | OpenAI, Anthropic, Google AI |
| **Social Media** | LinkedIn, Twitter/X |
| **Calendar** | Google Calendar, Outlook |
| **Email** | Gmail, Outlook |
| **CRM** | Salesforce, HubSpot |
| **Communication** | Slack, Microsoft Teams |

[Learn more about Platform-Provided APIs →](../architecture/platform-provided-apis.md)

---

### Custom Integrations
Connect your own APIs that the platform doesn't natively support.

**Supported:**
- REST APIs
- GraphQL APIs
- Webhook endpoints
- Internal/private APIs (via tunnel)

**Authentication Types:**
- API Key
- Bearer Token
- Basic Auth
- OAuth 2.0
- Custom Headers

[Learn more about Custom API Integration →](./custom-api-integration.md)

---

## Quick Links

### By Use Case

| Use Case | Integrations |
|----------|-------------|
| **Social Posting** | LinkedIn, Twitter/X |
| **Meeting Prep** | Calendar, LinkedIn, Gmail, CRM |
| **Research** | News APIs, Web Search |
| **Customer Support** | CRM, Email, Slack |
| **Content Generation** | LLM APIs, News APIs |

### By Integration Type

- [OAuth-based Integrations](./oauth-integration.md)
- [API Key Integrations](./api-key-integration.md)
- [Webhook Integrations](./webhook-integration.md)
- [Custom API Integration](./custom-api-integration.md)
- [Internal API Tunnels](./tunnel-setup.md)

---

## Setting Up Integrations

### Step 1: Connect in Dashboard

```
Dashboard > Settings > Integrations
```

### Step 2: Authorize Access

For OAuth integrations (LinkedIn, Gmail, etc.):
1. Click "Connect"
2. Authorize in popup
3. Platform stores tokens securely

For API key integrations:
1. Click "Connect"
2. Enter API key
3. Platform encrypts and stores

### Step 3: Use in Agents

```python
# Platform integrations
result = await platform.integrations.linkedin.create_post({
    content: "Hello world!"
})

# Custom integrations
result = await platform.custom.my_crm.get_customer({
    customer_id: "123"
})
```

---

## Security

All integrations follow strict security practices:

| Feature | Description |
|---------|-------------|
| **Encrypted Storage** | All credentials encrypted at rest |
| **Token Refresh** | OAuth tokens auto-refreshed |
| **Scoped Access** | Minimum required permissions |
| **Audit Logging** | All API calls logged |
| **Agent Isolation** | Agents never see raw credentials |

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Authentication failed" | Reconnect the integration |
| "Token expired" | Platform should auto-refresh; if not, reconnect |
| "Rate limited" | Wait or upgrade plan for higher limits |
| "Connection timeout" | Check API availability |
| "Permission denied" | Check required scopes are granted |

### Getting Help

- Check integration status in Dashboard
- Review API logs for error details
- Contact support for persistent issues

---

## Related Documentation

- [Platform Architecture](../architecture/README.md)
- [Agent Examples](../agents/README.md)
- [Security & Credentials](../security/credentials-management.md)
