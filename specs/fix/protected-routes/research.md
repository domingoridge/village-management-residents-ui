# Research: Dashboard Route Protection

**Feature**: Dashboard Route Protection
**Branch**: fix/protected-routes
**Date**: 2025-10-16

## Overview

This document captures technical research and decisions made for implementing robust authentication-based route protection in a Next.js 15 App Router application using Supabase SSR.

## Research Topics

### 1. Next.js 15 Middleware Best Practices for Authentication

**Decision**: Use Next.js middleware with Supabase SSR's server client for route protection

**Rationale**:

- Next.js middleware runs on the Edge Runtime before page rendering
- Perfect interception point for authentication checks
- Supabase SSR provides `createServerClient` specifically for middleware
- Enables server-side session refresh without client-side redirects
- Runs once per request, providing consistent security layer

**Key Pattern**:

```typescript
// middleware.ts pattern
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          /* set on request and response */
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection logic based on user state
}
```

**Alternatives Considered**:

- Client-side auth checks in layout components (rejected: not secure, bypassable)
- Server Components with redirect (rejected: runs after middleware, less efficient)
- API route middleware (rejected: doesn't protect page routes)

**References**:

- Next.js Middleware docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Supabase SSR guide: https://supabase.com/docs/guides/auth/server-side/nextjs

---

### 2. Supabase SSR Session Management Patterns

**Decision**: Use `getUser()` for session refresh and validation in middleware

**Rationale**:

- `getUser()` validates the JWT and refreshes if needed
- More secure than `getSession()` which only reads local session
- Returns null user if session is invalid or expired
- Automatically handles token refresh within expiry window
- Optimized for Edge Runtime (fast, minimal overhead)

**Session Lifecycle**:

1. User logs in → Supabase creates session with JWT
2. JWT stored in httpOnly cookie (secure, not accessible to JavaScript)
3. Middleware calls `getUser()` on each request
4. Supabase validates JWT against auth server
5. If valid: returns user, refreshes token if near expiry
6. If invalid: returns null, session considered expired

**Cookie Strategy**:

- Use `setAll()` pattern to update both request and response cookies
- Ensures refreshed tokens are available to both middleware and page
- Maintains cookie attributes (httpOnly, secure, sameSite)

**Alternatives Considered**:

- `getSession()` only (rejected: doesn't validate against server, security risk)
- Custom JWT validation (rejected: unnecessary, Supabase handles it)
- Client-side session storage (rejected: insecure, not SSR-friendly)

**References**:

- Supabase Auth Helpers SSR: https://supabase.com/docs/guides/auth/server-side-rendering
- Supabase getUser vs getSession: https://supabase.com/docs/reference/javascript/auth-getuser

---

### 3. Edge Runtime Limitations and Cookie Handling

**Decision**: Leverage Supabase SSR's cookie abstraction to handle Edge Runtime constraints

**Rationale**:

- Edge Runtime doesn't have access to Node.js APIs
- Supabase SSR's `createServerClient` is Edge-compatible
- Cookie handling abstraction works within Edge constraints
- Response cloning required for cookie mutations

**Edge Runtime Constraints**:

- No file system access
- No native Node.js modules
- Limited set of Web APIs
- Must use NextResponse for cookie modifications

**Cookie Handling Pattern**:

```typescript
// Create response before auth check
let supabaseResponse = NextResponse.next({ request })

// Cookie setAll updates both request and response
setAll(cookiesToSet) {
  // Update request cookies
  cookiesToSet.forEach(({ name, value }) =>
    request.cookies.set(name, value)
  )

  // Clone response with updated request
  supabaseResponse = NextResponse.next({ request })

  // Update response cookies
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)
  )
}

// Return updated response at end
return supabaseResponse
```

**Alternatives Considered**:

- Manual cookie parsing (rejected: error-prone, Supabase handles it)
- Serverless Functions instead of Edge (rejected: slower cold starts)
- Skip cookie refresh in middleware (rejected: sessions would expire)

**References**:

- Edge Runtime docs: https://nextjs.org/docs/app/api-reference/edge
- NextResponse cookies: https://nextjs.org/docs/app/api-reference/functions/next-response

---

### 4. Testing Strategies for Next.js Middleware

**Decision**: Multi-layer testing approach with unit, integration, and E2E tests

**Test Strategy**:

**Layer 1: Unit Tests** (Vitest)

- Test route classification logic (isAuthRoute, isDashboardRoute)
- Test redirect URL construction
- Mock Supabase client to test auth states
- Fast, isolated tests for logic

**Layer 2: Integration Tests** (Vitest + Testing Library)

- Test auth flows end-to-end
- Mock middleware execution with request/response
- Verify cookie handling
- Test session expiry scenarios

**Layer 3: E2E Tests** (Manual/Playwright - future)

- Real browser testing
- Full auth flows with actual Supabase
- Session persistence across navigation
- Redirect preservation

**Testing Middleware Challenges**:

- Middleware runs in Edge Runtime (different env)
- Request/Response mocking required
- Cookie state management complex
- Session state needs setup

**Mock Pattern**:

```typescript
// Unit test example
const mockRequest = new NextRequest("http://localhost/dashboard");
const mockUser = { id: "123", email: "test@example.com" };

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
    },
  }),
}));
```

**Alternatives Considered**:

- Only E2E tests (rejected: slow, hard to debug failures)
- Only unit tests (rejected: misses integration issues)
- Skip middleware testing (rejected: critical security component)

**References**:

- Vitest docs: https://vitest.dev/
- Testing Next.js middleware: https://nextjs.org/docs/app/building-your-application/testing

---

### 5. Loading States During Server-Side Redirects

**Decision**: Use Next.js loading.tsx files for route segments + client-side redirect feedback

**Rationale**:

- Server redirects (middleware) are instantaneous, no intermediate UI
- Use `loading.tsx` to show skeleton while page loads after redirect
- For client-side redirects (post-login), show inline loading state
- Leverage Suspense boundaries for async components

**Loading Strategy**:

**Middleware Redirects** (server-side):

- No loading state shown (redirect is immediate)
- Browser navigates directly to new URL
- Target page shows its own loading.tsx while rendering

**Post-Login Redirects** (client-side):

```typescript
// In login form after successful auth
const [isRedirecting, setIsRedirecting] = useState(false)

const handleLogin = async () => {
  // ... auth logic
  setIsRedirecting(true)
  router.push(redirectUrl)
}

return (
  <>
    {isRedirecting && <LoadingOverlay />}
    <LoginForm onSubmit={handleLogin} />
  </>
)
```

**Dashboard Loading States**:

```
app/(dashboard)/
├── loading.tsx          # Shows skeleton while dashboard loads
├── dashboard/
│   └── loading.tsx      # Specific to dashboard page
└── guests/
    └── loading.tsx      # Specific to guests page
```

**Accessibility**:

- Loading states must have ARIA labels
- Screen readers announce "Loading dashboard..."
- Use skeleton loaders that match final layout
- Avoid flash of loading state (<100ms)

**Alternatives Considered**:

- Global loading bar (rejected: not contextual enough)
- No loading states (rejected: poor UX for slow connections)
- Client-side only auth (rejected: security concern)

**References**:

- Next.js loading.tsx: https://nextjs.org/docs/app/api-reference/file-conventions/loading
- React Suspense: https://react.dev/reference/react/Suspense

---

## Technical Decisions Summary

| Decision Area             | Choice                               | Impact                                       |
| ------------------------- | ------------------------------------ | -------------------------------------------- |
| **Auth Layer**            | Next.js Middleware with Supabase SSR | Secure, server-side, runs before page render |
| **Session Validation**    | Supabase `getUser()`                 | Validates JWT against server, auto-refresh   |
| **Cookie Handling**       | Supabase SSR cookie abstraction      | Edge-compatible, handles refresh tokens      |
| **Route Protection**      | Pattern matching in middleware       | Explicit checks for dashboard routes         |
| **Redirect Preservation** | URL query parameter                  | Preserves intended destination post-login    |
| **Testing Approach**      | Unit + Integration (Vitest)          | Fast feedback, good coverage                 |
| **Loading States**        | loading.tsx + client state           | Clear feedback during navigation             |

## Implementation Priorities

Based on research findings, implementation should proceed in this order:

1. **Enhance Middleware Logic** (highest priority)
   - Explicit dashboard route group detection
   - Verify redirect parameter handling
   - Add TypeScript types for route patterns

2. **Login Page Redirect Handling**
   - Read `redirect` query param
   - Navigate to preserved URL after auth
   - Default to /dashboard if no redirect

3. **Loading States**
   - Add loading.tsx to dashboard routes
   - Add loading indicator to login form
   - Ensure accessibility

4. **Testing Infrastructure**
   - Set up middleware unit tests
   - Create integration test suite
   - Add test utilities for auth mocking

5. **Documentation**
   - Add inline code comments
   - Update quickstart.md with testing guide
   - Document edge cases

## Risks and Mitigations

| Risk                                        | Severity | Mitigation Strategy                                            |
| ------------------------------------------- | -------- | -------------------------------------------------------------- |
| Redirect loops between /auth and /dashboard | High     | Careful condition checks, integration tests for boundary cases |
| Session not refreshed in middleware         | High     | Already handled by Supabase SSR's setAll pattern               |
| Edge Runtime compatibility issues           | Medium   | Use only Edge-compatible APIs, test in staging                 |
| Performance degradation                     | Low      | Middleware is fast (<50ms), monitor in production              |
| Cookie size limits                          | Low      | Supabase manages token size, monitor headers                   |

## Open Questions

None - all research topics resolved with clear decisions.

## Next Steps

With research complete, proceed to **Phase 1: Design Artifacts**:

1. Generate data-model.md (session, user entities)
2. Generate contracts/ (Supabase Auth API contracts)
3. Generate quickstart.md (testing scenarios)
4. Run `/speckit.tasks` to generate implementation tasks
