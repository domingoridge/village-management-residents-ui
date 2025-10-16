# Data Model: Dashboard Route Protection

**Feature**: Dashboard Route Protection
**Branch**: fix/protected-routes
**Date**: 2025-10-16

## Overview

This feature relies primarily on Supabase's managed authentication system. The data model describes the entities involved in route protection and session management, though most are managed by Supabase rather than custom application code.

## Entities

### 1. User (Supabase Managed)

**Description**: Represents an authenticated user in the Supabase auth system.

**Managed By**: Supabase Auth (`auth.users` table)

**Key Attributes**:

- `id`: UUID - Unique identifier for the user
- `email`: string - User's email address
- `email_confirmed_at`: timestamp - When email was verified
- `created_at`: timestamp - Account creation time
- `last_sign_in_at`: timestamp - Most recent login
- `user_metadata`: JSON - Custom user properties (if needed)

**Usage in Feature**:

- Middleware checks for user existence via `getUser()`
- User presence determines authenticated state
- Used to allow/deny access to protected routes

**Relationships**:

- One User → Many Sessions (active and expired)

---

### 2. Session (Supabase Managed)

**Description**: Represents an active authentication session with JWT tokens.

**Managed By**: Supabase Auth (stored in httpOnly cookies)

**Key Attributes**:

- `access_token`: JWT string - Short-lived token for API access
- `refresh_token`: string - Long-lived token for session renewal
- `expires_at`: timestamp - When access token expires
- `user`: User object - Associated user data

**Token Lifecycle**:

1. Created on successful login
2. Access token valid for 1 hour (default)
3. Refresh token valid for 30 days (default)
4. Automatically refreshed by `getUser()` when near expiry
5. Expired sessions return null user

**Storage**:

- Stored in httpOnly cookies (not accessible to JavaScript)
- Cookie names: `sb-<project>-auth-token` (access) and `sb-<project>-auth-token.1` (refresh)
- Cookies set with `Secure`, `HttpOnly`, `SameSite=Lax` flags

**Usage in Feature**:

- Middleware validates session on every request
- Invalid/expired sessions trigger redirect to login
- Valid sessions allow access to dashboard routes

**Relationships**:

- One Session → One User

---

### 3. Protected Route (Application Logic)

**Description**: A route pattern that requires authentication to access.

**Managed By**: Application middleware logic

**Key Attributes**:

- `pattern`: string - URL pattern (e.g., `/dashboard/*`, `/guests/*`)
- `requiresAuth`: boolean - Always true for dashboard routes
- `redirectTarget`: string - Where to redirect unauthenticated users (`/auth/login`)

**Route Classifications**:

| Route Pattern  | Type      | Requires Auth | Behavior                                                 |
| -------------- | --------- | ------------- | -------------------------------------------------------- |
| `/`            | Public    | No            | Landing page, accessible to all                          |
| `/auth/*`      | Auth      | No            | Login/register pages, redirects authenticated users      |
| `/dashboard/*` | Protected | Yes           | Dashboard routes, redirects unauthenticated users        |
| `/guests/*`    | Protected | Yes           | Guest management routes, redirects unauthenticated users |
| `/_next/*`     | System    | No            | Next.js internals, excluded from middleware              |
| `/api/*`       | API       | Varies        | API routes, handled separately                           |

**Detection Logic**:

```typescript
const isPublicRoute = pathname === '/'
const isAuthRoute = pathname.startsWith('/auth')
const isDashboardRoute = pathname.startsWith('/dashboard') ||
                         pathname.startsWith('/guests') ||
                         // ... other dashboard route patterns
```

**Usage in Feature**:

- Middleware classifies each request by route type
- Route type determines authentication requirement
- Drives redirect logic (where to send user if not authenticated)

---

### 4. Redirect State (Transient)

**Description**: Temporary state that preserves the user's intended destination during login flow.

**Managed By**: URL query parameter

**Key Attributes**:

- `originalPath`: string - The route user tried to access
- `queryParams`: string - Any query parameters from original URL
- `encodedUrl`: string - URL-encoded full path

**Lifecycle**:

1. User tries to access `/dashboard/guests`
2. Middleware detects unauthenticated state
3. Redirects to `/auth/login?redirect=/dashboard/guests`
4. Login page extracts `redirect` param
5. After successful auth, navigates to `/dashboard/guests`

**URL Parameter Format**:

```
/auth/login?redirect=/dashboard/guests
/auth/login?redirect=/dashboard/guests%3Fstatus%3Dactive
```

**Default Behavior**:

- If no `redirect` param: default to `/dashboard`
- If `redirect` points to auth route: override to `/dashboard` (prevent loop)
- Validate redirect URL is internal (prevent open redirect vulnerability)

**Usage in Feature**:

- Middleware sets redirect param on unauthenticated access
- Login page reads redirect param on mount
- Post-login navigation uses redirect param

**Security Considerations**:

- MUST validate redirect URL is internal (same origin)
- MUST NOT allow arbitrary external redirects
- Validation regex: `/^\/[a-zA-Z0-9\/_-]*$/`

---

## Entity Relationships

```
┌─────────────────┐
│      User       │
│  (Supabase)     │
└────────┬────────┘
         │ 1
         │
         │ has
         │
         │ *
┌────────┴────────┐
│    Session      │
│  (Supabase)     │
└────────┬────────┘
         │
         │ validates
         │
         ▼
┌─────────────────┐          ┌─────────────────┐
│ Protected Route │◄─────────│ Redirect State  │
│ (App Logic)     │ includes │   (Transient)   │
└─────────────────┘          └─────────────────┘
```

## State Transitions

### Session State Machine

```
┌─────────────┐
│ No Session  │
└──────┬──────┘
       │ login()
       ▼
┌─────────────┐
│   Active    │◄───────┐
│  (< 1 hour) │        │ getUser()
└──────┬──────┘        │ (near expiry)
       │               │
       │ time passes   │ auto-refresh
       ▼               │
┌─────────────┐        │
│Near Expiry  ├────────┘
│(< 5 min)    │
└──────┬──────┘
       │ no refresh
       ▼
┌─────────────┐
│  Expired    │
└──────┬──────┘
       │ logout/clear
       ▼
┌─────────────┐
│ No Session  │
└─────────────┘
```

### Route Access State Machine

```
User Request
     │
     ▼
┌─────────────────────┐
│ Check Session       │
│ (middleware)        │
└──────┬──────────────┘
       │
       ├─── Has Valid Session?
       │
       ├─── YES ──► Check Route Type
       │                    │
       │                    ├─── Auth Route? ──► Redirect /dashboard
       │                    │
       │                    └─── Protected/Public? ──► Allow Access
       │
       └─── NO ──► Check Route Type
                        │
                        ├─── Protected? ──► Redirect /auth/login?redirect=X
                        │
                        ├─── Auth? ──► Allow Access
                        │
                        └─── Public? ──► Allow Access
```

## Data Validation Rules

### User

- Email MUST be valid format (validated by Supabase)
- Email MUST be unique (enforced by Supabase)
- Password MUST meet minimum requirements (Supabase policy)

### Session

- Access token MUST be valid JWT (validated by Supabase)
- Refresh token MUST not be expired
- Session MUST belong to existing user

### Redirect State

- Redirect URL MUST start with `/`
- Redirect URL MUST NOT start with `/auth` (prevent loop)
- Redirect URL MUST be internal (same origin)
- Redirect URL MUST NOT exceed 2000 characters
- If invalid: fallback to `/dashboard`

## Notes

- Most data management is handled by Supabase Auth
- Application code primarily consumes and validates auth state
- No custom database tables required for this feature
- All session data stored in secure httpOnly cookies
- Middleware has no database access (Edge Runtime) - all validation via Supabase API
