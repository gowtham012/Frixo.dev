# Agent Platform

Build production-ready AI agents in minutes, not months.

## Overview

Agent Platform is a complete solution for building, testing, and deploying AI agents with built-in evals, tracing, monitoring, and a marketplace.

### Key Features

- **Build from Prompt** - Describe your agent in plain English, we generate the config
- **Production Ready** - Auth, rate limiting, monitoring, and security out of the box
- **Evals & Tracing** - Built-in evaluation frameworks and real-time tracing
- **Marketplace** - Monetize your agents or discover ready-made solutions
- **A2A Orchestration** - Agents that collaborate with other agents
- **Self-Evolving** - Agents that learn and improve from feedback

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Celery
- **Database**: PostgreSQL 15+, Redis
- **Infrastructure**: AWS (EKS, RDS, ElastiCache), Terraform
- **Monitoring**: Prometheus, Grafana, OpenTelemetry

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/agent-platform.git
cd agent-platform

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload
```

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Verify Installation

```bash
# Health check
curl http://localhost:8000/health

# API docs
open http://localhost:8000/docs
```

## Project Structure

```
agent-platform/
├── app/
│   ├── api/              # API routes (v1, v2)
│   ├── core/             # Config, security, middleware
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   └── main.py           # FastAPI application
├── tests/                # Test suite
├── migrations/           # Alembic migrations
├── infrastructure/       # Terraform configs
├── docs/                 # Documentation
└── docker-compose.yml
```

## Documentation

| Document | Description |
|----------|-------------|
| [Technical Architecture](docs/architecture/technical-architecture.md) | System design and components |
| [API Specification](docs/specs/api-specification.md) | REST API endpoints |
| [Database Schema](docs/specs/database-schema.md) | Data models and relationships |
| [Development Standards](docs/standards/development-standards.md) | Coding guidelines |
| [Testing Strategy](docs/standards/testing-strategy.md) | Test requirements |

## Development

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Lint code
ruff check .

# Format code
ruff format .

# Type checking
mypy app/
```

## API Usage

### Authentication

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepass", "name": "User"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securepass"}'
```

### Create an Agent

```bash
curl -X POST http://localhost:8000/api/v1/agents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Research Assistant",
    "description": "Searches and summarizes information",
    "system_prompt": "You are a helpful research assistant...",
    "model": "gpt-4"
  }'
```

### Run an Agent

```bash
curl -X POST http://localhost:8000/api/v1/agents/agt_xxx/run \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"input": "Research the latest AI trends"}'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `SECRET_KEY` | JWT signing key | - |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `ENV` | Environment (dev/staging/prod) | `dev` |

See [Environment Config](docs/standards/environment-config.md) for full list.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Proprietary - All rights reserved.

## Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-org/agent-platform/issues)
- Email: support@agentplatform.com
