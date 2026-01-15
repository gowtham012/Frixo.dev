# Contributing to Agent Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/agent-platform.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Submit a pull request

## Development Setup

```bash
# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install

# Run tests to verify setup
pytest
```

## Code Standards

### Python Style

- Follow [PEP 8](https://pep8.org/)
- Use type hints for all functions
- Maximum line length: 100 characters
- Use `ruff` for linting and formatting

```bash
# Format code
ruff format .

# Check linting
ruff check .

# Type checking
mypy app/
```

### Commit Messages

Use conventional commits format:

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(agents): add streaming execution support
fix(auth): resolve token refresh race condition
docs(api): update endpoint documentation
```

### Branch Naming

```
feature/description    # New features
fix/description        # Bug fixes
docs/description       # Documentation
refactor/description   # Code refactoring
```

## Pull Request Process

1. **Before submitting:**
   - Run all tests: `pytest`
   - Run linting: `ruff check .`
   - Update documentation if needed
   - Add tests for new features

2. **PR Requirements:**
   - Clear description of changes
   - Link to related issue (if any)
   - All CI checks passing
   - At least one approval from maintainer

3. **PR Template:**
   ```markdown
   ## Summary
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows project style
   - [ ] Self-review completed
   - [ ] Documentation updated
   ```

## Testing

### Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/test_agents.py

# Specific test
pytest tests/test_agents.py::test_create_agent
```

### Writing Tests

- Place tests in `tests/` directory
- Mirror the `app/` structure
- Use fixtures for common setup
- Aim for >80% coverage on new code

```python
# tests/test_agents.py
import pytest
from app.services.agent_service import AgentService

@pytest.fixture
def agent_service(db_session):
    return AgentService(db_session)

async def test_create_agent(agent_service):
    agent = await agent_service.create({
        "name": "Test Agent",
        "system_prompt": "You are helpful."
    })
    assert agent.id is not None
    assert agent.name == "Test Agent"
```

## Project Structure

```
app/
├── api/           # Route handlers
├── core/          # Config, security
├── models/        # Database models
├── schemas/       # Request/response schemas
├── services/      # Business logic
└── repositories/  # Data access
```

### Where to Put Code

| Type | Location |
|------|----------|
| New endpoint | `app/api/v1/routes/` |
| Business logic | `app/services/` |
| Database model | `app/models/` |
| Request/response schema | `app/schemas/` |
| Database queries | `app/repositories/` |
| Utilities | `app/core/` |

## Database Changes

1. Create migration: `alembic revision --autogenerate -m "description"`
2. Review generated migration in `migrations/versions/`
3. Test migration: `alembic upgrade head`
4. Test rollback: `alembic downgrade -1`

## Documentation

- Update relevant docs when changing functionality
- Add docstrings to public functions
- Keep README.md current

## Questions?

- Check existing issues and discussions
- Open a new issue for bugs or feature requests
- Email: dev@agentplatform.com

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow
