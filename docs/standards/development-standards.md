# Development Standards

## Overview

This document defines coding standards, style guides, and best practices for the AI Agent Platform. All contributors must follow these guidelines.

---

## Python Standards

### Style Guide

We follow **PEP 8** with modifications enforced by **Ruff** and **Black**.

### Formatting

```toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'

[tool.ruff]
line-length = 88
target-version = "py311"
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "C",   # flake8-comprehensions
    "B",   # flake8-bugbear
    "UP",  # pyupgrade
]
ignore = [
    "E501",  # line too long (handled by black)
    "B008",  # do not perform function calls in argument defaults
]

[tool.ruff.isort]
known-first-party = ["app"]
```

### Type Hints

**Required** for all function signatures:

```python
# Good
def create_agent(
    name: str,
    config: AgentConfig,
    user_id: str,
) -> Agent:
    ...

# Bad - missing types
def create_agent(name, config, user_id):
    ...
```

### Docstrings

Use **Google style** docstrings for public functions:

```python
def execute_agent(
    agent_id: str,
    input_data: dict[str, Any],
    timeout: int = 30000,
) -> ExecutionResult:
    """Execute an agent with the given input.

    Args:
        agent_id: The unique identifier of the agent.
        input_data: Input data to pass to the agent.
        timeout: Maximum execution time in milliseconds.

    Returns:
        ExecutionResult containing output and metrics.

    Raises:
        AgentNotFoundError: If agent doesn't exist.
        ExecutionTimeoutError: If execution exceeds timeout.
    """
    ...
```

### Async/Await

- Use `async/await` for I/O operations
- Never mix sync and async code without proper handling

```python
# Good
async def get_user(user_id: str) -> User:
    return await db.users.get(user_id)

# Bad - blocking call in async context
async def get_user(user_id: str) -> User:
    return db.users.get_sync(user_id)  # Blocks event loop!
```

### Exception Handling

```python
# Define custom exceptions
class AgentPlatformError(Exception):
    """Base exception for all platform errors."""
    pass

class AgentNotFoundError(AgentPlatformError):
    """Raised when agent is not found."""
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        super().__init__(f"Agent not found: {agent_id}")

# Use specific exceptions
async def get_agent(agent_id: str) -> Agent:
    agent = await db.agents.get(agent_id)
    if not agent:
        raise AgentNotFoundError(agent_id)
    return agent

# Handle exceptions at API layer
@router.get("/agents/{agent_id}")
async def get_agent_endpoint(agent_id: str):
    try:
        return await agent_service.get_agent(agent_id)
    except AgentNotFoundError:
        raise HTTPException(status_code=404, detail="Agent not found")
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | snake_case | `user_id`, `agent_config` |
| Functions | snake_case | `create_agent()`, `get_user_by_id()` |
| Classes | PascalCase | `AgentService`, `UserRepository` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Private | _prefix | `_internal_method()`, `_cache` |
| Protected | __prefix | `__secret_key` |

---

## TypeScript Standards

### Style Guide

We use **ESLint** with Next.js config and **Prettier** for formatting.

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'prefer-const': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80
}
```

### Type Safety

- **Never** use `any` unless absolutely necessary
- Use strict TypeScript configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Component Structure

```typescript
// components/agents/agent-card.tsx

// 1. Imports
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import type { Agent } from '@/types/agent';

// 2. Types/Interfaces
interface AgentCardProps {
  agent: Agent;
  onSelect?: (agent: Agent) => void;
  isSelected?: boolean;
}

// 3. Component
export function AgentCard({ agent, onSelect, isSelected = false }: AgentCardProps) {
  // Hooks first
  const [isHovered, setIsHovered] = useState(false);

  // Event handlers
  const handleClick = () => {
    onSelect?.(agent);
  };

  // Render
  return (
    <Card
      className={cn('cursor-pointer', isSelected && 'border-primary')}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3>{agent.name}</h3>
      <p>{agent.description}</p>
    </Card>
  );
}
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `userId`, `agentConfig` |
| Functions | camelCase | `createAgent()`, `getUserById()` |
| Components | PascalCase | `AgentCard`, `UserProfile` |
| Interfaces | PascalCase | `Agent`, `UserConfig` |
| Types | PascalCase | `AgentStatus`, `ExecutionResult` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_URL` |
| Files | kebab-case | `agent-card.tsx`, `use-agents.ts` |

---

## React Best Practices

### Component Organization

```
components/
├── ui/              # Base UI components (buttons, inputs, etc.)
├── layout/          # Layout components (header, sidebar, etc.)
├── agents/          # Feature-specific components
├── marketplace/
└── shared/          # Shared components across features
```

### State Management

```typescript
// Server state: TanStack Query
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<Agent[]>('/agents'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Client state: Zustand
export const useAppStore = create<AppState>((set) => ({
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
}));

// Local state: useState for component-specific state
const [isOpen, setIsOpen] = useState(false);
```

### Hooks Rules

1. Always call hooks at the top level
2. Only call hooks from React functions
3. Custom hooks must start with `use`

```typescript
// Good - custom hook
function useAgentExecution(agentId: string) {
  const [status, setStatus] = useState<'idle' | 'running'>('idle');

  const run = useCallback(async (input: string) => {
    setStatus('running');
    // ...
  }, [agentId]);

  return { status, run };
}

// Bad - hook inside condition
function Component() {
  if (someCondition) {
    useState(); // Never do this!
  }
}
```

---

## API Design Standards

### RESTful Conventions

| Action | HTTP Method | Path | Example |
|--------|------------|------|---------|
| List | GET | /resources | GET /agents |
| Create | POST | /resources | POST /agents |
| Read | GET | /resources/{id} | GET /agents/123 |
| Update | PATCH | /resources/{id} | PATCH /agents/123 |
| Delete | DELETE | /resources/{id} | DELETE /agents/123 |
| Action | POST | /resources/{id}/action | POST /agents/123/run |

### Response Format

```python
# Consistent response structure
class ApiResponse(BaseModel):
    success: bool
    data: Any | None = None
    error: ErrorDetail | None = None
    meta: ResponseMeta

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: list[FieldError] | None = None

class ResponseMeta(BaseModel):
    request_id: str
    timestamp: datetime
```

### Pagination

```python
# Always use cursor-based or offset pagination
class PaginatedResponse(BaseModel):
    data: list[Any]
    pagination: PaginationMeta

class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool
```

---

## Database Standards

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Tables | snake_case, plural | `users`, `agents`, `runs` |
| Columns | snake_case | `created_at`, `user_id` |
| Primary Keys | `id` | `id UUID PRIMARY KEY` |
| Foreign Keys | `{table}_id` | `user_id`, `agent_id` |
| Indexes | `idx_{table}_{columns}` | `idx_agents_organization_id` |
| Unique | `uq_{table}_{columns}` | `uq_users_email` |

### Required Columns

Every table should have:

```sql
CREATE TABLE example (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- ... other columns ...
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Soft Deletes

Use soft deletes for important data:

```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    -- ... other columns ...
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Query only non-deleted
SELECT * FROM agents WHERE deleted_at IS NULL;
```

---

## Git Commit Standards

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons, etc. |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding missing tests |
| `chore` | Maintenance tasks |

### Examples

```bash
# Good
feat(agents): add agent cloning functionality

Allows users to clone existing agents with a new name.
Includes copying all configurations and triggers.

Closes #123

# Good
fix(auth): resolve token refresh race condition

Multiple concurrent requests were causing token refresh
to fail intermittently.

# Bad - too vague
fix: fixed stuff

# Bad - no type
added new feature
```

### Commitlint Configuration

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore'],
    ],
    'scope-enum': [
      2,
      'always',
      ['agents', 'auth', 'marketplace', 'integrations', 'billing', 'api', 'ui', 'infra'],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
  },
};
```

---

## Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-added-large-files
        args: ['--maxkb=1000']

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.11
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.8.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]

  - repo: local
    hooks:
      - id: eslint
        name: eslint
        entry: pnpm --filter frontend lint
        language: system
        files: \.(ts|tsx)$
        pass_filenames: false

      - id: commitlint
        name: commitlint
        entry: npx commitlint --edit
        language: system
        stages: [commit-msg]
```

---

## Code Review Checklist

### Before Submitting PR

- [ ] Code follows style guide
- [ ] All tests pass locally
- [ ] No linting errors
- [ ] Types are properly defined
- [ ] No `console.log` or debug statements
- [ ] Sensitive data not hardcoded
- [ ] Database migrations are reversible
- [ ] API changes are backward compatible

### Reviewer Checklist

- [ ] Code is readable and maintainable
- [ ] Logic is correct and handles edge cases
- [ ] Error handling is appropriate
- [ ] Security considerations addressed
- [ ] Performance implications considered
- [ ] Tests cover new functionality
- [ ] Documentation updated if needed

---

## Security Standards

### Never Do

- Hardcode secrets or API keys in code
- Use string formatting for SQL queries (SQL injection risk)
- Run arbitrary user-provided code without sandboxing
- Log sensitive data like passwords or tokens
- Trust user input without validation

### Always Do

```python
# Use environment variables for secrets
API_KEY = os.getenv("API_KEY")

# Use parameterized queries
query = "SELECT * FROM users WHERE id = :id"
result = await db.run(query, {"id": user_id})

# Validate and sanitize input
from pydantic import BaseModel, validator

class UserInput(BaseModel):
    name: str

    @validator("name")
    def validate_name(cls, v):
        if len(v) > 100:
            raise ValueError("Name too long")
        return v.strip()

# Log safely - no sensitive data
logger.info("User logged in", extra={"user_id": user_id})
```

---

## Performance Guidelines

### Database

- Always use indexes for frequently queried columns
- Use pagination for list endpoints
- Avoid N+1 queries - use eager loading

```python
# Bad - N+1 queries
agents = await db.agents.all()
for agent in agents:
    owner = await db.users.get(agent.owner_id)  # Query per agent!

# Good - eager loading
agents = await db.agents.all().prefetch_related("owner")
```

### Caching

```python
# Cache frequently accessed data
@cached(ttl=300)  # 5 minutes
async def get_popular_agents():
    return await db.agents.filter(is_featured=True).all()
```

### Async Operations

```python
# Bad - sequential
result1 = await fetch_data_1()
result2 = await fetch_data_2()
result3 = await fetch_data_3()

# Good - concurrent
result1, result2, result3 = await asyncio.gather(
    fetch_data_1(),
    fetch_data_2(),
    fetch_data_3(),
)
```

---

## Documentation Standards

### Code Documentation

- Document **why**, not **what**
- Keep comments up to date
- Use docstrings for public APIs

```python
# Bad - describes what code does (obvious)
# Loop through users
for user in users:
    ...

# Good - explains why
# Filter inactive users to avoid sending notifications to deactivated accounts
active_users = [u for u in users if u.is_active]
```

### README Requirements

Every service should have a README with:

1. Description
2. Prerequisites
3. Setup instructions
4. Running locally
5. Running tests
6. Environment variables
7. API documentation link (if applicable)
