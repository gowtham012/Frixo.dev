# Incident Response Playbook

## Overview

This document defines the incident response procedures for the AI Agent Platform, including severity levels, escalation paths, and resolution processes.

---

## Incident Severity Levels

| Level | Name | Description | Response Time | Examples |
|-------|------|-------------|---------------|----------|
| P0 | Critical | Complete service outage | 15 min | Platform down, data breach |
| P1 | High | Major feature unavailable | 30 min | Auth broken, payments failing |
| P2 | Medium | Degraded performance | 2 hours | Slow responses, partial outage |
| P3 | Low | Minor issue | 24 hours | UI bug, minor feature broken |

---

## On-Call Structure

### Rotation Schedule

| Team | Primary | Secondary | Coverage |
|------|---------|-----------|----------|
| Platform | Engineer A | Engineer B | 24/7 |
| Infrastructure | SRE A | SRE B | 24/7 |
| Security | Security Lead | Security Engineer | 24/7 |

### Escalation Path

```
┌──────────────────────────────────────────────────────────────────┐
│  Alert Triggered                                                  │
└─────────────────────────────┬────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Primary On-Call (5 min)                                         │
└─────────────────────────────┬────────────────────────────────────┘
                              ▼ (no response)
┌──────────────────────────────────────────────────────────────────┐
│  Secondary On-Call (10 min)                                      │
└─────────────────────────────┬────────────────────────────────────┘
                              ▼ (no response or P0)
┌──────────────────────────────────────────────────────────────────┐
│  Team Lead (15 min)                                              │
└─────────────────────────────┬────────────────────────────────────┘
                              ▼ (P0 or extended outage)
┌──────────────────────────────────────────────────────────────────┐
│  Engineering Manager + CTO                                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Incident Response Process

### 1. Detection

**Automated:**
- Prometheus/Grafana alerts
- Error rate spikes
- Health check failures
- Customer reports via support

**Manual:**
- Team member observation
- Customer complaints
- Social media monitoring

### 2. Triage

```
┌─────────────────────────────────────────────────────────────────────┐
│  TRIAGE CHECKLIST                                                   │
├─────────────────────────────────────────────────────────────────────┤
│  □ Confirm the incident is real (not false positive)               │
│  □ Determine severity level (P0-P3)                                │
│  □ Identify affected services/users                                │
│  □ Check for related alerts                                        │
│  □ Document initial findings                                       │
│  □ Notify appropriate team members                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Communication

**Internal:**
- Slack: #incident-response channel
- Create incident ticket in Linear
- Update status page

**External (P0/P1):**
- Update status.agentplatform.com
- Send email to affected users (if significant)
- Prepare customer support responses

### 4. Resolution

```
┌─────────────────────────────────────────────────────────────────────┐
│  RESOLUTION STEPS                                                   │
├─────────────────────────────────────────────────────────────────────┤
│  1. Identify root cause                                            │
│  2. Implement fix or workaround                                    │
│  3. Verify fix in staging (if possible)                           │
│  4. Deploy to production                                           │
│  5. Monitor for resolution                                         │
│  6. Confirm with affected users                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 5. Post-Incident

- Incident report within 48 hours
- Blameless post-mortem meeting
- Action items tracked and assigned
- Update runbooks if needed

---

## Runbooks

### API Service Down

**Symptoms:**
- 5xx errors increasing
- Health checks failing
- No responses from API

**Investigation:**

```bash
# Check pod status
kubectl get pods -n agent-platform

# Check pod logs
kubectl logs -f deployment/api -n agent-platform --tail=100

# Check recent deployments
kubectl rollout history deployment/api -n agent-platform

# Check resource usage
kubectl top pods -n agent-platform
```

**Resolution:**

1. **If recent deployment:** Rollback
   ```bash
   kubectl rollout undo deployment/api -n agent-platform
   ```

2. **If resource exhaustion:** Scale up
   ```bash
   kubectl scale deployment/api --replicas=5 -n agent-platform
   ```

3. **If database issue:** Check DB connection
   ```bash
   kubectl exec -it deployment/api -- python -c "from app.db import check_connection; check_connection()"
   ```

---

### Database Connection Issues

**Symptoms:**
- "Connection refused" errors
- Timeouts on queries
- Connection pool exhausted

**Investigation:**

```bash
# Check database status
aws rds describe-db-instances --db-instance-identifier agent-platform-prod

# Check connections
psql -h $DB_HOST -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
psql -h $DB_HOST -U postgres -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC LIMIT 10;"
```

**Resolution:**

1. **Connection pool exhausted:** Restart API pods
   ```bash
   kubectl rollout restart deployment/api -n agent-platform
   ```

2. **Database overloaded:** Kill long-running queries
   ```sql
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE duration > interval '5 minutes' AND state != 'idle';
   ```

3. **Database down:** Check AWS RDS console, initiate failover if needed

---

### High Error Rate

**Symptoms:**
- Error rate > 5%
- Increased 5xx responses
- Alert: HighErrorRate

**Investigation:**

```bash
# Check error logs
kubectl logs deployment/api -n agent-platform | grep ERROR | tail -100

# Check error distribution
curl -s localhost:9090/api/v1/query --data-urlencode 'query=sum by (status) (rate(http_requests_total[5m]))' | jq

# Check specific endpoints
curl -s localhost:9090/api/v1/query --data-urlencode 'query=topk(10, rate(http_requests_total{status=~"5.."}[5m]))' | jq
```

**Resolution:**

1. **Single endpoint:** Investigate specific service
2. **Upstream dependency:** Check external service status
3. **Resource issue:** Scale or restart

---

### Agent Execution Failures

**Symptoms:**
- Agent execution success rate < 95%
- Increased execution errors
- User complaints

**Investigation:**

```bash
# Check execution logs
kubectl logs deployment/agent-runtime -n agent-platform | grep "execution failed" | tail -50

# Check LLM provider status
curl -s https://status.openai.com/api/v2/status.json | jq

# Check specific agent
curl -s "http://localhost:8000/internal/agents/{agent_id}/health"
```

**Resolution:**

1. **LLM provider issue:** Enable fallback provider
   ```bash
   kubectl set env deployment/agent-runtime FALLBACK_LLM_ENABLED=true
   ```

2. **Tool failures:** Check integration status
3. **Timeout issues:** Increase timeout or optimize

---

### Security Incident

**Symptoms:**
- Unusual access patterns
- Unauthorized data access
- Security alert triggered

**IMMEDIATE ACTIONS:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  SECURITY INCIDENT - IMMEDIATE ACTIONS                              │
├─────────────────────────────────────────────────────────────────────┤
│  1. □ Alert Security Team Lead immediately                         │
│  2. □ Do NOT communicate externally without approval               │
│  3. □ Preserve all logs and evidence                               │
│  4. □ Document timeline of events                                  │
│  5. □ Identify affected systems/data                               │
│  6. □ Consider isolating affected systems                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Investigation:**

```bash
# Check audit logs
kubectl logs deployment/api -n agent-platform | grep "audit" | tail -1000

# Check for unusual patterns
psql -h $DB_HOST -U postgres -c "SELECT user_id, count(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL '1 hour' GROUP BY user_id ORDER BY count DESC LIMIT 20;"

# Check API key usage
psql -h $DB_HOST -U postgres -c "SELECT api_key_id, count(*) FROM request_logs WHERE created_at > NOW() - INTERVAL '1 hour' GROUP BY api_key_id ORDER BY count DESC LIMIT 20;"
```

**Containment:**

1. **Compromised credentials:** Revoke immediately
   ```sql
   UPDATE api_keys SET revoked_at = NOW() WHERE id = '{key_id}';
   UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = '{user_id}';
   ```

2. **Suspicious user:** Disable account
   ```sql
   UPDATE users SET is_active = FALSE WHERE id = '{user_id}';
   ```

---

## Communication Templates

### Status Page Update

```markdown
**Investigating increased error rates**

We are currently investigating reports of increased error rates affecting the API.
Our engineering team is actively working on this issue.

**Impact:** Some API requests may fail or experience delays.

**Next update:** In 30 minutes or when we have more information.
```

### Customer Email (Major Incident)

```markdown
Subject: [Agent Platform] Service Incident - {Date}

Dear Customer,

We want to inform you of a service incident that occurred on {date}.

**What happened:**
{Brief description of the incident}

**Impact:**
{What users experienced}

**Resolution:**
{How we fixed it}

**Prevention:**
{Steps we're taking to prevent recurrence}

We apologize for any inconvenience this may have caused. If you have questions, please contact support@agentplatform.com.

Best regards,
The Agent Platform Team
```

---

## Post-Incident Review

### Incident Report Template

```markdown
# Incident Report: {Title}

**Date:** {Date}
**Duration:** {Start time} - {End time}
**Severity:** P{0-3}
**Author:** {Name}

## Summary
{2-3 sentence summary}

## Timeline
- HH:MM - {Event}
- HH:MM - {Event}
- HH:MM - {Event}

## Root Cause
{Detailed explanation of what caused the incident}

## Impact
- Users affected: {number}
- Revenue impact: ${amount}
- SLA impact: {details}

## Resolution
{How the incident was resolved}

## Lessons Learned
- What went well
- What could be improved

## Action Items
| Item | Owner | Due Date | Status |
|------|-------|----------|--------|
| {Action} | {Name} | {Date} | Open |

## Prevention
{Steps to prevent recurrence}
```

---

## Tools and Access

### Required Access

| System | Purpose | Access Level |
|--------|---------|--------------|
| AWS Console | Infrastructure | Admin |
| Kubernetes | Deployments | Cluster Admin |
| Grafana | Monitoring | Editor |
| PagerDuty | Alerting | User |
| Slack | Communication | Member |
| GitHub | Code | Write |

### Useful Commands

```bash
# Quick health check
curl https://api.agentplatform.com/health

# Check all service status
kubectl get pods -A | grep -v Running

# View recent errors
kubectl logs -l app=api --since=10m | grep -i error

# Check metrics
curl -s localhost:9090/api/v1/query --data-urlencode 'query=up' | jq
```

---

## Contact List

| Role | Name | Phone | Email |
|------|------|-------|-------|
| CTO | {Name} | {Phone} | {Email} |
| Engineering Manager | {Name} | {Phone} | {Email} |
| Platform Lead | {Name} | {Phone} | {Email} |
| SRE Lead | {Name} | {Phone} | {Email} |
| Security Lead | {Name} | {Phone} | {Email} |
