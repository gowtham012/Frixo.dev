# Environment Configuration

## Overview

This document defines the environment configuration strategy for the AI Agent Platform across development, staging, and production environments.

---

## Environment Types

| Environment | Purpose | Database | Debug |
|-------------|---------|----------|-------|
| `development` | Local development | Local PostgreSQL | Enabled |
| `test` | Automated testing | SQLite / Test DB | Disabled |
| `staging` | Pre-production testing | Staging DB | Enabled |
| `production` | Live system | Production DB | Disabled |

---

## Environment Variables

### .env.example (Root)

```bash
# ===========================================
# Application
# ===========================================
APP_ENV=development
APP_DEBUG=true
APP_NAME="Agent Platform"
APP_URL=http://localhost:3000
API_URL=http://localhost:8000

# Secret key for signing (generate with: openssl rand -hex 32)
APP_SECRET_KEY=your-secret-key-change-in-production

# ===========================================
# Database
# ===========================================
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/agent_platform
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10
DATABASE_ECHO=false

# ===========================================
# Redis
# ===========================================
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=

# ===========================================
# JWT Authentication
# ===========================================
JWT_SECRET_KEY=your-jwt-secret-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# ===========================================
# LLM Providers
# ===========================================
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=

ANTHROPIC_API_KEY=sk-ant-...

GOOGLE_API_KEY=

# Default model
DEFAULT_LLM_MODEL=gpt-4o
DEFAULT_LLM_TEMPERATURE=0.7
DEFAULT_LLM_MAX_TOKENS=4096

# ===========================================
# OAuth - Platform Apps
# ===========================================
# LinkedIn
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/v1/integrations/callback/linkedin

# Slack
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=http://localhost:8000/api/v1/integrations/callback/slack

# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/integrations/callback/google

# GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:8000/api/v1/integrations/callback/github

# ===========================================
# HashiCorp Vault
# ===========================================
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=
VAULT_NAMESPACE=

# ===========================================
# Stripe Billing
# ===========================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_TEAM_MONTHLY=price_...

# ===========================================
# Vector Database
# ===========================================
VECTOR_DB_PROVIDER=pinecone  # or weaviate
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=agent-memory

# ===========================================
# Storage
# ===========================================
STORAGE_PROVIDER=s3  # or local
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET=agent-platform-storage

# ===========================================
# Email
# ===========================================
MAIL_PROVIDER=sendgrid  # or ses, smtp
SENDGRID_API_KEY=
MAIL_FROM_ADDRESS=noreply@agentplatform.com
MAIL_FROM_NAME="Agent Platform"

# ===========================================
# Monitoring & Logging
# ===========================================
SENTRY_DSN=
SENTRY_ENVIRONMENT=development

LOG_LEVEL=INFO
LOG_FORMAT=json  # or text

# ===========================================
# Feature Flags
# ===========================================
FEATURE_MARKETPLACE_ENABLED=true
FEATURE_A2A_ENABLED=true
FEATURE_SELF_EVOLUTION_ENABLED=false

# ===========================================
# Rate Limiting
# ===========================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_DEFAULT=100  # requests per minute

# ===========================================
# Frontend (Next.js)
# ===========================================
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
NEXT_PUBLIC_APP_NAME="Agent Platform"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ===========================================
# Workers (Celery)
# ===========================================
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
CELERY_TASK_ALWAYS_EAGER=false  # Set true for testing
```

---

## Configuration Classes

### Python Settings (Pydantic)

```python
# app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # Application
    APP_ENV: str = "development"
    APP_DEBUG: bool = False
    APP_NAME: str = "Agent Platform"
    APP_SECRET_KEY: str

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_ECHO: bool = False

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # LLM
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    DEFAULT_LLM_MODEL: str = "gpt-4o"

    # OAuth
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None
    SLACK_CLIENT_ID: Optional[str] = None
    SLACK_CLIENT_SECRET: Optional[str] = None

    # Vault
    VAULT_ADDR: str = "http://localhost:8200"
    VAULT_TOKEN: Optional[str] = None

    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # Monitoring
    SENTRY_DSN: Optional[str] = None
    LOG_LEVEL: str = "INFO"

    # Feature Flags
    FEATURE_MARKETPLACE_ENABLED: bool = True
    FEATURE_A2A_ENABLED: bool = True

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def is_testing(self) -> bool:
        return self.APP_ENV == "test"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
```

### TypeScript Configuration

```typescript
// lib/config.ts

const config = {
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Agent Platform',
    env: process.env.NODE_ENV || 'development',
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  features: {
    marketplace: process.env.NEXT_PUBLIC_FEATURE_MARKETPLACE === 'true',
  },
} as const;

export default config;
```

---

## Environment-Specific Files

### Development (.env.development)

```bash
APP_ENV=development
APP_DEBUG=true
DATABASE_ECHO=true
LOG_LEVEL=DEBUG
CELERY_TASK_ALWAYS_EAGER=true
```

### Staging (.env.staging)

```bash
APP_ENV=staging
APP_DEBUG=true
LOG_LEVEL=INFO
SENTRY_ENVIRONMENT=staging
```

### Production (.env.production)

```bash
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=WARNING
SENTRY_ENVIRONMENT=production
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30
```

---

## Secret Management

### Development (Local)

Use `.env` file (never commit to git):

```bash
# .gitignore
.env
.env.local
.env.*.local
```

### Staging/Production

Use external secret management:

1. **AWS Secrets Manager**
2. **HashiCorp Vault**
3. **Kubernetes Secrets**

### Kubernetes Secrets Example

```yaml
# kubernetes/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: agent-platform
type: Opaque
stringData:
  DATABASE_URL: "postgresql://..."
  JWT_SECRET_KEY: "..."
  OPENAI_API_KEY: "sk-..."
```

```yaml
# kubernetes/deployment.yaml
spec:
  containers:
    - name: api
      envFrom:
        - secretRef:
            name: app-secrets
```

---

## Configuration Validation

### Startup Validation

```python
# app/config.py

def validate_settings(settings: Settings) -> None:
    """Validate required settings on startup."""
    errors = []

    # Required in all environments
    if not settings.APP_SECRET_KEY:
        errors.append("APP_SECRET_KEY is required")

    if not settings.JWT_SECRET_KEY:
        errors.append("JWT_SECRET_KEY is required")

    if not settings.DATABASE_URL:
        errors.append("DATABASE_URL is required")

    # Required in production
    if settings.is_production:
        if not settings.SENTRY_DSN:
            errors.append("SENTRY_DSN is required in production")

        if settings.APP_DEBUG:
            errors.append("APP_DEBUG must be False in production")

        if "localhost" in settings.DATABASE_URL:
            errors.append("Cannot use localhost DATABASE_URL in production")

    if errors:
        raise ValueError(f"Configuration errors: {', '.join(errors)}")


# Run on startup
validate_settings(settings)
```

---

## Loading Order

Environment variables are loaded in this order (later overrides earlier):

1. System environment variables
2. `.env` file
3. `.env.{APP_ENV}` file
4. `.env.local` file (for local overrides, never committed)

```python
# Load order in Pydantic
class Settings(BaseSettings):
    class Config:
        env_file = [
            ".env",
            f".env.{os.getenv('APP_ENV', 'development')}",
            ".env.local",
        ]
```

---

## Docker Environment

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: ./backend
    env_file:
      - .env
      - .env.docker
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/agent_platform
      - REDIS_URL=redis://redis:6379/0

  frontend:
    build: ./frontend
    env_file:
      - .env
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=agent_platform

  redis:
    image: redis:7-alpine
```

### .env.docker

```bash
# Docker-specific overrides
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/agent_platform
REDIS_URL=redis://redis:6379/0
```

---

## CI/CD Environment

### GitHub Actions

```yaml
# .github/workflows/ci.yml
env:
  APP_ENV: test
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
  JWT_SECRET_KEY: test-secret-key
  APP_SECRET_KEY: test-app-secret

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: pytest
```

### Production Deployment

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
        run: |
          kubectl set env deployment/api \
            APP_ENV=production \
            DATABASE_URL=${{ secrets.DATABASE_URL }} \
            JWT_SECRET_KEY=${{ secrets.JWT_SECRET_KEY }}
```

---

## Best Practices

### 1. Never Commit Secrets

```bash
# .gitignore
.env
.env.local
.env.*.local
*.pem
*.key
```

### 2. Use Different Keys Per Environment

```bash
# Development
JWT_SECRET_KEY=dev-secret-not-for-production

# Production
JWT_SECRET_KEY=randomly-generated-256-bit-key
```

### 3. Validate on Startup

Fail fast if configuration is invalid:

```python
@app.on_event("startup")
async def startup():
    validate_settings(settings)
```

### 4. Use Type-Safe Configuration

```python
# Bad
api_key = os.getenv("API_KEY")  # Returns Optional[str]

# Good
api_key = settings.API_KEY  # Type-checked, validated
```

### 5. Document All Variables

Keep `.env.example` up to date with all required variables and comments.
