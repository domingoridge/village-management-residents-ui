# API Contract: Supabase Authentication

**Feature**: Dashboard Route Protection
**Provider**: Supabase Auth API
**Date**: 2025-10-16

## Overview

This document defines the contracts for Supabase Auth API endpoints used in the dashboard route protection feature. These are external APIs provided by Supabase, not custom application endpoints.

---

## 1. Get User (Session Validation)

**Endpoint**: `supabase.auth.getUser()`

**Purpose**: Validate current session and retrieve authenticated user

**Method**: SDK Method (wraps GET request to Supabase Auth)

**Authentication**: Uses JWT from httpOnly cookie

**Request**:

```typescript
const { data, error } = await supabase.auth.getUser();
```

**Response - Success**:

```typescript
{
  data: {
    user: {
      id: string              // UUID
      email: string
      email_confirmed_at: string | null
      phone: string | null
      created_at: string
      updated_at: string
      last_sign_in_at: string | null
      role: string
      user_metadata: Record<string, any>
      app_metadata: Record<string, any>
      aud: string
      confirmed_at: string | null
    }
  },
  error: null
}
```

**Response - No Session / Invalid Token**:

```typescript
{
  data: {
    user: null
  },
  error: null
}
```

**Response - Error**:

```typescript
{
  data: {
    user: null
  },
  error: {
    message: string
    status: number
  }
}
```

**Side Effects**:

- Validates JWT against Supabase Auth server
- Refreshes access token if near expiry
- Updates cookies with new tokens
- Returns null user if session invalid

**Usage in Feature**:

- Called in middleware on every request
- Determines authenticated state
- Drives redirect logic

**Performance**:

- Typical response time: 20-50ms
- Edge-optimized endpoint
- Minimal payload size

---

## 2. Sign In with Password

**Endpoint**: `supabase.auth.signInWithPassword()`

**Purpose**: Authenticate user with email/password credentials

**Method**: SDK Method (wraps POST request)

**Request**:

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: string,
  password: string,
});
```

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response - Success**:

```typescript
{
  data: {
    user: {
      id: string
      email: string
      // ... full user object
    },
    session: {
      access_token: string     // JWT
      refresh_token: string
      expires_in: number       // Seconds
      expires_at: number       // Unix timestamp
      token_type: "bearer"
      user: User              // Same as above
    }
  },
  error: null
}
```

**Response - Invalid Credentials**:

```typescript
{
  data: {
    user: null,
    session: null
  },
  error: {
    message: "Invalid login credentials",
    status: 400,
    code: "invalid_credentials"
  }
}
```

**Response - Email Not Confirmed**:

```typescript
{
  data: {
    user: null,
    session: null
  },
  error: {
    message: "Email not confirmed",
    status: 400,
    code: "email_not_confirmed"
  }
}
```

**Side Effects**:

- Creates new session if successful
- Sets httpOnly cookies with access/refresh tokens
- Updates `last_sign_in_at` timestamp
- Fires Supabase Auth webhook (if configured)

**Usage in Feature**:

- Called from login page form submission
- Success → redirect to intended destination
- Failure → show error message

**Validation**:

- Email must be valid format
- Password must be provided
- Account must exist and be confirmed

---

## 3. Sign Out

**Endpoint**: `supabase.auth.signOut()`

**Purpose**: End current user session

**Method**: SDK Method (wraps POST request)

**Request**:

```typescript
const { error } = await supabase.auth.signOut();
```

**Response - Success**:

```typescript
{
  error: null;
}
```

**Response - Error**:

```typescript
{
  error: {
    message: string,
    status: number
  }
}
```

**Side Effects**:

- Invalidates session on server
- Clears auth cookies
- Removes session from Supabase
- User becomes unauthenticated

**Usage in Feature**:

- Called from logout button/link
- After signout → redirect to `/auth/login`
- Middleware will detect no session

---

## 4. Session Refresh (Automatic)

**Endpoint**: Automatic via `getUser()` or explicit via `refreshSession()`

**Purpose**: Renew access token using refresh token

**Method**: SDK Method (internal to Supabase)

**Trigger**:

- Automatically during `getUser()` if token near expiry (< 5 minutes)
- Can be manually called via `supabase.auth.refreshSession()`

**Response - Success**:

```typescript
{
  data: {
    session: {
      access_token: string     // New JWT
      refresh_token: string    // Same or new
      expires_in: number
      expires_at: number
      token_type: "bearer"
      user: User
    }
  },
  error: null
}
```

**Response - Refresh Token Expired**:

```typescript
{
  data: {
    session: null
  },
  error: {
    message: "Refresh token expired",
    code: "invalid_refresh_token"
  }
}
```

**Side Effects**:

- Issues new access token
- May issue new refresh token (rotation)
- Updates cookies with new tokens
- Session remains active

**Usage in Feature**:

- Handled automatically by middleware via `getUser()`
- No explicit calls needed
- Keeps sessions alive for active users

---

## Error Codes

| Code                    | Status | Meaning                  | Action                        |
| ----------------------- | ------ | ------------------------ | ----------------------------- |
| `invalid_credentials`   | 400    | Wrong email/password     | Show error, allow retry       |
| `email_not_confirmed`   | 400    | Email needs verification | Show message with resend link |
| `invalid_refresh_token` | 401    | Refresh token expired    | Redirect to login             |
| `session_not_found`     | 401    | No active session        | Redirect to login             |
| `network_error`         | 500    | Network/server issue     | Show error, allow retry       |

---

## Security Considerations

### CSRF Protection

- Supabase uses httpOnly cookies + PKCE flow
- Cookies include `SameSite=Lax` attribute
- Middleware runs on same origin (no CORS issues)

### Token Security

- Access tokens: short-lived (1 hour default)
- Refresh tokens: long-lived (30 days default), rotated on use
- Tokens stored in httpOnly cookies (not accessible to JavaScript)
- All requests over HTTPS in production

### Rate Limiting

- Supabase enforces rate limits on auth endpoints
- Default: ~100 requests per minute per IP
- Exceeding limit returns 429 status
- Application should implement retry with backoff

### Open Redirect Prevention

- Always validate redirect URLs are internal
- Never redirect to arbitrary user-provided URLs
- Regex validation: `/^\/[a-zA-Z0-9\/_-]*$/`
- Fallback to `/dashboard` if validation fails

---

## Environment Variables

Required environment variables for Supabase client:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Notes**:

- `NEXT_PUBLIC_` prefix makes them available in browser and server
- Anon key is safe to expose (row-level security enforced)
- Never expose service role key in client code

---

## Cookie Structure

Supabase sets these cookies:

```
sb-<project-id>-auth-token          # Access token (JWT)
sb-<project-id>-auth-token.1        # Refresh token
sb-<project-id>-auth-token.2        # Additional token data (if large)
```

**Cookie Attributes**:

- `HttpOnly`: true (not accessible to JavaScript)
- `Secure`: true (HTTPS only in production)
- `SameSite`: Lax (CSRF protection)
- `Path`: /
- `Max-Age`: varies by token type

---

## Testing Considerations

### Mocking Supabase Client

For unit tests:

```typescript
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    }),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
};
```

### Test Scenarios

1. Valid session → returns user
2. No session → returns null user
3. Expired session → returns null user
4. Token near expiry → auto-refreshes
5. Invalid credentials → returns error
6. Network error → returns error

---

## References

- Supabase Auth API: https://supabase.com/docs/reference/javascript/auth-api
- Supabase SSR: https://supabase.com/docs/guides/auth/server-side/nextjs
- Auth Helpers: https://supabase.com/docs/guides/auth/auth-helpers
