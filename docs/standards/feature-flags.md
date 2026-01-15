# Feature Flags Strategy

## Overview

This document defines the feature flag strategy for the AI Agent Platform, enabling safe rollouts, A/B testing, and gradual feature releases without deployments.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Feature Flag System                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐        │
│  │   Client    │────►│   API Server    │────►│  Flag Service   │        │
│  │  (SDK/Web)  │     │   (FastAPI)     │     │  (LaunchDarkly) │        │
│  └─────────────┘     └─────────────────┘     └─────────────────┘        │
│         │                    │                        │                  │
│         │                    ▼                        ▼                  │
│         │            ┌─────────────────┐     ┌─────────────────┐        │
│         └───────────►│  Local Cache    │     │   Flag Store    │        │
│                      │  (In-Memory)    │     │   (Database)    │        │
│                      └─────────────────┘     └─────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Flag Types

### Boolean Flags

Simple on/off toggles for features.

```python
# Usage
if feature_flags.is_enabled("new_agent_builder", user=current_user):
    return render_new_builder()
else:
    return render_classic_builder()
```

### Percentage Rollouts

Gradual rollout to a percentage of users.

```python
# 10% of users see the new feature
flag_config = {
    "name": "streaming_v2",
    "type": "percentage",
    "percentage": 10,
    "sticky": True  # Same user always gets same value
}
```

### User Targeting

Target specific users, organizations, or segments.

```python
flag_config = {
    "name": "enterprise_analytics",
    "type": "targeted",
    "rules": [
        {"attribute": "plan", "operator": "in", "values": ["enterprise", "team"]},
        {"attribute": "org_id", "operator": "in", "values": ["org_123", "org_456"]}
    ],
    "default": False
}
```

### Multivariate Flags

Return different variants for A/B/n testing.

```python
flag_config = {
    "name": "pricing_page_variant",
    "type": "multivariate",
    "variants": [
        {"key": "control", "weight": 50},
        {"key": "variant_a", "weight": 25},
        {"key": "variant_b", "weight": 25}
    ]
}

# Usage
variant = feature_flags.get_variant("pricing_page_variant", user=current_user)
# Returns: "control", "variant_a", or "variant_b"
```

---

## Implementation

### Feature Flag Service

```python
# app/services/feature_flags.py
from typing import Optional, Any, Dict, List
from dataclasses import dataclass
import hashlib
import redis.asyncio as redis

@dataclass
class FlagContext:
    """Context for flag evaluation."""
    user_id: Optional[str] = None
    org_id: Optional[str] = None
    plan: Optional[str] = None
    email: Optional[str] = None
    attributes: Dict[str, Any] = None

    def __post_init__(self):
        self.attributes = self.attributes or {}


class FeatureFlagService:
    """Feature flag evaluation service."""

    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.local_cache: Dict[str, Any] = {}
        self.cache_ttl = 60  # seconds

    async def is_enabled(
        self,
        flag_key: str,
        context: Optional[FlagContext] = None,
        default: bool = False
    ) -> bool:
        """Check if a boolean flag is enabled."""
        flag = await self._get_flag(flag_key)
        if not flag:
            return default

        if not flag.get("enabled", False):
            return False

        return self._evaluate_flag(flag, context)

    async def get_variant(
        self,
        flag_key: str,
        context: Optional[FlagContext] = None,
        default: str = "control"
    ) -> str:
        """Get the variant for a multivariate flag."""
        flag = await self._get_flag(flag_key)
        if not flag or not flag.get("enabled", False):
            return default

        return self._evaluate_variant(flag, context)

    async def get_value(
        self,
        flag_key: str,
        context: Optional[FlagContext] = None,
        default: Any = None
    ) -> Any:
        """Get a JSON value flag."""
        flag = await self._get_flag(flag_key)
        if not flag or not flag.get("enabled", False):
            return default

        # Evaluate targeting rules
        if self._evaluate_flag(flag, context):
            return flag.get("value", default)
        return default

    def _evaluate_flag(
        self,
        flag: Dict,
        context: Optional[FlagContext]
    ) -> bool:
        """Evaluate flag based on rules."""
        flag_type = flag.get("type", "boolean")

        if flag_type == "boolean":
            return flag.get("value", False)

        if flag_type == "percentage":
            return self._evaluate_percentage(flag, context)

        if flag_type == "targeted":
            return self._evaluate_rules(flag.get("rules", []), context)

        return flag.get("default", False)

    def _evaluate_percentage(
        self,
        flag: Dict,
        context: Optional[FlagContext]
    ) -> bool:
        """Evaluate percentage-based rollout."""
        percentage = flag.get("percentage", 0)
        if percentage >= 100:
            return True
        if percentage <= 0:
            return False

        # Use consistent hashing for sticky assignment
        if context and context.user_id:
            hash_key = f"{flag.get('name')}:{context.user_id}"
            hash_value = int(hashlib.md5(hash_key.encode()).hexdigest(), 16)
            bucket = hash_value % 100
            return bucket < percentage

        return False

    def _evaluate_rules(
        self,
        rules: List[Dict],
        context: Optional[FlagContext]
    ) -> bool:
        """Evaluate targeting rules."""
        if not context or not rules:
            return False

        for rule in rules:
            if self._matches_rule(rule, context):
                return True

        return False

    def _matches_rule(
        self,
        rule: Dict,
        context: FlagContext
    ) -> bool:
        """Check if context matches a single rule."""
        attribute = rule.get("attribute")
        operator = rule.get("operator")
        values = rule.get("values", [])

        # Get attribute value from context
        if hasattr(context, attribute):
            actual = getattr(context, attribute)
        else:
            actual = context.attributes.get(attribute)

        if actual is None:
            return False

        # Evaluate operator
        if operator == "in":
            return actual in values
        if operator == "not_in":
            return actual not in values
        if operator == "equals":
            return actual == values[0] if values else False
        if operator == "contains":
            return any(v in str(actual) for v in values)
        if operator == "starts_with":
            return str(actual).startswith(values[0]) if values else False
        if operator == "ends_with":
            return str(actual).endswith(values[0]) if values else False

        return False

    def _evaluate_variant(
        self,
        flag: Dict,
        context: Optional[FlagContext]
    ) -> str:
        """Evaluate multivariate flag to get variant."""
        variants = flag.get("variants", [])
        if not variants:
            return "control"

        # Calculate bucket
        if context and context.user_id:
            hash_key = f"{flag.get('name')}:{context.user_id}"
            hash_value = int(hashlib.md5(hash_key.encode()).hexdigest(), 16)
            bucket = hash_value % 100
        else:
            import random
            bucket = random.randint(0, 99)

        # Find matching variant
        cumulative = 0
        for variant in variants:
            cumulative += variant.get("weight", 0)
            if bucket < cumulative:
                return variant.get("key", "control")

        return variants[-1].get("key", "control")

    async def _get_flag(self, flag_key: str) -> Optional[Dict]:
        """Get flag configuration from cache or store."""
        # Check local cache
        if flag_key in self.local_cache:
            return self.local_cache[flag_key]

        # Check Redis
        flag_data = await self.redis.get(f"flag:{flag_key}")
        if flag_data:
            import json
            flag = json.loads(flag_data)
            self.local_cache[flag_key] = flag
            return flag

        return None

    async def update_flag(
        self,
        flag_key: str,
        config: Dict
    ) -> None:
        """Update flag configuration."""
        import json
        await self.redis.set(
            f"flag:{flag_key}",
            json.dumps(config)
        )
        # Invalidate local cache
        self.local_cache.pop(flag_key, None)

        # Publish update event
        await self.redis.publish(
            "flag_updates",
            json.dumps({"flag": flag_key, "action": "updated"})
        )
```

### FastAPI Integration

```python
# app/api/dependencies.py
from fastapi import Depends, Request
from app.services.feature_flags import FeatureFlagService, FlagContext

async def get_flag_context(request: Request) -> FlagContext:
    """Build flag context from request."""
    user = getattr(request.state, "user", None)

    return FlagContext(
        user_id=user.id if user else None,
        org_id=user.organization_id if user else None,
        plan=user.plan if user else None,
        email=user.email if user else None,
        attributes={
            "ip": request.client.host,
            "user_agent": request.headers.get("user-agent"),
        }
    )


def feature_flag(flag_key: str, default: bool = False):
    """Dependency for checking feature flags."""
    async def check_flag(
        flag_service: FeatureFlagService = Depends(),
        context: FlagContext = Depends(get_flag_context)
    ) -> bool:
        return await flag_service.is_enabled(flag_key, context, default)

    return Depends(check_flag)


# Usage in routes
@router.get("/agents/builder")
async def agent_builder(
    new_builder_enabled: bool = feature_flag("new_agent_builder"),
):
    if new_builder_enabled:
        return {"builder": "v2"}
    return {"builder": "v1"}
```

### Decorator Pattern

```python
# app/core/decorators.py
from functools import wraps

def requires_feature(flag_key: str, fallback=None):
    """Decorator to require a feature flag."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get flag service and context from request
            request = kwargs.get("request")
            flag_service = request.app.state.flag_service
            context = await get_flag_context(request)

            if await flag_service.is_enabled(flag_key, context):
                return await func(*args, **kwargs)
            elif fallback:
                return fallback
            else:
                raise HTTPException(
                    status_code=404,
                    detail="Feature not available"
                )

        return wrapper
    return decorator


# Usage
@router.post("/agents/{agent_id}/collaborate")
@requires_feature("a2a_protocol")
async def agent_collaboration(agent_id: str, request: Request):
    # Only accessible if a2a_protocol flag is enabled
    pass
```

---

## Flag Categories

### Release Flags

Control feature releases.

| Flag | Purpose | Default | Cleanup |
|------|---------|---------|---------|
| `new_agent_builder` | New agent creation UI | Off | After 100% rollout |
| `streaming_v2` | Enhanced streaming | Off | After 100% rollout |
| `marketplace_v2` | New marketplace UI | Off | After 100% rollout |

### Ops Flags

Control operational behavior.

| Flag | Purpose | Default |
|------|---------|---------|
| `disable_agent_execution` | Kill switch for executions | Off |
| `maintenance_mode` | Enable maintenance page | Off |
| `read_only_mode` | Disable writes | Off |

### Experiment Flags

A/B testing and experiments.

| Flag | Purpose | Variants |
|------|---------|----------|
| `pricing_page_variant` | Pricing page A/B test | control, variant_a, variant_b |
| `onboarding_flow` | Onboarding experiment | classic, guided, interactive |

### Permission Flags

Feature access by plan.

| Flag | Purpose | Targeting |
|------|---------|-----------|
| `enterprise_analytics` | Advanced analytics | Enterprise plan |
| `custom_integrations` | Custom integration builder | Team+ plans |
| `white_label` | White labeling | Enterprise only |

---

## Management UI

### Admin Dashboard Schema

```typescript
// types/feature-flags.ts
interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'percentage' | 'targeted' | 'multivariate';
  enabled: boolean;
  value?: any;
  percentage?: number;
  variants?: Variant[];
  rules?: TargetingRule[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

interface Variant {
  key: string;
  name: string;
  weight: number;
}

interface TargetingRule {
  id: string;
  attribute: string;
  operator: 'in' | 'not_in' | 'equals' | 'contains' | 'starts_with' | 'ends_with';
  values: string[];
}
```

### API Endpoints

```python
# app/api/admin/feature_flags.py
from fastapi import APIRouter, Depends
from app.auth import require_admin

router = APIRouter(prefix="/admin/flags", tags=["admin"])

@router.get("")
@require_admin
async def list_flags(
    tag: Optional[str] = None,
    enabled_only: bool = False
):
    """List all feature flags."""
    flags = await flag_repository.list(tag=tag, enabled_only=enabled_only)
    return {"flags": flags}

@router.post("")
@require_admin
async def create_flag(flag: CreateFlagRequest):
    """Create a new feature flag."""
    created = await flag_repository.create(flag)
    await audit_log.record("flag_created", flag_key=flag.key)
    return created

@router.patch("/{flag_key}")
@require_admin
async def update_flag(flag_key: str, updates: UpdateFlagRequest):
    """Update a feature flag."""
    updated = await flag_repository.update(flag_key, updates)
    await audit_log.record("flag_updated", flag_key=flag_key, changes=updates)
    return updated

@router.post("/{flag_key}/toggle")
@require_admin
async def toggle_flag(flag_key: str):
    """Toggle flag enabled state."""
    flag = await flag_repository.get(flag_key)
    updated = await flag_repository.update(flag_key, {"enabled": not flag.enabled})
    await audit_log.record("flag_toggled", flag_key=flag_key, enabled=updated.enabled)
    return updated

@router.delete("/{flag_key}")
@require_admin
async def delete_flag(flag_key: str):
    """Delete (archive) a feature flag."""
    await flag_repository.archive(flag_key)
    await audit_log.record("flag_archived", flag_key=flag_key)
    return {"status": "archived"}
```

---

## SDK Integration

### Python SDK

```python
# agentplatform/flags.py
class FeatureFlags:
    """Client-side feature flag evaluation."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self._flags: Dict[str, Any] = {}
        self._last_fetch = 0

    async def initialize(self):
        """Fetch initial flag configuration."""
        await self._fetch_flags()

    async def is_enabled(
        self,
        flag_key: str,
        context: Optional[Dict] = None,
        default: bool = False
    ) -> bool:
        """Check if flag is enabled."""
        await self._ensure_fresh()
        flag = self._flags.get(flag_key)
        if not flag:
            return default
        return self._evaluate(flag, context)

    async def _fetch_flags(self):
        """Fetch flags from server."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/api/v1/flags",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            self._flags = response.json()["flags"]
            self._last_fetch = time.time()

    async def _ensure_fresh(self):
        """Ensure flags are fresh."""
        if time.time() - self._last_fetch > 60:
            await self._fetch_flags()
```

### JavaScript SDK

```typescript
// @agentplatform/flags
export class FeatureFlags {
  private flags: Map<string, Flag> = new Map();
  private context: FlagContext;

  constructor(
    private apiKey: string,
    context?: Partial<FlagContext>
  ) {
    this.context = { ...defaultContext, ...context };
  }

  async initialize(): Promise<void> {
    await this.fetchFlags();
    this.startPolling();
  }

  isEnabled(flagKey: string, defaultValue = false): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag || !flag.enabled) return defaultValue;
    return this.evaluate(flag);
  }

  getVariant(flagKey: string, defaultValue = 'control'): string {
    const flag = this.flags.get(flagKey);
    if (!flag || !flag.enabled) return defaultValue;
    return this.evaluateVariant(flag);
  }

  // React hook
  static useFeatureFlag(flagKey: string, defaultValue = false): boolean {
    const [enabled, setEnabled] = useState(defaultValue);
    const flags = useContext(FeatureFlagContext);

    useEffect(() => {
      setEnabled(flags.isEnabled(flagKey, defaultValue));
    }, [flagKey, flags]);

    return enabled;
  }
}

// Usage in React
function AgentBuilder() {
  const newBuilderEnabled = useFeatureFlag('new_agent_builder');

  if (newBuilderEnabled) {
    return <NewAgentBuilder />;
  }
  return <ClassicAgentBuilder />;
}
```

---

## Lifecycle Management

### Flag Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Created   │────►│   Testing   │────►│   Rollout   │────►│  Cleanup    │
│  (0% users) │     │  (Internal) │     │ (Gradual %) │     │  (Remove)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Rollout Strategy

```yaml
# Example rollout plan
flag: new_agent_builder
schedule:
  - date: 2024-01-15
    action: enable_internal
    percentage: 0
    targeting:
      - attribute: email
        operator: ends_with
        values: ["@agentplatform.com"]

  - date: 2024-01-17
    action: beta_users
    percentage: 0
    targeting:
      - attribute: is_beta
        operator: equals
        values: [true]

  - date: 2024-01-22
    action: rollout_10
    percentage: 10

  - date: 2024-01-29
    action: rollout_50
    percentage: 50

  - date: 2024-02-05
    action: rollout_100
    percentage: 100

  - date: 2024-02-19
    action: cleanup
    notes: "Remove flag, feature is GA"
```

### Cleanup Process

```markdown
## Flag Cleanup Checklist

### Before Removal
- [ ] Flag at 100% for 2+ weeks
- [ ] No incidents related to feature
- [ ] Metrics show stable performance
- [ ] Product team approval

### Code Changes
- [ ] Remove flag checks from code
- [ ] Remove fallback/old code path
- [ ] Update tests
- [ ] Update documentation

### After Removal
- [ ] Archive flag in system
- [ ] Update changelog
- [ ] Notify team
```

---

## Best Practices

### Naming Convention

```
{scope}_{feature}_{variant}

Examples:
- release_new_builder
- ops_maintenance_mode
- exp_pricing_variant_a
- perm_enterprise_analytics
```

### DO

- Use flags for risky deployments
- Clean up flags after rollout
- Document flag purpose and ownership
- Monitor flag usage and evaluation
- Use targeting for beta testing

### DON'T

- Leave flags indefinitely (tech debt)
- Use flags for config that rarely changes
- Create deeply nested flag conditions
- Forget to handle flag-off state
- Skip testing both flag states
