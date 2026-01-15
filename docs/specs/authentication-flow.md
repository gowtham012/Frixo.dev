# Authentication Flow

## Overview

This document defines the authentication and authorization flows for the AI Agent Platform. We use JWT-based authentication with refresh tokens for web/mobile clients and API keys for server-to-server communication.

---

## Authentication Methods

| Method | Use Case | Token Lifetime |
|--------|----------|----------------|
| JWT Access Token | Web/Mobile app requests | 15 minutes |
| JWT Refresh Token | Renew access tokens | 7 days |
| API Key | SDK, server-to-server | Until revoked |
| OAuth (Third-party) | Social login | N/A |

---

## JWT Token Structure

### Access Token Payload

```json
{
  "sub": "usr_abc123",
  "email": "user@example.com",
  "org_id": "org_xyz789",
  "role": "admin",
  "permissions": ["agents:read", "agents:write", "marketplace:read"],
  "iat": 1704970800,
  "exp": 1704971700,
  "jti": "tok_unique_id"
}
```

### Claims

| Claim | Description |
|-------|-------------|
| `sub` | User ID (subject) |
| `email` | User email |
| `org_id` | Organization ID |
| `role` | User role (admin, member, viewer) |
| `permissions` | Array of permission scopes |
| `iat` | Issued at timestamp |
| `exp` | Expiration timestamp |
| `jti` | Unique token identifier |

---

## Registration Flow

```
┌─────────┐          ┌─────────┐          ┌──────────┐
│ Client  │          │   API   │          │ Database │
└────┬────┘          └────┬────┘          └────┬─────┘
     │                    │                    │
     │ POST /auth/register│                    │
     │ {email, password,  │                    │
     │  name}             │                    │
     │───────────────────>│                    │
     │                    │                    │
     │                    │ Check email exists │
     │                    │───────────────────>│
     │                    │<───────────────────│
     │                    │                    │
     │                    │ Hash password      │
     │                    │ (bcrypt, cost=12)  │
     │                    │                    │
     │                    │ Create user        │
     │                    │───────────────────>│
     │                    │<───────────────────│
     │                    │                    │
     │                    │ Create default org │
     │                    │───────────────────>│
     │                    │<───────────────────│
     │                    │                    │
     │                    │ Generate tokens    │
     │                    │                    │
     │ 201 Created        │                    │
     │ {user, tokens}     │                    │
     │<───────────────────│                    │
     │                    │                    │
```

### Implementation

```python
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def register(data: RegisterRequest) -> AuthResponse:
    # 1. Check if email exists
    existing = await user_repo.get_by_email(data.email)
    if existing:
        raise HTTPException(400, "Email already registered")

    # 2. Hash password
    hashed = pwd_context.hash(data.password)

    # 3. Create user
    user = await user_repo.create(
        email=data.email,
        password_hash=hashed,
        name=data.name,
    )

    # 4. Create default organization
    org = await org_repo.create(
        name=f"{data.name}'s Workspace",
        owner_id=user.id,
    )

    # 5. Generate tokens
    access_token = create_access_token(user, org)
    refresh_token = create_refresh_token(user)

    return AuthResponse(
        user=UserResponse.from_orm(user),
        tokens=TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        ),
    )
```

---

## Login Flow

```
┌─────────┐          ┌─────────┐          ┌──────────┐
│ Client  │          │   API   │          │ Database │
└────┬────┘          └────┬────┘          └────┬─────┘
     │                    │                    │
     │ POST /auth/login   │                    │
     │ {email, password}  │                    │
     │───────────────────>│                    │
     │                    │                    │
     │                    │ Get user by email  │
     │                    │───────────────────>│
     │                    │<───────────────────│
     │                    │                    │
     │                    │ Verify password    │
     │                    │ (bcrypt.verify)    │
     │                    │                    │
     │                    │ Update last_login  │
     │                    │───────────────────>│
     │                    │<───────────────────│
     │                    │                    │
     │                    │ Generate tokens    │
     │                    │                    │
     │ 200 OK             │                    │
     │ {user, tokens}     │                    │
     │<───────────────────│                    │
     │                    │                    │
```

### Rate Limiting

- 5 failed attempts → 15 minute lockout
- Track by IP + email combination

```python
async def login(data: LoginRequest, request: Request) -> AuthResponse:
    # 1. Check rate limit
    key = f"login_attempts:{request.client.host}:{data.email}"
    attempts = await redis.get(key) or 0

    if int(attempts) >= 5:
        raise HTTPException(429, "Too many attempts. Try again in 15 minutes.")

    # 2. Get user
    user = await user_repo.get_by_email(data.email)
    if not user:
        await redis.incr(key)
        await redis.expire(key, 900)  # 15 minutes
        raise HTTPException(401, "Invalid credentials")

    # 3. Verify password
    if not pwd_context.verify(data.password, user.password_hash):
        await redis.incr(key)
        await redis.expire(key, 900)
        raise HTTPException(401, "Invalid credentials")

    # 4. Clear rate limit on success
    await redis.delete(key)

    # 5. Update last login
    await user_repo.update(user.id, last_login_at=datetime.utcnow())

    # 6. Generate tokens
    access_token = create_access_token(user, user.organization)
    refresh_token = create_refresh_token(user)

    return AuthResponse(user=user, tokens=TokenPair(...))
```

---

## Token Refresh Flow

```
┌─────────┐          ┌─────────┐          ┌───────┐
│ Client  │          │   API   │          │ Redis │
└────┬────┘          └────┬────┘          └───┬───┘
     │                    │                   │
     │ POST /auth/refresh │                   │
     │ {refresh_token}    │                   │
     │───────────────────>│                   │
     │                    │                   │
     │                    │ Verify token      │
     │                    │ (signature, exp)  │
     │                    │                   │
     │                    │ Check blacklist   │
     │                    │──────────────────>│
     │                    │<──────────────────│
     │                    │                   │
     │                    │ Generate new      │
     │                    │ access token      │
     │                    │                   │
     │ 200 OK             │                   │
     │ {access_token}     │                   │
     │<───────────────────│                   │
     │                    │                   │
```

### Implementation

```python
async def refresh_token(data: RefreshRequest) -> TokenResponse:
    try:
        # 1. Decode refresh token
        payload = jwt.decode(
            data.refresh_token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        # 2. Check if token is blacklisted
        jti = payload.get("jti")
        if await redis.exists(f"blacklist:{jti}"):
            raise HTTPException(401, "Token has been revoked")

        # 3. Get user
        user_id = payload.get("sub")
        user = await user_repo.get(user_id)
        if not user:
            raise HTTPException(401, "User not found")

        # 4. Generate new access token
        access_token = create_access_token(user, user.organization)

        return TokenResponse(
            access_token=access_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    except JWTError:
        raise HTTPException(401, "Invalid refresh token")
```

---

## Logout Flow

```
┌─────────┐          ┌─────────┐          ┌───────┐
│ Client  │          │   API   │          │ Redis │
└────┬────┘          └────┬────┘          └───┬───┘
     │                    │                   │
     │ POST /auth/logout  │                   │
     │ Authorization:     │                   │
     │ Bearer <token>     │                   │
     │───────────────────>│                   │
     │                    │                   │
     │                    │ Blacklist token   │
     │                    │──────────────────>│
     │                    │<──────────────────│
     │                    │                   │
     │ 204 No Content     │                   │
     │<───────────────────│                   │
     │                    │                   │
```

### Implementation

```python
async def logout(token: str = Depends(get_current_token)) -> None:
    # Decode token to get jti and exp
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    jti = payload.get("jti")
    exp = payload.get("exp")

    # Calculate TTL (time until token expires)
    ttl = exp - int(datetime.utcnow().timestamp())

    # Add to blacklist with TTL
    if ttl > 0:
        await redis.setex(f"blacklist:{jti}", ttl, "1")
```

---

## API Key Authentication

### API Key Format

```
ap_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
ap_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- Prefix: `ap_live_` (production) or `ap_test_` (sandbox)
- 32 random alphanumeric characters

### API Key Storage

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,  -- Store hash, not plain key
    key_prefix VARCHAR(10) NOT NULL,  -- For identification: "ap_live_xx"
    scopes JSONB NOT NULL DEFAULT '[]',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### API Key Authentication Flow

```python
async def authenticate_api_key(api_key: str) -> User:
    # 1. Extract prefix for lookup
    prefix = api_key[:12]  # "ap_live_xxxx"

    # 2. Find key by prefix
    key_record = await api_key_repo.get_by_prefix(prefix)
    if not key_record:
        raise HTTPException(401, "Invalid API key")

    # 3. Verify full key hash
    if not pwd_context.verify(api_key, key_record.key_hash):
        raise HTTPException(401, "Invalid API key")

    # 4. Check expiration
    if key_record.expires_at and key_record.expires_at < datetime.utcnow():
        raise HTTPException(401, "API key expired")

    # 5. Update last used
    await api_key_repo.update(key_record.id, last_used_at=datetime.utcnow())

    # 6. Return user
    return await user_repo.get(key_record.user_id)
```

---

## OAuth2 Social Login

### Supported Providers

| Provider | Scopes |
|----------|--------|
| Google | `openid`, `email`, `profile` |
| GitHub | `user:email`, `read:user` |

### OAuth Flow

```
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐
│ Client  │     │   API   │     │ Provider │     │ Database │
└────┬────┘     └────┬────┘     └────┬─────┘     └────┬─────┘
     │               │               │                │
     │ GET /auth/    │               │                │
     │ oauth/google  │               │                │
     │──────────────>│               │                │
     │               │               │                │
     │ 302 Redirect  │               │                │
     │ to Google     │               │                │
     │<──────────────│               │                │
     │               │               │                │
     │ User authorizes at Google     │                │
     │──────────────────────────────>│                │
     │               │               │                │
     │ Redirect with code            │                │
     │<──────────────────────────────│                │
     │               │               │                │
     │ GET /auth/oauth/callback      │                │
     │ ?code=xxx&state=yyy           │                │
     │──────────────>│               │                │
     │               │               │                │
     │               │ Exchange code │                │
     │               │──────────────>│                │
     │               │<──────────────│                │
     │               │ (access token)│                │
     │               │               │                │
     │               │ Get user info │                │
     │               │──────────────>│                │
     │               │<──────────────│                │
     │               │               │                │
     │               │ Find/create user               │
     │               │───────────────────────────────>│
     │               │<───────────────────────────────│
     │               │               │                │
     │ 302 Redirect  │               │                │
     │ with tokens   │               │                │
     │<──────────────│               │                │
     │               │               │                │
```

### Implementation

```python
from authlib.integrations.starlette_client import OAuth

oauth = OAuth()
oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/oauth/google")
async def oauth_google(request: Request):
    redirect_uri = request.url_for("oauth_callback", provider="google")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/oauth/callback/{provider}")
async def oauth_callback(provider: str, request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    # Find or create user
    user = await user_repo.get_by_email(user_info["email"])
    if not user:
        user = await user_repo.create(
            email=user_info["email"],
            name=user_info.get("name"),
            oauth_provider=provider,
            oauth_id=user_info["sub"],
        )

    # Generate tokens
    access_token = create_access_token(user, user.organization)
    refresh_token = create_refresh_token(user)

    # Redirect to frontend with tokens
    return RedirectResponse(
        f"{settings.FRONTEND_URL}/auth/callback?"
        f"access_token={access_token}&refresh_token={refresh_token}"
    )
```

---

## Permission System

### Roles

| Role | Description |
|------|-------------|
| `owner` | Full access, can delete organization |
| `admin` | Full access except billing |
| `member` | Can create/edit own agents |
| `viewer` | Read-only access |

### Permission Scopes

```python
class Permission(str, Enum):
    # Agents
    AGENTS_READ = "agents:read"
    AGENTS_WRITE = "agents:write"
    AGENTS_DELETE = "agents:delete"
    AGENTS_RUN = "agents:run"

    # Integrations
    INTEGRATIONS_READ = "integrations:read"
    INTEGRATIONS_WRITE = "integrations:write"

    # Marketplace
    MARKETPLACE_READ = "marketplace:read"
    MARKETPLACE_SELL = "marketplace:sell"
    MARKETPLACE_BUY = "marketplace:buy"

    # Organization
    ORG_READ = "org:read"
    ORG_WRITE = "org:write"
    ORG_MEMBERS = "org:members"

    # Billing
    BILLING_READ = "billing:read"
    BILLING_WRITE = "billing:write"
```

### Role-Permission Mapping

```python
ROLE_PERMISSIONS = {
    "owner": [
        Permission.AGENTS_READ, Permission.AGENTS_WRITE, Permission.AGENTS_DELETE, Permission.AGENTS_RUN,
        Permission.INTEGRATIONS_READ, Permission.INTEGRATIONS_WRITE,
        Permission.MARKETPLACE_READ, Permission.MARKETPLACE_SELL, Permission.MARKETPLACE_BUY,
        Permission.ORG_READ, Permission.ORG_WRITE, Permission.ORG_MEMBERS,
        Permission.BILLING_READ, Permission.BILLING_WRITE,
    ],
    "admin": [
        Permission.AGENTS_READ, Permission.AGENTS_WRITE, Permission.AGENTS_DELETE, Permission.AGENTS_RUN,
        Permission.INTEGRATIONS_READ, Permission.INTEGRATIONS_WRITE,
        Permission.MARKETPLACE_READ, Permission.MARKETPLACE_SELL, Permission.MARKETPLACE_BUY,
        Permission.ORG_READ, Permission.ORG_WRITE, Permission.ORG_MEMBERS,
        Permission.BILLING_READ,
    ],
    "member": [
        Permission.AGENTS_READ, Permission.AGENTS_WRITE, Permission.AGENTS_RUN,
        Permission.INTEGRATIONS_READ,
        Permission.MARKETPLACE_READ, Permission.MARKETPLACE_BUY,
        Permission.ORG_READ,
        Permission.BILLING_READ,
    ],
    "viewer": [
        Permission.AGENTS_READ,
        Permission.INTEGRATIONS_READ,
        Permission.MARKETPLACE_READ,
        Permission.ORG_READ,
    ],
}
```

### Permission Checking

```python
from functools import wraps

def require_permission(permission: Permission):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_user), **kwargs):
            if permission not in current_user.permissions:
                raise HTTPException(403, f"Missing permission: {permission}")
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Usage
@router.post("/agents")
@require_permission(Permission.AGENTS_WRITE)
async def create_agent(data: CreateAgentRequest, current_user: User):
    ...
```

---

## Multi-Factor Authentication (MFA)

### TOTP Setup Flow

```
┌─────────┐          ┌─────────┐          ┌──────────┐
│ Client  │          │   API   │          │ Database │
└────┬────┘          └────┬────┘          └────┬─────┘
     │                    │                    │
     │ POST /auth/mfa/    │                    │
     │ setup              │                    │
     │───────────────────>│                    │
     │                    │                    │
     │                    │ Generate secret    │
     │                    │ Store (encrypted)  │
     │                    │───────────────────>│
     │                    │<───────────────────│
     │                    │                    │
     │ 200 OK             │                    │
     │ {secret, qr_url}   │                    │
     │<───────────────────│                    │
     │                    │                    │
     │ User scans QR      │                    │
     │                    │                    │
     │ POST /auth/mfa/    │                    │
     │ verify {code}      │                    │
     │───────────────────>│                    │
     │                    │                    │
     │                    │ Verify TOTP code   │
     │                    │ Enable MFA         │
     │                    │───────────────────>│
     │                    │<───────────────────│
     │                    │                    │
     │ 200 OK             │                    │
     │ {backup_codes}     │                    │
     │<───────────────────│                    │
     │                    │                    │
```

### Login with MFA

```python
async def login_with_mfa(data: LoginRequest) -> AuthResponse | MFARequiredResponse:
    # Normal login verification...
    user = await verify_credentials(data.email, data.password)

    # Check if MFA is enabled
    if user.mfa_enabled:
        # Generate temporary token for MFA step
        mfa_token = create_mfa_token(user.id)
        return MFARequiredResponse(
            mfa_required=True,
            mfa_token=mfa_token,
        )

    # No MFA, return tokens
    return AuthResponse(user=user, tokens=generate_tokens(user))

async def verify_mfa(data: MFAVerifyRequest) -> AuthResponse:
    # Verify MFA token
    payload = jwt.decode(data.mfa_token, ...)
    user_id = payload["sub"]

    user = await user_repo.get(user_id)

    # Verify TOTP code
    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(data.code):
        raise HTTPException(401, "Invalid MFA code")

    # Return full tokens
    return AuthResponse(user=user, tokens=generate_tokens(user))
```

---

## Security Headers

```python
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response
```

---

## Token Utilities

```python
from jose import jwt
from datetime import datetime, timedelta
import secrets

def create_access_token(user: User, org: Organization) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "org_id": str(org.id),
        "role": user.role,
        "permissions": get_permissions_for_role(user.role),
        "iat": datetime.utcnow(),
        "exp": expire,
        "jti": secrets.token_urlsafe(16),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(user: User) -> str:
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user.id),
        "type": "refresh",
        "iat": datetime.utcnow(),
        "exp": expire,
        "jti": secrets.token_urlsafe(16),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def generate_api_key() -> tuple[str, str]:
    """Returns (plain_key, hashed_key)"""
    random_part = secrets.token_urlsafe(24)
    plain_key = f"ap_live_{random_part}"
    hashed_key = pwd_context.hash(plain_key)
    return plain_key, hashed_key
```
