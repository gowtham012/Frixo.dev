# CI/CD Pipeline

## Overview

This document defines the CI/CD pipeline for the AI Agent Platform using **GitHub Actions** for automation and **ArgoCD** for GitOps-based deployments.

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Actions CI                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │  Lint   │→ │  Test   │→ │  Build  │→ │  Push   │            │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Container Registry                          │
│                    (GitHub Container Registry)                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ArgoCD                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Staging   │→ │   Canary    │→ │ Production  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## GitHub Actions Workflows

### Main CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  PYTHON_VERSION: "3.11"
  NODE_VERSION: "20"
  POETRY_VERSION: "1.7.1"

jobs:
  # ─────────────────────────────────────────────────────────────
  # Detect Changes
  # ─────────────────────────────────────────────────────────────
  changes:
    runs-on: ubuntu-latest
    outputs:
      backend: ${{ steps.filter.outputs.backend }}
      frontend: ${{ steps.filter.outputs.frontend }}
      agent-runtime: ${{ steps.filter.outputs.agent-runtime }}
      infrastructure: ${{ steps.filter.outputs.infrastructure }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            backend:
              - 'backend/**'
              - 'pyproject.toml'
            frontend:
              - 'frontend/**'
              - 'package.json'
            agent-runtime:
              - 'agent-runtime/**'
            infrastructure:
              - 'infrastructure/**'
              - 'kubernetes/**'

  # ─────────────────────────────────────────────────────────────
  # Backend Jobs
  # ─────────────────────────────────────────────────────────────
  backend-lint:
    needs: changes
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install Poetry
        uses: snok/install-poetry@v1
        with:
          version: ${{ env.POETRY_VERSION }}
          virtualenvs-create: true
          virtualenvs-in-project: true

      - name: Load cached venv
        uses: actions/cache@v4
        with:
          path: .venv
          key: venv-${{ runner.os }}-${{ hashFiles('**/poetry.lock') }}

      - name: Install dependencies
        run: poetry install --no-interaction

      - name: Run Ruff linter
        run: poetry run ruff check backend/

      - name: Run Ruff formatter check
        run: poetry run ruff format --check backend/

      - name: Run MyPy
        run: poetry run mypy backend/

  backend-test:
    needs: [changes, backend-lint]
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      APP_ENV: test
      DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost:5432/test_db
      REDIS_URL: redis://localhost:6379/0
      JWT_SECRET_KEY: test-jwt-secret-key-for-ci
      APP_SECRET_KEY: test-app-secret-key-for-ci

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install Poetry
        uses: snok/install-poetry@v1
        with:
          version: ${{ env.POETRY_VERSION }}

      - name: Load cached venv
        uses: actions/cache@v4
        with:
          path: .venv
          key: venv-${{ runner.os }}-${{ hashFiles('**/poetry.lock') }}

      - name: Install dependencies
        run: poetry install --no-interaction

      - name: Run database migrations
        run: poetry run alembic upgrade head

      - name: Run tests with coverage
        run: |
          poetry run pytest \
            --cov=backend/app \
            --cov-report=xml \
            --cov-report=html \
            --junitxml=junit.xml \
            -v

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage.xml
          flags: backend
          token: ${{ secrets.CODECOV_TOKEN }}

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: backend-test-results
          path: |
            junit.xml
            htmlcov/

  backend-security:
    needs: changes
    if: needs.changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install Poetry
        uses: snok/install-poetry@v1

      - name: Install dependencies
        run: poetry install --no-interaction

      - name: Run Bandit security scan
        run: poetry run bandit -r backend/app -f json -o bandit-report.json || true

      - name: Upload Bandit report
        uses: actions/upload-artifact@v4
        with:
          name: bandit-security-report
          path: bandit-report.json

      - name: Run Safety check
        run: poetry run safety check --json --output safety-report.json || true

      - name: Upload Safety report
        uses: actions/upload-artifact@v4
        with:
          name: safety-dependency-report
          path: safety-report.json

  # ─────────────────────────────────────────────────────────────
  # Frontend Jobs
  # ─────────────────────────────────────────────────────────────
  frontend-lint:
    needs: changes
    if: needs.changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: frontend/pnpm-lock.yaml

      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        working-directory: frontend

      - name: Run ESLint
        run: pnpm lint
        working-directory: frontend

      - name: Run Prettier check
        run: pnpm format:check
        working-directory: frontend

      - name: Run TypeScript check
        run: pnpm type-check
        working-directory: frontend

  frontend-test:
    needs: [changes, frontend-lint]
    if: needs.changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: frontend/pnpm-lock.yaml

      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        working-directory: frontend

      - name: Run unit tests
        run: pnpm test:coverage
        working-directory: frontend

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./frontend/coverage/lcov.info
          flags: frontend
          token: ${{ secrets.CODECOV_TOKEN }}

  frontend-build:
    needs: [changes, frontend-test]
    if: needs.changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
          cache-dependency-path: frontend/pnpm-lock.yaml

      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        working-directory: frontend

      - name: Build
        run: pnpm build
        working-directory: frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ vars.API_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: frontend/.next

  # ─────────────────────────────────────────────────────────────
  # E2E Tests
  # ─────────────────────────────────────────────────────────────
  e2e-tests:
    needs: [backend-test, frontend-build]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: e2e_db
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install Poetry
        uses: snok/install-poetry@v1

      - name: Install backend dependencies
        run: poetry install --no-interaction

      - name: Install frontend dependencies
        run: pnpm install --frozen-lockfile
        working-directory: frontend

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
        working-directory: frontend

      - name: Start backend server
        run: |
          poetry run alembic upgrade head
          poetry run uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
        env:
          APP_ENV: test
          DATABASE_URL: postgresql+asyncpg://postgres:postgres@localhost:5432/e2e_db
          REDIS_URL: redis://localhost:6379/0
          JWT_SECRET_KEY: e2e-test-secret
          APP_SECRET_KEY: e2e-app-secret

      - name: Wait for backend
        run: |
          for i in {1..30}; do
            curl -s http://localhost:8000/health && break
            sleep 2
          done

      - name: Start frontend server
        run: pnpm build && pnpm start &
        working-directory: frontend
        env:
          NEXT_PUBLIC_API_URL: http://localhost:8000

      - name: Wait for frontend
        run: |
          for i in {1..30}; do
            curl -s http://localhost:3000 && break
            sleep 2
          done

      - name: Run Playwright tests
        run: pnpm test:e2e
        working-directory: frontend
        env:
          BASE_URL: http://localhost:3000
          API_URL: http://localhost:8000

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

### Docker Build and Push Workflow

```yaml
# .github/workflows/docker-build.yml
name: Build and Push Docker Images

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ${{ github.repository }}

jobs:
  build-backend:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/backend
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix=

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./backend/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            BUILD_VERSION=${{ github.sha }}
            BUILD_DATE=${{ github.event.head_commit.timestamp }}

  build-agent-runtime:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/agent-runtime
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix=

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./agent-runtime/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  build-frontend:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/frontend
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix=

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NEXT_PUBLIC_API_URL=${{ vars.API_URL }}
```

---

### Staging Deployment Workflow

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --name staging-cluster --region ${{ vars.AWS_REGION }}

      - name: Install ArgoCD CLI
        run: |
          curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
          chmod +x argocd
          sudo mv argocd /usr/local/bin/

      - name: Sync ArgoCD application
        run: |
          argocd login ${{ secrets.ARGOCD_SERVER }} \
            --username admin \
            --password ${{ secrets.ARGOCD_PASSWORD }} \
            --insecure

          argocd app sync agent-platform-staging \
            --revision ${{ github.sha }} \
            --prune

          argocd app wait agent-platform-staging \
            --timeout 300

      - name: Run smoke tests
        run: |
          curl -f https://staging.agentplatform.com/health || exit 1
          curl -f https://staging.agentplatform.com/api/health || exit 1

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Staging deployment ${{ job.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Staging Deployment*\n*Status:* ${{ job.status }}\n*Commit:* `${{ github.sha }}`\n*Author:* ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

### Production Deployment Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  release:
    types: [published]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Check staging health
        run: |
          curl -f https://staging.agentplatform.com/health || exit 1

      - name: Verify staging has same version
        run: |
          STAGING_VERSION=$(curl -s https://staging.agentplatform.com/api/version | jq -r '.version')
          if [ "$STAGING_VERSION" != "${{ github.event.release.tag_name }}" ]; then
            echo "Staging version ($STAGING_VERSION) does not match release (${{ github.event.release.tag_name }})"
            exit 1
          fi

  deploy:
    needs: validate
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --name production-cluster --region ${{ vars.AWS_REGION }}

      - name: Install ArgoCD CLI
        run: |
          curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
          chmod +x argocd
          sudo mv argocd /usr/local/bin/

      - name: Deploy with canary
        run: |
          argocd login ${{ secrets.ARGOCD_SERVER }} \
            --username admin \
            --password ${{ secrets.ARGOCD_PASSWORD }} \
            --insecure

          # Start canary deployment (10% traffic)
          argocd app set agent-platform-production \
            --parameter canary.enabled=true \
            --parameter canary.weight=10

          argocd app sync agent-platform-production \
            --revision ${{ github.event.release.tag_name }} \
            --prune

      - name: Monitor canary (5 minutes)
        run: |
          for i in {1..10}; do
            ERROR_RATE=$(curl -s "https://prometheus.agentplatform.com/api/v1/query?query=rate(http_requests_total{status=~\"5..\",canary=\"true\"}[1m])" | jq '.data.result[0].value[1] // 0')
            if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
              echo "Error rate too high: $ERROR_RATE"
              exit 1
            fi
            sleep 30
          done

      - name: Promote canary to full deployment
        run: |
          argocd app set agent-platform-production \
            --parameter canary.enabled=false \
            --parameter canary.weight=100

          argocd app sync agent-platform-production
          argocd app wait agent-platform-production --timeout 300

      - name: Run production smoke tests
        run: |
          curl -f https://agentplatform.com/health || exit 1
          curl -f https://agentplatform.com/api/health || exit 1
          curl -f https://agentplatform.com/api/v1/agents -H "Authorization: Bearer ${{ secrets.SMOKE_TEST_TOKEN }}" || exit 1

      - name: Create deployment record
        run: |
          curl -X POST https://api.github.com/repos/${{ github.repository }}/deployments \
            -H "Authorization: Bearer ${{ secrets.GITHUB_TOKEN }}" \
            -d '{
              "ref": "${{ github.event.release.tag_name }}",
              "environment": "production",
              "auto_merge": false
            }'

  rollback:
    needs: deploy
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - name: Rollback deployment
        run: |
          argocd login ${{ secrets.ARGOCD_SERVER }} \
            --username admin \
            --password ${{ secrets.ARGOCD_PASSWORD }} \
            --insecure

          argocd app rollback agent-platform-production

      - name: Notify team
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "PRODUCTION DEPLOYMENT FAILED - ROLLED BACK",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*PRODUCTION DEPLOYMENT FAILED*\n:rotating_light: Automatic rollback initiated\n*Version:* ${{ github.event.release.tag_name }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  notify:
    needs: deploy
    if: success()
    runs-on: ubuntu-latest
    steps:
      - name: Notify success
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Production deployment successful!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Deployment Complete* :rocket:\n*Version:* ${{ github.event.release.tag_name }}\n*Release Notes:* ${{ github.event.release.html_url }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## Dockerfiles

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry==1.7.1

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Export dependencies to requirements.txt
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

# Production image
FROM python:3.11-slim

WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/app ./app
COPY backend/alembic ./alembic
COPY backend/alembic.ini .

# Build arguments
ARG BUILD_VERSION
ARG BUILD_DATE
ENV BUILD_VERSION=${BUILD_VERSION}
ENV BUILD_DATE=${BUILD_DATE}

# Change ownership
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
```

---

## ArgoCD Application Manifests

### Staging Application

```yaml
# kubernetes/argocd/staging.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: agent-platform-staging
  namespace: argocd
spec:
  project: default

  source:
    repoURL: https://github.com/your-org/agent-platform.git
    targetRevision: staging
    path: kubernetes/overlays/staging

  destination:
    server: https://kubernetes.default.svc
    namespace: agent-platform-staging

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### Production Application

```yaml
# kubernetes/argocd/production.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: agent-platform-production
  namespace: argocd
spec:
  project: default

  source:
    repoURL: https://github.com/your-org/agent-platform.git
    targetRevision: HEAD
    path: kubernetes/overlays/production
    helm:
      parameters:
        - name: canary.enabled
          value: "false"
        - name: canary.weight
          value: "100"

  destination:
    server: https://kubernetes.default.svc
    namespace: agent-platform-production

  syncPolicy:
    syncOptions:
      - CreateNamespace=true
    # Manual sync for production
    automated: null
```

---

## Quality Gates

### Required Checks for Merge

| Check | Description | Required |
|-------|-------------|----------|
| `ci/lint` | Code linting passes | Yes |
| `ci/test` | All tests pass | Yes |
| `ci/security` | No critical vulnerabilities | Yes |
| `ci/build` | Docker build succeeds | Yes |
| `codecov/patch` | Coverage > 80% on changed files | Yes |

### Deployment Gates

| Environment | Gate | Criteria |
|-------------|------|----------|
| Staging | Automatic | All CI checks pass |
| Production | Manual | Release tag + staging verified |

---

## Secrets Management

### GitHub Secrets Configuration

```yaml
# Required secrets per environment
secrets:
  # Shared
  CODECOV_TOKEN: "xxx"
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/..."

  # Staging
  staging:
    AWS_ACCESS_KEY_ID: "AKIA..."
    AWS_SECRET_ACCESS_KEY: "xxx"
    ARGOCD_SERVER: "argocd.staging.example.com"
    ARGOCD_PASSWORD: "xxx"

  # Production
  production:
    AWS_ACCESS_KEY_ID: "AKIA..."
    AWS_SECRET_ACCESS_KEY: "xxx"
    ARGOCD_SERVER: "argocd.example.com"
    ARGOCD_PASSWORD: "xxx"
    SMOKE_TEST_TOKEN: "xxx"
```

---

## Monitoring and Alerts

### Deployment Monitoring

```yaml
# prometheus/alerts/deployment.yaml
groups:
  - name: deployment-alerts
    rules:
      - alert: DeploymentFailed
        expr: |
          kube_deployment_status_replicas_unavailable{namespace=~"agent-platform.*"} > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Deployment has unavailable replicas"

      - alert: HighErrorRateAfterDeploy
        expr: |
          rate(http_requests_total{status=~"5.."}[5m]) > 0.05
          and
          changes(kube_deployment_status_observed_generation[10m]) > 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected after deployment"
```

---

## Best Practices

### DO

- Use path filtering to skip unnecessary jobs
- Cache dependencies between runs
- Run jobs in parallel when possible
- Use environment protection rules
- Implement canary deployments for production
- Monitor deployment metrics
- Have automatic rollback mechanisms

### DON'T

- Store secrets in workflow files
- Deploy directly to production without staging
- Skip tests to deploy faster
- Ignore failing quality gates
- Deploy on Fridays without urgent need
- Use `latest` tags in production
