# Implementation Plan: Dashboard Route Protection

**Branch**: `fix/protected-routes` | **Date**: 2025-10-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/fix/protected-routes/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix and enhance the dashboard route group protection to ensure unauthenticated users are consistently redirected to the login page, while preserving the originally requested URL for post-login navigation. The existing middleware.ts (lines 8-60) already implements basic authentication checks using Supabase SSR, but needs refinement to ensure the dashboard route group is properly protected according to the spec requirements.

## Technical Context

**Language/Version**: TypeScript 5.9+
**Primary Dependencies**: Next.js 15.5.5 (App Router), React 19.2.0, @supabase/ssr 0.7.0, @supabase/supabase-js 2.75.0
**Storage**: Supabase (cloud-hosted PostgreSQL with authentication)
**Testing**: Vitest 3.2.4, @testing-library/react 16.3.0
**Target Platform**: Web (Next.js App Router)
**Project Type**: Web application (frontend with Supabase backend)
**Performance Goals**: <100ms authentication check, <2s page load for authenticated dashboard routes
**Constraints**: Must work with Next.js middleware (edge runtime), session cookies must be properly refreshed
**Scale/Scope**: Village management resident application with dashboard for authenticated users, auth pages for login/register

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principles Compliance

| Principle                              | Status       | Notes                                                                              |
| -------------------------------------- | ------------ | ---------------------------------------------------------------------------------- |
| **I. Modern Web Standards**            | ✅ PASS      | Using Next.js 15 App Router, TypeScript 5.9+, modern React patterns                |
| **II. Component-Driven Development**   | ✅ PASS      | Existing components are functional with hooks (Header, Sidebar, layout components) |
| **III. Type Safety & Code Quality**    | ✅ PASS      | Strict TypeScript enabled, no `any` types in middleware, proper type inference     |
| **IV. Naming & Code Organization**     | ✅ PASS      | PascalCase components, camelCase functions, organized app directory structure      |
| **V. Accessibility & UX First**        | ✅ PASS      | Mobile-first with DaisyUI, will add loading states for auth checks                 |
| **VI. Testing & Quality Assurance**    | ⚠️ ATTENTION | Must add data-testid to auth-related elements for testing                          |
| **VII. Documentation & Specification** | ✅ PASS      | Following /speckit workflow, spec created, plan being documented                   |

### Gate Evaluation

**Result**: ✅ PASS with attention items

**Attention Items**:

- Add `data-testid` attributes to redirect flows for automated testing
- Ensure loading states are accessible during authentication checks

## Project Structure

### Documentation (this feature)

```
specs/fix/protected-routes/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
village-management-resident-ui/
├── middleware.ts        # EXISTING - Next.js middleware for auth (to be enhanced)
├── app/
│   ├── (dashboard)/     # EXISTING - Protected route group
│   │   ├── layout.tsx   # Dashboard layout with Header/Sidebar
│   │   ├── dashboard/   # Dashboard pages
│   │   └── guests/      # Guest management pages
│   ├── auth/            # EXISTING - Public auth routes
│   │   ├── layout.tsx   # Auth layout
│   │   ├── login/       # Login page
│   │   ├── register/    # Registration page
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   ├── layout/          # EXISTING - Header, Sidebar, MobileNav
│   ├── features/        # EXISTING - Feature-specific components
│   └── ui/              # EXISTING - Reusable UI components
├── lib/
│   └── supabase/        # TO CREATE - Supabase client utilities
│       ├── client.ts    # Client-side Supabase client
│       └── server.ts    # Server-side Supabase client
├── hooks/
│   └── useAuth.ts       # TO CREATE - Auth state hook
└── tests/
    ├── integration/     # TO CREATE - Integration tests for auth flows
    └── unit/            # TO CREATE - Unit tests for middleware logic
```

**Structure Decision**: Next.js 15 App Router with route groups. The `(dashboard)` route group uses parentheses to organize protected routes without adding URL segments. Middleware intercepts all requests to verify authentication before rendering protected pages.

## Architecture

### Current Implementation Analysis

**Existing Middleware** (middleware.ts:8-60):

- ✅ Creates Supabase server client with cookie handling
- ✅ Refreshes session via `supabase.auth.getUser()`
- ✅ Detects auth routes (`/auth/*`)
- ✅ Detects public route (`/`)
- ✅ Redirects authenticated users away from auth pages to `/dashboard`
- ✅ Redirects unauthenticated users to `/auth/login` with redirect param
- ✅ Matcher config excludes static files, images, API routes

**Gap Analysis** (what needs enhancement):

- ⚠️ Dashboard route group protection logic needs explicit check
- ⚠️ Redirect parameter handling after successful login needs verification
- ⚠️ Session expiry during active use needs better handling
- ⚠️ Loading states during auth checks not visible to user
- ⚠️ No test coverage for middleware auth flows

### Proposed Enhancements

1. **Explicit Dashboard Route Protection**:
   - Add explicit check for `(dashboard)` route group
   - Ensure all dashboard routes require authentication
   - Preserve current URL in redirect parameter

2. **Post-Login Redirect Flow**:
   - Login page should read `redirect` query parameter
   - After successful auth, redirect to originally requested route
   - Default to `/dashboard` if no redirect parameter

3. **Session Management**:
   - Middleware already refreshes session on each request
   - Add session validity checks
   - Handle token expiration gracefully

4. **User Experience**:
   - Add loading indicators during authentication checks
   - Provide clear feedback when session expires
   - Ensure smooth transitions between routes

### Authentication Flow

```
User Access Flow:
┌─────────────────────────────────────────────────┐
│ User requests /dashboard/guests                 │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ Middleware intercepts request                   │
│ - Creates Supabase client                       │
│ - Calls getUser() to refresh/verify session     │
└───────────────┬─────────────────────────────────┘
                │
         ┌──────┴──────┐
         │             │
    Has Session?    No Session
         │             │
         │             ▼
         │      ┌──────────────────────────────┐
         │      │ Redirect to /auth/login      │
         │      │ ?redirect=/dashboard/guests  │
         │      └──────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ Allow access to protected route                 │
│ Render dashboard layout + page                  │
└─────────────────────────────────────────────────┘


Login Flow:
┌─────────────────────────────────────────────────┐
│ User lands on /auth/login?redirect=/dashboard/X │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ Login form extracts redirect param              │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ User submits credentials                        │
│ Supabase authenticates                          │
└───────────────┬─────────────────────────────────┘
                │
         ┌──────┴──────┐
         │             │
    Success?          Fail
         │             │
         │             ▼
         │      ┌──────────────────────────────┐
         │      │ Show error message           │
         │      │ Remain on login page         │
         │      └──────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ Redirect to original destination                │
│ (from redirect param or default /dashboard)     │
└─────────────────────────────────────────────────┘
```

## Implementation Strategy

### Phase 0: Research & Technical Decisions

**Research Topics**:

1. Next.js 15 middleware best practices for authentication
2. Supabase SSR session management patterns
3. Edge runtime limitations and cookie handling
4. Testing strategies for Next.js middleware
5. Loading states during server-side redirects

### Phase 1: Design Artifacts

**Data Model** (data-model.md):

- Session entity (Supabase managed)
- User entity (Supabase auth.users)
- Redirect state (query parameter)

**Contracts** (contracts/):

- Login endpoint contract (Supabase Auth API)
- Session refresh contract (Supabase Auth API)

**Quickstart** (quickstart.md):

- Test scenarios for authentication flows
- Manual testing checklist
- Automated test setup guide

### Phase 2: Implementation Tasks

Will be generated by `/speckit.tasks` command based on this plan and the feature specification.

## Risk Analysis

| Risk                                | Impact | Likelihood | Mitigation                                               |
| ----------------------------------- | ------ | ---------- | -------------------------------------------------------- |
| Session cookie not persisted        | High   | Low        | Use Supabase SSR's cookie handling (already implemented) |
| Edge runtime limitations            | Medium | Medium     | Use Next.js-compatible patterns, test thoroughly         |
| Redirect loop scenarios             | High   | Medium     | Carefully test auth/dashboard boundary conditions        |
| Performance impact on every request | Medium | Low        | Middleware is optimized, session check is fast           |
| Testing middleware in isolation     | Medium | Medium     | Use Next.js testing utilities for middleware             |

## Performance Considerations

- **Session Refresh**: Supabase `getUser()` is optimized for edge runtime (~20-50ms)
- **Middleware Execution**: Runs on every matching request, must be fast
- **Cookie Handling**: Supabase SSR handles cookie operations efficiently
- **Target**: <100ms total middleware execution time

## Testing Strategy

1. **Unit Tests**:
   - Middleware logic for route classification
   - Redirect URL construction
   - Session validation edge cases

2. **Integration Tests**:
   - Full auth flow from login to dashboard access
   - Session expiry handling
   - Redirect parameter preservation
   - Protected route access without auth

3. **E2E Scenarios**:
   - User tries to access dashboard without login
   - User logs in and is redirected to intended route
   - User's session expires during active use
   - Authenticated user tries to access login page

## Next Steps

After this planning phase (`/speckit.plan`):

1. **Phase 0 Complete**: Generate research.md with technical decisions
2. **Phase 1 Complete**: Generate data-model.md, contracts/, quickstart.md
3. **Run `/speckit.tasks`**: Generate executable task breakdown
4. **Implementation**: Execute tasks in priority order
5. **Testing**: Verify all acceptance scenarios from spec
6. **Review**: Ensure Constitution compliance

## Complexity Tracking

_No Constitution violations detected - no complexity justification needed_

All implementation follows established Next.js and React patterns. The middleware approach is the recommended pattern for Next.js App Router authentication. No unnecessary abstraction layers or complexity added.
