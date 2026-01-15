# Database Migrations Strategy

## Overview

This document defines the database migration strategy for the AI Agent Platform using **Alembic** for PostgreSQL migrations.

---

## Migration Tool: Alembic

### Why Alembic?

- Native SQLAlchemy integration
- Automatic migration generation
- Branch support for parallel development
- Reversible migrations
- Production-tested

### Directory Structure

```
backend/
├── alembic.ini
└── migrations/
    ├── env.py
    ├── script.py.mako
    └── versions/
        ├── 001_initial_schema.py
        ├── 002_add_agents_table.py
        ├── 003_add_marketplace.py
        └── ...
```

---

## Configuration

### alembic.ini

```ini
[alembic]
script_location = migrations
prepend_sys_path = .
version_path_separator = os

[post_write_hooks]
hooks = black
black.type = console_scripts
black.entrypoint = black
black.options = -q

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### migrations/env.py

```python
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.config import settings
from app.models.base import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_url():
    return settings.DATABASE_URL

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with async engine."""
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

---

## Migration Naming Convention

```
{sequence}_{description}.py
```

Examples:
- `001_initial_schema.py`
- `002_add_agents_table.py`
- `003_add_index_on_agents_org_id.py`
- `004_add_marketplace_tables.py`

---

## Creating Migrations

### Auto-generate from Models

```bash
# Generate migration from model changes
alembic revision --autogenerate -m "add agents table"
```

### Manual Migration

```bash
# Create empty migration
alembic revision -m "add custom function"
```

---

## Migration Template

```python
"""Add agents table

Revision ID: 002
Revises: 001
Create Date: 2026-01-11 10:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'agents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('config', postgresql.JSONB(), nullable=False),
        sa.Column('status', sa.String(50), default='draft'),
        sa.Column('version', sa.Integer(), default=1),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
    )

    # Add indexes
    op.create_index('idx_agents_organization_id', 'agents', ['organization_id'])
    op.create_index('idx_agents_status', 'agents', ['status'])
    op.create_index('idx_agents_created_at', 'agents', ['created_at'])


def downgrade() -> None:
    op.drop_index('idx_agents_created_at')
    op.drop_index('idx_agents_status')
    op.drop_index('idx_agents_organization_id')
    op.drop_table('agents')
```

---

## Migration Best Practices

### 1. Always Include Downgrade

Every migration **must** have a working `downgrade()` function:

```python
def upgrade() -> None:
    op.add_column('users', sa.Column('phone', sa.String(20)))

def downgrade() -> None:
    op.drop_column('users', 'phone')
```

### 2. Use Transactions

Alembic wraps migrations in transactions by default. For DDL that can't be transactional:

```python
def upgrade() -> None:
    # Non-transactional operation
    op.execute('CREATE INDEX CONCURRENTLY idx_agents_name ON agents(name)')
```

### 3. Data Migrations

Separate schema migrations from data migrations:

```python
def upgrade() -> None:
    # Schema change
    op.add_column('agents', sa.Column('tier', sa.String(50), default='free'))

    # Data migration
    op.execute("UPDATE agents SET tier = 'free' WHERE tier IS NULL")

    # Make non-nullable after data is populated
    op.alter_column('agents', 'tier', nullable=False)
```

### 4. Large Table Migrations

For tables with millions of rows:

```python
def upgrade() -> None:
    # Add column as nullable first
    op.add_column('executions', sa.Column('cost_usd', sa.Numeric(10, 6)))

    # Backfill in batches (do this in a separate script, not migration)
    # Then make non-nullable in another migration after backfill completes
```

### 5. Index Creation

Create indexes concurrently to avoid locking:

```python
def upgrade() -> None:
    # This won't lock the table
    op.execute('CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agents_name ON agents(name)')

def downgrade() -> None:
    op.execute('DROP INDEX IF EXISTS idx_agents_name')
```

---

## Running Migrations

### Development

```bash
# Apply all pending migrations
alembic upgrade head

# Apply specific migration
alembic upgrade 002

# Rollback one migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade 001

# Show current version
alembic current

# Show migration history
alembic history
```

### Production

```bash
# Always run in a transaction with --sql first to preview
alembic upgrade head --sql > migration.sql

# Review the SQL, then apply
alembic upgrade head
```

---

## CI/CD Integration

### Pre-deployment Check

```yaml
# .github/workflows/ci.yml
- name: Check migrations
  run: |
    # Ensure no pending migrations in dev
    alembic upgrade head

    # Check for model/migration drift
    alembic check
```

### Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "Running database migrations..."
alembic upgrade head

echo "Migrations completed successfully"
```

---

## Schema Documentation

### Generate ERD

```bash
# Using eralchemy
pip install eralchemy2
eralchemy2 -i postgresql://user:pass@localhost/db -o schema.png
```

### Schema Dump

```bash
# Dump current schema
pg_dump -s -d agent_platform > schema.sql
```

---

## Rollback Strategy

### Immediate Rollback

```bash
# Rollback last migration
alembic downgrade -1
```

### Point-in-Time Recovery

```bash
# Rollback to specific version
alembic downgrade abc123

# Or rollback to timestamp (requires proper revision naming)
alembic downgrade -1  # Repeat as needed
```

### Emergency Rollback Script

```bash
#!/bin/bash
# scripts/emergency_rollback.sh

REVISION=$1

if [ -z "$REVISION" ]; then
    echo "Usage: ./emergency_rollback.sh <revision>"
    exit 1
fi

echo "Rolling back to revision: $REVISION"
alembic downgrade $REVISION

echo "Rollback complete. Current version:"
alembic current
```

---

## Common Patterns

### Adding a Column

```python
def upgrade() -> None:
    op.add_column('users', sa.Column('avatar_url', sa.String(500)))

def downgrade() -> None:
    op.drop_column('users', 'avatar_url')
```

### Renaming a Column

```python
def upgrade() -> None:
    op.alter_column('users', 'name', new_column_name='full_name')

def downgrade() -> None:
    op.alter_column('users', 'full_name', new_column_name='name')
```

### Adding Foreign Key

```python
def upgrade() -> None:
    op.add_column('agents', sa.Column('owner_id', postgresql.UUID(as_uuid=True)))
    op.create_foreign_key(
        'fk_agents_owner_id',
        'agents', 'users',
        ['owner_id'], ['id'],
        ondelete='SET NULL'
    )

def downgrade() -> None:
    op.drop_constraint('fk_agents_owner_id', 'agents', type_='foreignkey')
    op.drop_column('agents', 'owner_id')
```

### Creating Enum Type

```python
def upgrade() -> None:
    # Create enum type
    agent_status = postgresql.ENUM('draft', 'active', 'archived', name='agent_status')
    agent_status.create(op.get_bind())

    # Use in column
    op.add_column('agents', sa.Column('status', agent_status, default='draft'))

def downgrade() -> None:
    op.drop_column('agents', 'status')

    # Drop enum type
    agent_status = postgresql.ENUM('draft', 'active', 'archived', name='agent_status')
    agent_status.drop(op.get_bind())
```

### Partitioned Table

```python
def upgrade() -> None:
    op.execute("""
        CREATE TABLE executions (
            id UUID NOT NULL,
            agent_id UUID NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            -- other columns
            PRIMARY KEY (id, created_at)
        ) PARTITION BY RANGE (created_at);
    """)

    # Create initial partitions
    op.execute("""
        CREATE TABLE executions_2026_01 PARTITION OF executions
        FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
    """)

def downgrade() -> None:
    op.execute("DROP TABLE executions CASCADE")
```

---

## Troubleshooting

### Migration Conflicts

When two developers create migrations from the same base:

```bash
# Merge migrations
alembic merge -m "merge heads" head1 head2
```

### Stuck Migration

```bash
# Check current state
alembic current

# Manually mark as complete (use with caution!)
alembic stamp head
```

### Model/Migration Drift

```bash
# Check if models match migrations
alembic check

# If drift detected, generate migration to fix
alembic revision --autogenerate -m "sync models"
```
