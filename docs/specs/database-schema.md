# Database Schema Design

## Overview

This document defines the complete database schema for the AI Agent Platform using **PostgreSQL** with **SQLAlchemy** ORM.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Organization  │───┬───│      User       │───────│   API Key       │
└─────────────────┘   │   └─────────────────┘       └─────────────────┘
         │            │            │
         │            │            │
         ▼            │            ▼
┌─────────────────┐   │   ┌─────────────────┐       ┌─────────────────┐
│  Subscription   │   │   │     Agent       │───────│  AgentVersion   │
└─────────────────┘   │   └─────────────────┘       └─────────────────┘
         │            │            │
         │            │            ▼
         ▼            │   ┌─────────────────┐       ┌─────────────────┐
┌─────────────────┐   │   │   Execution     │───────│  ExecutionLog   │
│     Invoice     │   │   └─────────────────┘       └─────────────────┘
└─────────────────┘   │            │
                      │            ▼
                      │   ┌─────────────────┐
                      └───│   Integration   │
                          └─────────────────┘
```

---

## Core Tables

### Organizations

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,

    -- Settings
    settings JSONB DEFAULT '{}',

    -- Limits
    max_agents INTEGER DEFAULT 10,
    max_executions_per_month INTEGER DEFAULT 1000,
    max_team_members INTEGER DEFAULT 5,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_deleted_at ON organizations(deleted_at) WHERE deleted_at IS NULL;
```

### Users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMPTZ,
    password_hash VARCHAR(255),

    -- Profile
    full_name VARCHAR(255),
    avatar_url TEXT,

    -- Organization membership
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'member',  -- owner, admin, member, viewer

    -- Auth
    last_login_at TIMESTAMPTZ,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),

    -- OAuth
    google_id VARCHAR(255),
    github_id VARCHAR(255),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;
```

### Refresh Tokens

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,

    -- Device info
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    ip_address INET,
    user_agent TEXT,

    -- Validity
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at) WHERE revoked_at IS NULL;
```

### API Keys

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Key details
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(12) NOT NULL,  -- First 12 chars for lookup
    key_hash VARCHAR(255) NOT NULL,   -- SHA-256 hash of full key

    -- Permissions
    scopes TEXT[] DEFAULT '{}',       -- ['agents:read', 'agents:write', etc.]

    -- Usage limits
    rate_limit INTEGER DEFAULT 100,   -- requests per minute

    -- Validity
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_organization_id ON api_keys(organization_id);
```

---

## Agent Tables

### Agents

```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

    -- Basic info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    avatar_url TEXT,

    -- Configuration
    system_prompt TEXT NOT NULL,
    model VARCHAR(100) DEFAULT 'gpt-4o',
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 4096,

    -- Tools configuration
    tools JSONB DEFAULT '[]',

    -- Memory settings
    memory_enabled BOOLEAN DEFAULT TRUE,
    memory_type VARCHAR(50) DEFAULT 'conversation',  -- conversation, long_term, hybrid

    -- Status
    status VARCHAR(50) DEFAULT 'draft',  -- draft, active, paused, archived
    is_public BOOLEAN DEFAULT FALSE,

    -- Marketplace
    marketplace_listing_id UUID,

    -- Current version pointer
    current_version_id UUID,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    CONSTRAINT unique_agent_slug_per_org UNIQUE (organization_id, slug)
);

CREATE INDEX idx_agents_organization_id ON agents(organization_id);
CREATE INDEX idx_agents_created_by_id ON agents(created_by_id);
CREATE INDEX idx_agents_status ON agents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_agents_is_public ON agents(is_public) WHERE is_public = TRUE AND deleted_at IS NULL;
```

### Agent Versions

```sql
CREATE TABLE agent_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

    -- Version info
    version VARCHAR(50) NOT NULL,  -- semver: 1.0.0, 1.0.1, etc.
    changelog TEXT,

    -- Snapshot of configuration at this version
    system_prompt TEXT NOT NULL,
    model VARCHAR(100) NOT NULL,
    temperature DECIMAL(3,2) NOT NULL,
    max_tokens INTEGER NOT NULL,
    tools JSONB NOT NULL,

    -- Status
    is_published BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT unique_version_per_agent UNIQUE (agent_id, version)
);

CREATE INDEX idx_agent_versions_agent_id ON agent_versions(agent_id);
```

### Agent Tools

```sql
CREATE TABLE agent_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Tool definition
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,

    -- Tool type
    tool_type VARCHAR(50) NOT NULL,  -- function, api, integration, mcp

    -- Configuration
    config JSONB NOT NULL,
    -- For function tools: { "parameters": {...}, "code": "..." }
    -- For API tools: { "url": "...", "method": "...", "headers": {...} }
    -- For integration tools: { "integration_id": "...", "action": "..." }

    -- Input/Output schema
    input_schema JSONB NOT NULL,
    output_schema JSONB,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_tools_organization_id ON agent_tools(organization_id);
CREATE INDEX idx_agent_tools_tool_type ON agent_tools(tool_type);
```

---

## Execution Tables

### Executions

```sql
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    agent_version_id UUID REFERENCES agent_versions(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Execution context
    session_id UUID,  -- For conversation continuity
    parent_execution_id UUID REFERENCES executions(id),  -- For A2A calls

    -- Input/Output
    input JSONB NOT NULL,
    output JSONB,

    -- Status
    status VARCHAR(50) DEFAULT 'pending',  -- pending, running, completed, failed, cancelled
    error_code VARCHAR(100),
    error_message TEXT,

    -- Metrics
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    latency_ms INTEGER,

    -- Token usage
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,

    -- Cost tracking
    cost_usd DECIMAL(10,6) DEFAULT 0,

    -- Tool calls made
    tool_calls JSONB DEFAULT '[]',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE executions_2026_01 PARTITION OF executions
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE executions_2026_02 PARTITION OF executions
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- Continue for other months...

CREATE INDEX idx_executions_agent_id ON executions(agent_id);
CREATE INDEX idx_executions_organization_id ON executions(organization_id);
CREATE INDEX idx_executions_session_id ON executions(session_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_created_at ON executions(created_at DESC);
```

### Execution Logs (Traces)

```sql
CREATE TABLE execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,

    -- Log details
    log_type VARCHAR(50) NOT NULL,  -- llm_call, tool_call, memory_access, a2a_call
    sequence_number INTEGER NOT NULL,

    -- Content
    input JSONB,
    output JSONB,

    -- Timing
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    latency_ms INTEGER,

    -- For LLM calls
    model VARCHAR(100),
    prompt_tokens INTEGER,
    completion_tokens INTEGER,

    -- For tool calls
    tool_name VARCHAR(100),
    tool_status VARCHAR(50),  -- success, error

    -- Error info
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_execution_logs_execution_id ON execution_logs(execution_id);
CREATE INDEX idx_execution_logs_log_type ON execution_logs(log_type);
```

---

## Integration Tables

### Integrations

```sql
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Provider info
    provider VARCHAR(100) NOT NULL,  -- linkedin, slack, google, github, etc.
    provider_account_id VARCHAR(255),
    provider_account_name VARCHAR(255),

    -- OAuth tokens (encrypted in Vault, reference stored here)
    vault_path VARCHAR(500),

    -- Token metadata
    token_expires_at TIMESTAMPTZ,
    refresh_token_expires_at TIMESTAMPTZ,

    -- Scopes granted
    scopes TEXT[],

    -- Status
    status VARCHAR(50) DEFAULT 'active',  -- active, expired, revoked, error
    last_used_at TIMESTAMPTZ,
    last_error TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_integration_per_user UNIQUE (user_id, provider, provider_account_id)
);

CREATE INDEX idx_integrations_organization_id ON integrations(organization_id);
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_status ON integrations(status);
```

### Webhooks

```sql
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Webhook configuration
    url TEXT NOT NULL,
    secret VARCHAR(255) NOT NULL,

    -- Events to listen for
    events TEXT[] NOT NULL,  -- ['agent.executed', 'execution.completed', etc.]

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Delivery stats
    total_deliveries INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    last_delivery_at TIMESTAMPTZ,
    last_delivery_status VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhooks_organization_id ON webhooks(organization_id);
```

### Webhook Deliveries

```sql
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,

    -- Event info
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,

    -- Delivery info
    status VARCHAR(50) NOT NULL,  -- pending, success, failed
    response_status_code INTEGER,
    response_body TEXT,

    -- Retry info
    attempt_number INTEGER DEFAULT 1,
    next_retry_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
```

---

## Marketplace Tables

### Marketplace Listings

```sql
CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Listing details
    title VARCHAR(255) NOT NULL,
    short_description VARCHAR(500) NOT NULL,
    long_description TEXT,

    -- Categorization
    category VARCHAR(100) NOT NULL,
    tags TEXT[],

    -- Media
    icon_url TEXT,
    screenshots TEXT[],
    demo_video_url TEXT,

    -- Pricing
    pricing_model VARCHAR(50) DEFAULT 'free',  -- free, one_time, subscription, usage_based
    price_usd DECIMAL(10,2),

    -- Stats
    install_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(50) DEFAULT 'draft',  -- draft, pending_review, approved, rejected, suspended
    review_notes TEXT,

    -- Featured
    is_featured BOOLEAN DEFAULT FALSE,
    featured_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_rating ON marketplace_listings(rating_average DESC);
```

### Marketplace Installs

```sql
CREATE TABLE marketplace_installs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    installed_by_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

    -- Cloned agent reference
    cloned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

    -- Timestamps
    installed_at TIMESTAMPTZ DEFAULT NOW(),
    uninstalled_at TIMESTAMPTZ,

    CONSTRAINT unique_install_per_org UNIQUE (listing_id, organization_id)
);

CREATE INDEX idx_marketplace_installs_listing_id ON marketplace_installs(listing_id);
CREATE INDEX idx_marketplace_installs_organization_id ON marketplace_installs(organization_id);
```

### Marketplace Reviews

```sql
CREATE TABLE marketplace_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    body TEXT,

    -- Moderation
    is_verified_install BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_review_per_user UNIQUE (listing_id, user_id)
);

CREATE INDEX idx_marketplace_reviews_listing_id ON marketplace_reviews(listing_id);
CREATE INDEX idx_marketplace_reviews_rating ON marketplace_reviews(rating);
```

---

## Billing Tables

### Subscriptions

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Stripe references
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255) NOT NULL,

    -- Plan info
    plan VARCHAR(50) NOT NULL,  -- free, starter, pro, team, enterprise

    -- Status
    status VARCHAR(50) NOT NULL,  -- active, past_due, cancelled, trialing

    -- Billing period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,

    -- Trial
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,

    -- Cancellation
    cancel_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### Usage Records

```sql
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Usage metrics
    executions_count INTEGER DEFAULT 0,
    tokens_used BIGINT DEFAULT 0,
    api_calls_count INTEGER DEFAULT 0,
    storage_bytes BIGINT DEFAULT 0,

    -- Cost breakdown
    execution_cost_usd DECIMAL(10,4) DEFAULT 0,
    token_cost_usd DECIMAL(10,4) DEFAULT 0,
    storage_cost_usd DECIMAL(10,4) DEFAULT 0,
    total_cost_usd DECIMAL(10,4) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_usage_period UNIQUE (organization_id, period_start, period_end)
);

CREATE INDEX idx_usage_records_organization_id ON usage_records(organization_id);
CREATE INDEX idx_usage_records_period ON usage_records(period_start, period_end);
```

### Invoices

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),

    -- Stripe reference
    stripe_invoice_id VARCHAR(255) UNIQUE,

    -- Invoice details
    invoice_number VARCHAR(100),
    status VARCHAR(50) NOT NULL,  -- draft, open, paid, void, uncollectible

    -- Amounts
    subtotal_usd DECIMAL(10,2) NOT NULL,
    tax_usd DECIMAL(10,2) DEFAULT 0,
    total_usd DECIMAL(10,2) NOT NULL,
    amount_paid_usd DECIMAL(10,2) DEFAULT 0,
    amount_due_usd DECIMAL(10,2) NOT NULL,

    -- Dates
    invoice_date DATE NOT NULL,
    due_date DATE,
    paid_at TIMESTAMPTZ,

    -- PDF
    invoice_pdf_url TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

---

## Memory Tables

### Agent Memory

```sql
CREATE TABLE agent_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    session_id UUID,  -- NULL for long-term memory

    -- Memory content
    memory_type VARCHAR(50) NOT NULL,  -- conversation, fact, preference, task
    content TEXT NOT NULL,

    -- Vector embedding reference (stored in Pinecone)
    embedding_id VARCHAR(255),

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Relevance
    importance_score DECIMAL(3,2) DEFAULT 0.5,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_agent_memories_agent_id ON agent_memories(agent_id);
CREATE INDEX idx_agent_memories_session_id ON agent_memories(session_id);
CREATE INDEX idx_agent_memories_memory_type ON agent_memories(memory_type);
CREATE INDEX idx_agent_memories_importance ON agent_memories(importance_score DESC);
```

---

## Evaluation Tables

### Eval Suites

```sql
CREATE TABLE eval_suites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

    -- Suite info
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Configuration
    config JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eval_suites_organization_id ON eval_suites(organization_id);
CREATE INDEX idx_eval_suites_agent_id ON eval_suites(agent_id);
```

### Eval Test Cases

```sql
CREATE TABLE eval_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suite_id UUID NOT NULL REFERENCES eval_suites(id) ON DELETE CASCADE,

    -- Test case
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Input/Expected
    input JSONB NOT NULL,
    expected_output JSONB,

    -- Scoring criteria
    scoring_rubric JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eval_test_cases_suite_id ON eval_test_cases(suite_id);
```

### Eval Runs

```sql
CREATE TABLE eval_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suite_id UUID NOT NULL REFERENCES eval_suites(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    agent_version_id UUID REFERENCES agent_versions(id),

    -- Run info
    status VARCHAR(50) DEFAULT 'pending',  -- pending, running, completed, failed

    -- Results summary
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),

    -- Timestamps
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eval_runs_suite_id ON eval_runs(suite_id);
CREATE INDEX idx_eval_runs_agent_id ON eval_runs(agent_id);
```

### Eval Results

```sql
CREATE TABLE eval_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES eval_runs(id) ON DELETE CASCADE,
    test_case_id UUID NOT NULL REFERENCES eval_test_cases(id) ON DELETE CASCADE,
    execution_id UUID REFERENCES executions(id),

    -- Result
    status VARCHAR(50) NOT NULL,  -- passed, failed, error
    score DECIMAL(5,2),

    -- Details
    actual_output JSONB,
    feedback TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eval_results_run_id ON eval_results(run_id);
CREATE INDEX idx_eval_results_test_case_id ON eval_results(test_case_id);
```

---

## Audit Tables

### Audit Logs

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID,

    -- Action details
    action VARCHAR(100) NOT NULL,  -- create, update, delete, access
    resource_type VARCHAR(100) NOT NULL,  -- agent, user, integration, etc.
    resource_id UUID,

    -- Change details
    old_values JSONB,
    new_values JSONB,

    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## SQLAlchemy Models

### Base Model

```python
# app/models/base.py
from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr
import uuid

class BaseModel:
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower() + 's'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)


class SoftDeleteMixin:
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    @property
    def is_deleted(self):
        return self.deleted_at is not None
```

### User Model Example

```python
# app/models/user.py
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel, SoftDeleteMixin
from app.db import Base

class User(Base, BaseModel, SoftDeleteMixin):
    __tablename__ = 'users'

    email = Column(String(255), unique=True, nullable=False)
    email_verified_at = Column(DateTime(timezone=True))
    password_hash = Column(String(255))

    full_name = Column(String(255))
    avatar_url = Column(String)

    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'))
    role = Column(String(50), default='member')

    last_login_at = Column(DateTime(timezone=True))
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(255))

    google_id = Column(String(255))
    github_id = Column(String(255))

    is_active = Column(Boolean, default=True)

    # Relationships
    organization = relationship('Organization', back_populates='users')
    agents = relationship('Agent', back_populates='created_by')
    api_keys = relationship('APIKey', back_populates='user')
```

---

## Indexes Strategy

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| users | email | UNIQUE | Fast login lookup |
| agents | (org_id, slug) | UNIQUE | Fast agent lookup |
| executions | created_at | BTREE | Time-based queries |
| executions | agent_id | BTREE | Agent history |
| audit_logs | (resource_type, resource_id) | BTREE | Resource audit trail |

---

## Partitioning Strategy

| Table | Partition Key | Strategy | Retention |
|-------|---------------|----------|-----------|
| executions | created_at | Monthly | 12 months |
| execution_logs | created_at | Monthly | 6 months |
| webhook_deliveries | created_at | Monthly | 3 months |
| audit_logs | created_at | Monthly | 7 years |
