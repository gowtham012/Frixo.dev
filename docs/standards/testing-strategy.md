# Testing Strategy

## Overview

This document defines the testing strategy for the AI Agent Platform, covering unit tests, integration tests, and end-to-end tests.

---

## Testing Pyramid

```
        ┌─────────┐
        │   E2E   │  < 10% (Slow, expensive)
        ├─────────┤
        │ Integr- │  ~ 20% (Medium speed)
        │  ation  │
        ├─────────┤
        │  Unit   │  > 70% (Fast, cheap)
        └─────────┘
```

---

## Test Types

| Type | Purpose | Speed | Coverage Target |
|------|---------|-------|-----------------|
| Unit | Test individual functions/classes | Fast (ms) | 80%+ |
| Integration | Test component interactions | Medium (seconds) | Key flows |
| E2E | Test complete user journeys | Slow (minutes) | Critical paths |
| Contract | Test API contracts | Fast | All endpoints |
| Performance | Test under load | Slow | Key endpoints |

---

## Testing Stack

### Backend (Python)

| Tool | Purpose |
|------|---------|
| pytest | Test framework |
| pytest-asyncio | Async test support |
| pytest-cov | Coverage reporting |
| factory_boy | Test data factories |
| httpx | Async HTTP client for testing |
| respx | HTTP mocking |

### Frontend (TypeScript)

| Tool | Purpose |
|------|---------|
| Vitest | Unit testing |
| React Testing Library | Component testing |
| Playwright | E2E testing |
| MSW | API mocking |

---

## Directory Structure

### Backend

```
backend/
└── tests/
    ├── conftest.py           # Shared fixtures
    ├── factories/            # Test data factories
    │   ├── __init__.py
    │   ├── user.py
    │   ├── agent.py
    │   └── organization.py
    ├── unit/                 # Unit tests
    │   ├── __init__.py
    │   ├── services/
    │   │   ├── test_agent_service.py
    │   │   └── test_auth_service.py
    │   └── utils/
    │       └── test_validators.py
    ├── integration/          # Integration tests
    │   ├── __init__.py
    │   ├── api/
    │   │   ├── test_agents_api.py
    │   │   └── test_auth_api.py
    │   └── repositories/
    │       └── test_agent_repository.py
    └── e2e/                  # End-to-end tests
        └── test_agent_workflow.py
```

### Frontend

```
frontend/
└── tests/
    ├── setup.ts              # Test setup
    ├── unit/                 # Unit tests
    │   ├── components/
    │   │   └── agent-card.test.tsx
    │   └── hooks/
    │       └── use-agents.test.ts
    ├── integration/          # Integration tests
    │   └── pages/
    │       └── agents.test.tsx
    └── e2e/                  # Playwright tests
        ├── playwright.config.ts
        └── specs/
            ├── auth.spec.ts
            └── agents.spec.ts
```

---

## pytest Configuration

### pyproject.toml

```toml
[tool.pytest.ini_options]
minversion = "7.0"
addopts = [
    "-ra",
    "-q",
    "--strict-markers",
    "--asyncio-mode=auto",
]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
markers = [
    "slow: marks tests as slow",
    "integration: marks integration tests",
    "e2e: marks end-to-end tests",
]
filterwarnings = [
    "ignore::DeprecationWarning",
]

[tool.coverage.run]
source = ["app"]
branch = true
omit = [
    "*/tests/*",
    "*/__init__.py",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise NotImplementedError",
    "if TYPE_CHECKING:",
]
fail_under = 80
```

---

## Fixtures

### conftest.py

```python
# tests/conftest.py

import asyncio
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.config import settings
from app.models.base import Base
from app.db import get_db
from tests.factories import UserFactory, OrganizationFactory, AgentFactory


# Test database URL
TEST_DATABASE_URL = settings.DATABASE_URL.replace(
    settings.DATABASE_URL.split("/")[-1],
    "test_" + settings.DATABASE_URL.split("/")[-1]
)


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def engine():
    """Create test database engine."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
async def db_session(engine):
    """Create database session for each test."""
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        yield session
        await session.rollback()


@pytest.fixture
async def client(db_session):
    """Create test client."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
async def authenticated_client(client, db_session):
    """Create authenticated test client."""
    # Create test user
    user = await UserFactory.create(db_session)

    # Generate token
    from app.core.security import create_access_token
    token = create_access_token(user, user.organization)

    client.headers["Authorization"] = f"Bearer {token}"
    client.user = user

    return client


@pytest.fixture
def user_factory(db_session):
    """User factory fixture."""
    return UserFactory(db_session)


@pytest.fixture
def agent_factory(db_session):
    """Agent factory fixture."""
    return AgentFactory(db_session)
```

### Factories

```python
# tests/factories/user.py

import factory
from faker import Faker
from app.models.user import User

fake = Faker()


class UserFactory(factory.Factory):
    class Meta:
        model = User

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    email = factory.LazyFunction(lambda: fake.email())
    name = factory.LazyFunction(lambda: fake.name())
    password_hash = factory.LazyFunction(
        lambda: "$2b$12$..."  # Pre-hashed "password123"
    )
    organization_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    role = "member"

    @classmethod
    async def create(cls, db_session, **kwargs):
        user = cls.build(**kwargs)
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user
```

```python
# tests/factories/agent.py

import factory
from faker import Faker
from app.models.agent import Agent

fake = Faker()


class AgentFactory(factory.Factory):
    class Meta:
        model = Agent

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    name = factory.LazyFunction(lambda: f"Agent {fake.word()}")
    description = factory.LazyFunction(lambda: fake.sentence())
    organization_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    config = factory.LazyFunction(lambda: {
        "model": "gpt-4o",
        "temperature": 0.7,
        "tools": [],
    })
    status = "draft"
```

---

## Unit Tests

### Service Tests

```python
# tests/unit/services/test_agent_service.py

import pytest
from unittest.mock import AsyncMock, patch
from app.services.agent_service import AgentService
from app.core.exceptions import AgentNotFoundError, AuthorizationError


class TestAgentService:
    @pytest.fixture
    def agent_service(self):
        return AgentService()

    @pytest.fixture
    def mock_agent_repo(self):
        with patch("app.services.agent_service.agent_repo") as mock:
            yield mock

    async def test_get_agent_success(
        self, agent_service, mock_agent_repo, agent_factory, user_factory
    ):
        # Arrange
        user = user_factory.build()
        agent = agent_factory.build(organization_id=user.organization_id)
        mock_agent_repo.get.return_value = agent

        # Act
        result = await agent_service.get_agent(agent.id, user)

        # Assert
        assert result == agent
        mock_agent_repo.get.assert_called_once_with(agent.id)

    async def test_get_agent_not_found(
        self, agent_service, mock_agent_repo, user_factory
    ):
        # Arrange
        user = user_factory.build()
        mock_agent_repo.get.return_value = None

        # Act & Assert
        with pytest.raises(AgentNotFoundError):
            await agent_service.get_agent("non_existent_id", user)

    async def test_get_agent_unauthorized(
        self, agent_service, mock_agent_repo, agent_factory, user_factory
    ):
        # Arrange
        user = user_factory.build()
        agent = agent_factory.build(organization_id="different_org")
        mock_agent_repo.get.return_value = agent

        # Act & Assert
        with pytest.raises(AuthorizationError):
            await agent_service.get_agent(agent.id, user)

    async def test_create_agent_success(
        self, agent_service, mock_agent_repo, user_factory
    ):
        # Arrange
        user = user_factory.build()
        create_data = {
            "name": "Test Agent",
            "description": "Test description",
            "config": {"model": "gpt-4o"},
        }
        mock_agent_repo.create.return_value = AsyncMock(id="new_agent_id")

        # Act
        result = await agent_service.create_agent(create_data, user)

        # Assert
        assert result.id == "new_agent_id"
        mock_agent_repo.create.assert_called_once()
```

### Utility Tests

```python
# tests/unit/utils/test_validators.py

import pytest
from app.utils.validators import validate_email, validate_agent_config


class TestValidateEmail:
    @pytest.mark.parametrize("email", [
        "user@example.com",
        "user.name@example.co.uk",
        "user+tag@example.com",
    ])
    def test_valid_emails(self, email):
        assert validate_email(email) is True

    @pytest.mark.parametrize("email", [
        "invalid",
        "user@",
        "@example.com",
        "user@.com",
    ])
    def test_invalid_emails(self, email):
        assert validate_email(email) is False


class TestValidateAgentConfig:
    def test_valid_config(self):
        config = {
            "model": "gpt-4o",
            "temperature": 0.7,
            "max_tokens": 2000,
        }
        assert validate_agent_config(config) is True

    def test_invalid_temperature(self):
        config = {"model": "gpt-4o", "temperature": 2.5}
        with pytest.raises(ValueError, match="temperature"):
            validate_agent_config(config)
```

---

## Integration Tests

### API Tests

```python
# tests/integration/api/test_agents_api.py

import pytest
from httpx import AsyncClient


class TestAgentsAPI:
    @pytest.mark.integration
    async def test_list_agents(self, authenticated_client: AsyncClient):
        # Act
        response = await authenticated_client.get("/api/v1/agents")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    @pytest.mark.integration
    async def test_create_agent(self, authenticated_client: AsyncClient):
        # Arrange
        payload = {
            "name": "Test Agent",
            "description": "A test agent",
            "config": {"model": "gpt-4o"},
        }

        # Act
        response = await authenticated_client.post(
            "/api/v1/agents",
            json=payload,
        )

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == "Test Agent"

    @pytest.mark.integration
    async def test_create_agent_validation_error(
        self, authenticated_client: AsyncClient
    ):
        # Arrange - missing required fields
        payload = {"description": "No name provided"}

        # Act
        response = await authenticated_client.post(
            "/api/v1/agents",
            json=payload,
        )

        # Assert
        assert response.status_code == 400
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "VAL_INVALID_INPUT"

    @pytest.mark.integration
    async def test_get_agent_not_found(
        self, authenticated_client: AsyncClient
    ):
        # Act
        response = await authenticated_client.get(
            "/api/v1/agents/non_existent_id"
        )

        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["error"]["code"] == "AGENT_NOT_FOUND"

    @pytest.mark.integration
    async def test_unauthorized_access(self, client: AsyncClient):
        # Act - no auth header
        response = await client.get("/api/v1/agents")

        # Assert
        assert response.status_code == 401
```

### Repository Tests

```python
# tests/integration/repositories/test_agent_repository.py

import pytest
from app.repositories.agent_repository import AgentRepository
from tests.factories import AgentFactory


class TestAgentRepository:
    @pytest.fixture
    def repo(self, db_session):
        return AgentRepository(db_session)

    @pytest.mark.integration
    async def test_create_and_get(self, repo, db_session):
        # Arrange
        agent_data = {
            "name": "Test Agent",
            "organization_id": "org_123",
            "config": {"model": "gpt-4o"},
        }

        # Act
        created = await repo.create(**agent_data)
        retrieved = await repo.get(created.id)

        # Assert
        assert retrieved is not None
        assert retrieved.name == "Test Agent"
        assert retrieved.organization_id == "org_123"

    @pytest.mark.integration
    async def test_list_by_organization(self, repo, db_session):
        # Arrange
        org_id = "org_123"
        for i in range(3):
            await AgentFactory.create(db_session, organization_id=org_id)

        # Act
        agents = await repo.list_by_organization(org_id)

        # Assert
        assert len(agents) == 3
        assert all(a.organization_id == org_id for a in agents)
```

---

## E2E Tests

### Playwright Configuration

```typescript
// tests/e2e/playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Specs

```typescript
// tests/e2e/specs/auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can log in', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toContainText(
      'Invalid credentials'
    );
  });
});
```

```typescript
// tests/e2e/specs/agents.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Agents', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('user can create an agent', async ({ page }) => {
    await page.goto('/agents/new');

    await page.fill('[name="name"]', 'My Test Agent');
    await page.fill('[name="description"]', 'A test agent description');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/agents\/[a-z0-9-]+/);
    await expect(page.locator('h1')).toContainText('My Test Agent');
  });

  test('user can view agent list', async ({ page }) => {
    await page.goto('/agents');

    await expect(page.locator('h1')).toContainText('Agents');
    await expect(page.locator('.agent-card')).toHaveCount.greaterThan(0);
  });
});
```

---

## Running Tests

### Commands

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/services/test_agent_service.py

# Run specific test
pytest tests/unit/services/test_agent_service.py::TestAgentService::test_get_agent_success

# Run by marker
pytest -m "not slow"
pytest -m integration
pytest -m e2e

# Run with verbose output
pytest -v

# Run frontend tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

### Makefile

```makefile
.PHONY: test test-unit test-integration test-e2e test-cov

test:
	pytest

test-unit:
	pytest tests/unit -v

test-integration:
	pytest tests/integration -v -m integration

test-e2e:
	pytest tests/e2e -v -m e2e

test-cov:
	pytest --cov=app --cov-report=html --cov-report=term-missing
	@echo "Coverage report: htmlcov/index.html"

test-watch:
	pytest-watch
```

---

## Best Practices

### DO

- Write tests before or alongside code (TDD/TLD)
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Mock external dependencies
- Use factories for test data
- Keep tests independent
- Test edge cases and error paths

### DON'T

- Test implementation details
- Share state between tests
- Use production databases
- Hardcode test data everywhere
- Skip error case testing
- Write flaky tests
