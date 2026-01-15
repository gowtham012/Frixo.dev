# Error Handling Standards

## Overview

This document defines the error handling strategy for the AI Agent Platform, ensuring consistent error responses, proper logging, and graceful degradation.

---

## Error Response Format

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "AGENT_NOT_FOUND",
    "message": "The requested agent does not exist",
    "details": null
  },
  "meta": {
    "request_id": "req_abc123def456",
    "timestamp": "2026-01-11T10:30:00Z"
  }
}
```

### Validation Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "invalid_format"
      },
      {
        "field": "name",
        "message": "Name must be at least 2 characters",
        "code": "min_length"
      }
    ]
  },
  "meta": {
    "request_id": "req_abc123def456",
    "timestamp": "2026-01-11T10:30:00Z"
  }
}
```

---

## Error Codes

### HTTP Status Code Mapping

| HTTP Status | Error Category | When to Use |
|-------------|---------------|-------------|
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Valid auth, insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists, state conflict |
| 422 | Unprocessable | Business logic errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Unexpected server errors |
| 502 | Bad Gateway | External service errors |
| 503 | Service Unavailable | System overload, maintenance |

### Application Error Codes

```python
class ErrorCode(str, Enum):
    # Authentication (AUTH_)
    AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS"
    AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED"
    AUTH_TOKEN_INVALID = "AUTH_TOKEN_INVALID"
    AUTH_MFA_REQUIRED = "AUTH_MFA_REQUIRED"
    AUTH_MFA_INVALID = "AUTH_MFA_INVALID"

    # Authorization (AUTHZ_)
    AUTHZ_PERMISSION_DENIED = "AUTHZ_PERMISSION_DENIED"
    AUTHZ_RESOURCE_ACCESS_DENIED = "AUTHZ_RESOURCE_ACCESS_DENIED"

    # Validation (VAL_)
    VAL_INVALID_INPUT = "VAL_INVALID_INPUT"
    VAL_MISSING_FIELD = "VAL_MISSING_FIELD"
    VAL_INVALID_FORMAT = "VAL_INVALID_FORMAT"

    # Resource (RES_)
    RES_NOT_FOUND = "RES_NOT_FOUND"
    RES_ALREADY_EXISTS = "RES_ALREADY_EXISTS"
    RES_CONFLICT = "RES_CONFLICT"

    # Agent (AGENT_)
    AGENT_NOT_FOUND = "AGENT_NOT_FOUND"
    AGENT_EXECUTION_FAILED = "AGENT_EXECUTION_FAILED"
    AGENT_EXECUTION_TIMEOUT = "AGENT_EXECUTION_TIMEOUT"
    AGENT_INVALID_CONFIG = "AGENT_INVALID_CONFIG"

    # Integration (INT_)
    INT_NOT_CONNECTED = "INT_NOT_CONNECTED"
    INT_AUTH_FAILED = "INT_AUTH_FAILED"
    INT_RATE_LIMITED = "INT_RATE_LIMITED"
    INT_SERVICE_ERROR = "INT_SERVICE_ERROR"

    # Billing (BILL_)
    BILL_PAYMENT_FAILED = "BILL_PAYMENT_FAILED"
    BILL_QUOTA_EXCEEDED = "BILL_QUOTA_EXCEEDED"
    BILL_SUBSCRIPTION_REQUIRED = "BILL_SUBSCRIPTION_REQUIRED"

    # Rate Limit (RATE_)
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"

    # System (SYS_)
    SYS_INTERNAL_ERROR = "SYS_INTERNAL_ERROR"
    SYS_SERVICE_UNAVAILABLE = "SYS_SERVICE_UNAVAILABLE"
    SYS_EXTERNAL_SERVICE_ERROR = "SYS_EXTERNAL_SERVICE_ERROR"
```

---

## Exception Hierarchy

```python
# app/core/exceptions.py

class AgentPlatformError(Exception):
    """Base exception for all platform errors."""

    def __init__(
        self,
        message: str,
        code: ErrorCode = ErrorCode.SYS_INTERNAL_ERROR,
        status_code: int = 500,
        details: list | None = None,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(message)


# Authentication Errors
class AuthenticationError(AgentPlatformError):
    """Authentication failed."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            code=ErrorCode.AUTH_INVALID_CREDENTIALS,
            status_code=401,
        )


class TokenExpiredError(AuthenticationError):
    """Token has expired."""

    def __init__(self):
        super().__init__(message="Token has expired")
        self.code = ErrorCode.AUTH_TOKEN_EXPIRED


class TokenInvalidError(AuthenticationError):
    """Token is invalid."""

    def __init__(self):
        super().__init__(message="Invalid token")
        self.code = ErrorCode.AUTH_TOKEN_INVALID


# Authorization Errors
class AuthorizationError(AgentPlatformError):
    """Authorization failed."""

    def __init__(self, message: str = "Permission denied"):
        super().__init__(
            message=message,
            code=ErrorCode.AUTHZ_PERMISSION_DENIED,
            status_code=403,
        )


# Resource Errors
class NotFoundError(AgentPlatformError):
    """Resource not found."""

    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} not found: {identifier}",
            code=ErrorCode.RES_NOT_FOUND,
            status_code=404,
        )


class AlreadyExistsError(AgentPlatformError):
    """Resource already exists."""

    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} already exists: {identifier}",
            code=ErrorCode.RES_ALREADY_EXISTS,
            status_code=409,
        )


# Validation Errors
class ValidationError(AgentPlatformError):
    """Validation failed."""

    def __init__(self, message: str, details: list | None = None):
        super().__init__(
            message=message,
            code=ErrorCode.VAL_INVALID_INPUT,
            status_code=400,
            details=details,
        )


# Agent Errors
class AgentNotFoundError(NotFoundError):
    """Agent not found."""

    def __init__(self, agent_id: str):
        super().__init__("Agent", agent_id)
        self.code = ErrorCode.AGENT_NOT_FOUND


class AgentExecutionError(AgentPlatformError):
    """Agent execution failed."""

    def __init__(self, message: str, details: list | None = None):
        super().__init__(
            message=message,
            code=ErrorCode.AGENT_EXECUTION_FAILED,
            status_code=422,
            details=details,
        )


class AgentTimeoutError(AgentPlatformError):
    """Agent execution timed out."""

    def __init__(self, timeout_ms: int):
        super().__init__(
            message=f"Agent execution timed out after {timeout_ms}ms",
            code=ErrorCode.AGENT_EXECUTION_TIMEOUT,
            status_code=408,
        )


# Integration Errors
class IntegrationError(AgentPlatformError):
    """Integration error."""

    def __init__(self, provider: str, message: str):
        super().__init__(
            message=f"Integration error ({provider}): {message}",
            code=ErrorCode.INT_SERVICE_ERROR,
            status_code=502,
        )


class IntegrationRateLimitError(IntegrationError):
    """Integration rate limit exceeded."""

    def __init__(self, provider: str, retry_after: int | None = None):
        super().__init__(provider, "Rate limit exceeded")
        self.code = ErrorCode.INT_RATE_LIMITED
        self.status_code = 429
        self.retry_after = retry_after


# Billing Errors
class QuotaExceededError(AgentPlatformError):
    """Quota exceeded."""

    def __init__(self, resource: str, limit: int):
        super().__init__(
            message=f"{resource} quota exceeded. Limit: {limit}",
            code=ErrorCode.BILL_QUOTA_EXCEEDED,
            status_code=402,
        )


# Rate Limit Errors
class RateLimitExceededError(AgentPlatformError):
    """Rate limit exceeded."""

    def __init__(self, retry_after: int):
        super().__init__(
            message=f"Rate limit exceeded. Retry after {retry_after} seconds",
            code=ErrorCode.RATE_LIMIT_EXCEEDED,
            status_code=429,
        )
        self.retry_after = retry_after
```

---

## Exception Handler

```python
# app/core/exception_handler.py

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import structlog

logger = structlog.get_logger()


async def platform_exception_handler(
    request: Request, exc: AgentPlatformError
) -> JSONResponse:
    """Handle platform-specific exceptions."""

    # Log error
    logger.error(
        "platform_error",
        error_code=exc.code,
        error_message=exc.message,
        status_code=exc.status_code,
        request_id=request.state.request_id,
        path=request.url.path,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
            "meta": {
                "request_id": request.state.request_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic validation errors."""

    details = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        details.append({
            "field": field,
            "message": error["msg"],
            "code": error["type"],
        })

    logger.warning(
        "validation_error",
        request_id=request.state.request_id,
        path=request.url.path,
        errors=details,
    )

    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": ErrorCode.VAL_INVALID_INPUT,
                "message": "Validation error",
                "details": details,
            },
            "meta": {
                "request_id": request.state.request_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
        },
    )


async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Handle unhandled exceptions."""

    # Log full exception for debugging
    logger.exception(
        "unhandled_exception",
        request_id=request.state.request_id,
        path=request.url.path,
        exc_info=exc,
    )

    # Don't expose internal details to client
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": ErrorCode.SYS_INTERNAL_ERROR,
                "message": "An unexpected error occurred",
                "details": None,
            },
            "meta": {
                "request_id": request.state.request_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
        },
    )


# Register handlers
def setup_exception_handlers(app: FastAPI):
    app.add_exception_handler(AgentPlatformError, platform_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
```

---

## Using Exceptions

### In Services

```python
# app/services/agent_service.py

async def get_agent(agent_id: str, user: User) -> Agent:
    # Find agent
    agent = await agent_repo.get(agent_id)
    if not agent:
        raise AgentNotFoundError(agent_id)

    # Check permissions
    if agent.organization_id != user.organization_id:
        raise AuthorizationError("You don't have access to this agent")

    return agent


async def run_agent(agent_id: str, input_data: dict, user: User) -> ExecutionResult:
    agent = await get_agent(agent_id, user)

    # Check quota
    usage = await billing_service.get_usage(user.organization_id)
    if usage.executions >= usage.limit:
        raise QuotaExceededError("executions", usage.limit)

    try:
        result = await agent_executor.run(agent, input_data)
        return result
    except TimeoutError:
        raise AgentTimeoutError(agent.config.timeout_ms)
    except LLMError as e:
        raise AgentExecutionError(f"LLM error: {e.message}")
```

### In API Endpoints

```python
# app/api/v1/agents.py

@router.get("/{agent_id}")
async def get_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user),
):
    # Exceptions are automatically handled by exception handlers
    agent = await agent_service.get_agent(agent_id, current_user)
    return ApiResponse(success=True, data=AgentResponse.from_orm(agent))


@router.post("/{agent_id}/run")
async def run_agent(
    agent_id: str,
    request: RunAgentRequest,
    current_user: User = Depends(get_current_user),
):
    result = await agent_service.run_agent(agent_id, request.input, current_user)
    return ApiResponse(success=True, data=ExecutionResponse.from_orm(result))
```

---

## Error Recovery Patterns

### Retry with Backoff

```python
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type(IntegrationError),
)
async def call_external_api(url: str, data: dict) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data)
        response.raise_for_status()
        return response.json()
```

### Circuit Breaker

```python
from circuitbreaker import circuit

@circuit(failure_threshold=5, recovery_timeout=60)
async def call_linkedin_api(action: str, data: dict) -> dict:
    try:
        return await linkedin_client.make_request(action, data)
    except Exception as e:
        raise IntegrationError("linkedin", str(e))
```

### Graceful Degradation

```python
async def get_agent_with_stats(agent_id: str) -> AgentWithStats:
    agent = await agent_service.get_agent(agent_id)

    # Try to get stats, but don't fail if unavailable
    try:
        stats = await analytics_service.get_agent_stats(agent_id)
    except Exception as e:
        logger.warning("Failed to fetch agent stats", agent_id=agent_id, error=str(e))
        stats = None  # Return agent without stats

    return AgentWithStats(agent=agent, stats=stats)
```

---

## Frontend Error Handling

### API Client

```typescript
// lib/api.ts

class ApiError extends Error {
  code: string;
  status: number;
  details?: Array<{ field: string; message: string }>;

  constructor(response: ErrorResponse) {
    super(response.error.message);
    this.code = response.error.code;
    this.status = response.status;
    this.details = response.error.details;
  }
}

async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!data.success) {
    throw new ApiError(data);
  }

  return data.data;
}
```

### Error Handling in Components

```typescript
// hooks/use-agents.ts

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentRequest) =>
      apiClient<Agent>('/agents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agent created successfully');
    },
    onError: (error: ApiError) => {
      if (error.code === 'VAL_INVALID_INPUT') {
        // Show field-specific errors
        error.details?.forEach((detail) => {
          toast.error(`${detail.field}: ${detail.message}`);
        });
      } else if (error.code === 'BILL_QUOTA_EXCEEDED') {
        toast.error('Agent limit reached. Please upgrade your plan.');
      } else {
        toast.error(error.message);
      }
    },
  });
}
```

### Error Boundary

```typescript
// components/error-boundary.tsx

'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 text-center">
            <h2>Something went wrong</h2>
            <button onClick={() => this.setState({ hasError: false })}>
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## Best Practices

### DO

- Use specific exception types
- Include helpful error messages
- Log errors with context (request_id, user_id, etc.)
- Return consistent error response format
- Handle errors at the appropriate level
- Include retry-after headers for rate limits

### DON'T

- Expose internal error details to clients
- Catch and silence exceptions without logging
- Use generic exception types
- Include stack traces in production responses
- Log sensitive data (passwords, tokens)
