# Project Structure

## Overview

This document defines the monorepo structure for the AI Agent Platform. We use a monorepo approach to share code, ensure consistency, and simplify deployment.

---

## Repository Layout

```
agent-platform/
│
├── README.md
├── LICENSE
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docker-compose.prod.yml
├── Makefile
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-staging.yml
│   │   └── deploy-production.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── CODEOWNERS
│
├── docs/
│   ├── README.md
│   ├── plans/
│   ├── architecture/
│   ├── specs/
│   └── api/
│       └── openapi.yaml
│
├── backend/
│   ├── README.md
│   ├── pyproject.toml
│   ├── poetry.lock
│   ├── Dockerfile
│   ├── alembic.ini
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app entry point
│   │   ├── config.py                  # Settings & configuration
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py                # Shared dependencies
│   │   │   ├── router.py              # Main API router
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── organizations.py
│   │   │       ├── agents.py
│   │   │       ├── executions.py
│   │   │       ├── integrations.py
│   │   │       ├── marketplace.py
│   │   │       ├── billing.py
│   │   │       └── webhooks.py
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py            # JWT, hashing, encryption
│   │   │   ├── exceptions.py          # Custom exceptions
│   │   │   ├── middleware.py          # Custom middleware
│   │   │   └── rate_limit.py          # Rate limiting logic
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Base model class
│   │   │   ├── user.py
│   │   │   ├── organization.py
│   │   │   ├── agent.py
│   │   │   ├── execution.py
│   │   │   ├── integration.py
│   │   │   ├── marketplace.py
│   │   │   └── billing.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Base Pydantic schemas
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── organization.py
│   │   │   ├── agent.py
│   │   │   ├── execution.py
│   │   │   ├── integration.py
│   │   │   ├── marketplace.py
│   │   │   └── billing.py
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── agent_service.py
│   │   │   ├── execution_service.py
│   │   │   ├── integration_service.py
│   │   │   ├── marketplace_service.py
│   │   │   ├── billing_service.py
│   │   │   └── webhook_service.py
│   │   │
│   │   ├── repositories/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Base repository
│   │   │   ├── user_repository.py
│   │   │   ├── agent_repository.py
│   │   │   └── ...
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── logging.py
│   │       ├── pagination.py
│   │       └── validators.py
│   │
│   ├── migrations/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       ├── 001_initial.py
│   │       └── ...
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py                # Pytest fixtures
│   │   ├── unit/
│   │   │   ├── __init__.py
│   │   │   ├── test_auth_service.py
│   │   │   ├── test_agent_service.py
│   │   │   └── ...
│   │   ├── integration/
│   │   │   ├── __init__.py
│   │   │   ├── test_auth_api.py
│   │   │   ├── test_agents_api.py
│   │   │   └── ...
│   │   └── fixtures/
│   │       ├── users.py
│   │       ├── agents.py
│   │       └── ...
│   │
│   └── scripts/
│       ├── seed_db.py
│       └── create_admin.py
│
├── agent-runtime/
│   ├── README.md
│   ├── pyproject.toml
│   ├── poetry.lock
│   ├── Dockerfile
│   │
│   ├── runtime/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app for runtime
│   │   ├── config.py
│   │   │
│   │   ├── executor/
│   │   │   ├── __init__.py
│   │   │   ├── agent_executor.py      # Main execution engine
│   │   │   ├── tool_executor.py       # Tool execution
│   │   │   ├── memory_manager.py      # Agent memory
│   │   │   └── sandbox.py             # Sandboxed execution
│   │   │
│   │   ├── llm/
│   │   │   ├── __init__.py
│   │   │   ├── gateway.py             # Multi-provider gateway
│   │   │   ├── providers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── openai.py
│   │   │   │   ├── anthropic.py
│   │   │   │   └── google.py
│   │   │   └── streaming.py           # Streaming support
│   │   │
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Base tool class
│   │   │   ├── registry.py            # Tool registry
│   │   │   ├── builtin/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── web_search.py
│   │   │   │   ├── calculator.py
│   │   │   │   └── code_executor.py
│   │   │   └── integrations/
│   │   │       ├── __init__.py
│   │   │       ├── linkedin.py
│   │   │       ├── slack.py
│   │   │       └── google.py
│   │   │
│   │   └── testing/
│   │       ├── __init__.py
│   │       ├── engine.py              # Test execution engine
│   │       ├── generators.py          # Auto-generate tests
│   │       └── reporters.py           # Test result reporters
│   │
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_executor.py
│       ├── test_tools.py
│       └── test_llm_gateway.py
│
├── integration-proxy/
│   ├── README.md
│   ├── pyproject.toml
│   ├── Dockerfile
│   │
│   ├── proxy/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   │
│   │   ├── connectors/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Base connector
│   │   │   ├── linkedin.py
│   │   │   ├── slack.py
│   │   │   ├── google_calendar.py
│   │   │   ├── google_drive.py
│   │   │   ├── notion.py
│   │   │   └── github.py
│   │   │
│   │   ├── oauth/
│   │   │   ├── __init__.py
│   │   │   ├── handler.py             # OAuth flow handler
│   │   │   └── providers.py           # OAuth provider configs
│   │   │
│   │   ├── vault/
│   │   │   ├── __init__.py
│   │   │   └── client.py              # Vault client
│   │   │
│   │   └── audit/
│   │       ├── __init__.py
│   │       └── logger.py              # Audit logging
│   │
│   └── tests/
│       └── ...
│
├── worker/
│   ├── README.md
│   ├── pyproject.toml
│   ├── Dockerfile
│   │
│   ├── worker/
│   │   ├── __init__.py
│   │   ├── celery_app.py              # Celery configuration
│   │   │
│   │   ├── tasks/
│   │   │   ├── __init__.py
│   │   │   ├── execution.py           # Agent execution tasks
│   │   │   ├── testing.py             # Test execution tasks
│   │   │   ├── integration.py         # Integration tasks
│   │   │   ├── notification.py        # Notification tasks
│   │   │   └── cleanup.py             # Cleanup tasks
│   │   │
│   │   └── schedules/
│   │       ├── __init__.py
│   │       └── agent_schedules.py     # Scheduled agent runs
│   │
│   └── tests/
│       └── ...
│
├── frontend/
│   ├── README.md
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── .eslintrc.js
│   ├── Dockerfile
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   └── images/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── globals.css
│   │   │   │
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx         # Dashboard layout
│   │   │   │   ├── page.tsx           # Dashboard home
│   │   │   │   │
│   │   │   │   ├── agents/
│   │   │   │   │   ├── page.tsx       # Agent list
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx   # Create agent
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx   # Agent detail
│   │   │   │   │       ├── edit/
│   │   │   │   │       │   └── page.tsx
│   │   │   │   │       ├── executions/
│   │   │   │   │       │   └── page.tsx
│   │   │   │   │       └── tests/
│   │   │   │   │           └── page.tsx
│   │   │   │   │
│   │   │   │   ├── marketplace/
│   │   │   │   │   ├── page.tsx       # Browse marketplace
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx   # Listing detail
│   │   │   │   │   └── sell/
│   │   │   │   │       └── page.tsx   # Create listing
│   │   │   │   │
│   │   │   │   ├── integrations/
│   │   │   │   │   ├── page.tsx       # Integration list
│   │   │   │   │   └── callback/
│   │   │   │   │       └── page.tsx   # OAuth callback
│   │   │   │   │
│   │   │   │   ├── settings/
│   │   │   │   │   ├── page.tsx       # Settings overview
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── organization/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── billing/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── api-keys/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   └── analytics/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── api/
│   │   │       └── ...                # API routes if needed
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                    # Shadcn components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── header.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   └── footer.tsx
│   │   │   │
│   │   │   ├── agents/
│   │   │   │   ├── agent-card.tsx
│   │   │   │   ├── agent-form.tsx
│   │   │   │   ├── agent-config-editor.tsx
│   │   │   │   └── execution-viewer.tsx
│   │   │   │
│   │   │   ├── marketplace/
│   │   │   │   ├── listing-card.tsx
│   │   │   │   └── purchase-modal.tsx
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── loading.tsx
│   │   │       ├── error-boundary.tsx
│   │   │       └── empty-state.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                 # API client
│   │   │   ├── auth.ts                # Auth utilities
│   │   │   ├── utils.ts               # General utilities
│   │   │   └── constants.ts           # Constants
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-agents.ts
│   │   │   ├── use-auth.ts
│   │   │   ├── use-executions.ts
│   │   │   └── use-socket.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── auth-store.ts
│   │   │   └── app-store.ts
│   │   │
│   │   └── types/
│   │       ├── agent.ts
│   │       ├── user.ts
│   │       ├── execution.ts
│   │       └── api.ts
│   │
│   └── tests/
│       ├── components/
│       └── e2e/
│
├── sdk/
│   ├── python/
│   │   ├── README.md
│   │   ├── pyproject.toml
│   │   ├── agent_platform/
│   │   │   ├── __init__.py
│   │   │   ├── client.py              # Main client
│   │   │   ├── agent.py               # Agent class
│   │   │   ├── tools.py               # Tool definitions
│   │   │   ├── memory.py              # Memory management
│   │   │   └── types.py               # Type definitions
│   │   └── tests/
│   │       └── ...
│   │
│   └── typescript/
│       ├── README.md
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── client.ts
│       │   ├── agent.ts
│       │   ├── tools.ts
│       │   ├── memory.ts
│       │   └── types.ts
│       └── tests/
│           └── ...
│
├── infrastructure/
│   ├── docker/
│   │   ├── backend.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   ├── worker.Dockerfile
│   │   └── nginx.conf
│   │
│   ├── kubernetes/
│   │   ├── base/
│   │   │   ├── namespace.yaml
│   │   │   ├── configmap.yaml
│   │   │   ├── secrets.yaml
│   │   │   └── services/
│   │   │       ├── backend.yaml
│   │   │       ├── frontend.yaml
│   │   │       ├── worker.yaml
│   │   │       └── redis.yaml
│   │   │
│   │   ├── staging/
│   │   │   └── kustomization.yaml
│   │   │
│   │   └── production/
│   │       └── kustomization.yaml
│   │
│   └── terraform/
│       ├── modules/
│       │   ├── vpc/
│       │   ├── eks/
│       │   ├── rds/
│       │   ├── elasticache/
│       │   └── s3/
│       │
│       ├── environments/
│       │   ├── staging/
│       │   │   ├── main.tf
│       │   │   ├── variables.tf
│       │   │   └── outputs.tf
│       │   │
│       │   └── production/
│       │       ├── main.tf
│       │       ├── variables.tf
│       │       └── outputs.tf
│       │
│       └── backend.tf
│
├── scripts/
│   ├── setup.sh                       # Initial setup script
│   ├── dev.sh                         # Start dev environment
│   ├── test.sh                        # Run all tests
│   ├── lint.sh                        # Run linters
│   ├── build.sh                       # Build all services
│   └── deploy.sh                      # Deploy to environment
│
└── tools/
    ├── pre-commit-config.yaml
    └── commitlint.config.js
```

---

## Service Descriptions

### backend/
The main API service handling all user-facing endpoints.

**Responsibilities:**
- User authentication & authorization
- Agent CRUD operations
- Marketplace operations
- Billing & subscriptions
- Webhook management

**Dependencies:**
- PostgreSQL (primary database)
- Redis (caching, rate limiting)

### agent-runtime/
The service responsible for executing agents.

**Responsibilities:**
- Agent execution engine
- LLM provider integration
- Tool execution
- Memory management
- Sandboxed execution

**Dependencies:**
- Redis (task queue)
- Vector database (agent memory)
- LLM APIs (OpenAI, Anthropic, etc.)

### integration-proxy/
Secure proxy for third-party API access.

**Responsibilities:**
- OAuth flow handling
- Credential management
- API proxying
- Audit logging

**Dependencies:**
- HashiCorp Vault (credentials)
- PostgreSQL (integration configs)

### worker/
Background task processor.

**Responsibilities:**
- Scheduled agent executions
- Test execution
- Notifications
- Cleanup tasks

**Dependencies:**
- Redis (Celery broker)
- PostgreSQL

### frontend/
Next.js web application.

**Responsibilities:**
- User dashboard
- Agent builder UI
- Marketplace UI
- Settings & billing

### sdk/
Client libraries for developers.

**Python SDK:**
- Agent class for building agents
- Tool definitions
- Memory management

**TypeScript SDK:**
- Same capabilities for Node.js/browser

---

## Naming Conventions

### Files & Directories

| Type | Convention | Example |
|------|-----------|---------|
| Python modules | snake_case | `agent_service.py` |
| Python classes | PascalCase | `AgentService` |
| TypeScript files | kebab-case | `agent-card.tsx` |
| React components | PascalCase | `AgentCard` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Database tables | snake_case (plural) | `agents`, `users` |
| API endpoints | kebab-case | `/api/v1/agent-executions` |

### Git Branches

| Type | Convention | Example |
|------|-----------|---------|
| Feature | `feature/<ticket>-<description>` | `feature/AP-123-add-slack-integration` |
| Bugfix | `bugfix/<ticket>-<description>` | `bugfix/AP-456-fix-token-refresh` |
| Hotfix | `hotfix/<ticket>-<description>` | `hotfix/AP-789-critical-security-fix` |
| Release | `release/v<version>` | `release/v1.2.0` |

---

## Package Management

### Python (Poetry)

```toml
# pyproject.toml
[tool.poetry]
name = "agent-platform-backend"
version = "0.1.0"
python = "^3.11"

[tool.poetry.dependencies]
fastapi = "^0.109.0"
uvicorn = "^0.27.0"
sqlalchemy = "^2.0.0"
alembic = "^1.13.0"
pydantic = "^2.5.0"
redis = "^5.0.0"
celery = "^5.3.0"
httpx = "^0.26.0"
python-jose = "^3.3.0"
passlib = "^1.7.4"
structlog = "^24.1.0"
prometheus-client = "^0.19.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.23.0"
pytest-cov = "^4.1.0"
ruff = "^0.1.0"
black = "^24.1.0"
mypy = "^1.8.0"
```

### TypeScript (pnpm)

```json
// package.json
{
  "name": "agent-platform-frontend",
  "version": "0.1.0",
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.5.0",
    "socket.io-client": "^4.7.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.11.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.1.0",
    "prettier": "^3.2.0"
  }
}
```

---

## Environment Files

### Root .env.example
```bash
# Application
APP_ENV=development
APP_DEBUG=true
APP_SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agent_platform

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# OAuth (Platform-owned apps)
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Vault
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry
SENTRY_DSN=

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

---

## Makefile Commands

```makefile
.PHONY: help setup dev test lint build deploy

help:
	@echo "Available commands:"
	@echo "  make setup    - Initial project setup"
	@echo "  make dev      - Start development environment"
	@echo "  make test     - Run all tests"
	@echo "  make lint     - Run linters"
	@echo "  make build    - Build all services"
	@echo "  make deploy   - Deploy to staging"

setup:
	@echo "Setting up development environment..."
	cp .env.example .env
	cd backend && poetry install
	cd frontend && pnpm install
	docker-compose up -d postgres redis
	cd backend && poetry run alembic upgrade head

dev:
	@echo "Starting development servers..."
	docker-compose up -d postgres redis
	(cd backend && poetry run uvicorn app.main:app --reload --port 8000) &
	(cd frontend && pnpm dev) &
	(cd worker && poetry run celery -A worker.celery_app worker --loglevel=info) &

test:
	@echo "Running tests..."
	cd backend && poetry run pytest --cov=app
	cd frontend && pnpm test
	cd sdk/python && poetry run pytest
	cd sdk/typescript && pnpm test

lint:
	@echo "Running linters..."
	cd backend && poetry run ruff check . && poetry run black --check .
	cd frontend && pnpm lint

build:
	@echo "Building Docker images..."
	docker build -t agent-platform/backend -f infrastructure/docker/backend.Dockerfile .
	docker build -t agent-platform/frontend -f infrastructure/docker/frontend.Dockerfile .
	docker build -t agent-platform/worker -f infrastructure/docker/worker.Dockerfile .

deploy-staging:
	@echo "Deploying to staging..."
	kubectl apply -k infrastructure/kubernetes/staging/

deploy-production:
	@echo "Deploying to production..."
	kubectl apply -k infrastructure/kubernetes/production/
```

---

## Import Structure

### Python Import Order

```python
# 1. Standard library
import os
import sys
from datetime import datetime
from typing import Optional, List

# 2. Third-party packages
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import structlog

# 3. Local application imports
from app.core.config import settings
from app.models.user import User
from app.services.auth_service import AuthService
```

### TypeScript Import Order

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party packages
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';

// 3. Internal components
import { Button } from '@/components/ui/button';
import { AgentCard } from '@/components/agents/agent-card';

// 4. Internal utilities
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

// 5. Types
import type { Agent } from '@/types/agent';
```

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/agent-platform.git
cd agent-platform

# Setup (one-time)
make setup

# Start development
make dev

# Access services
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```
