# Quickstart Guide: Dashboard Route Protection Testing

**Feature**: Dashboard Route Protection
**Branch**: fix/protected-routes
**Date**: 2025-10-16

## Overview

This guide provides step-by-step instructions for testing the dashboard route protection feature, both manually and with automated tests.

---

## Prerequisites

### Environment Setup

1. **Supabase Project Configured**:

   ```bash
   # Check environment variables exist
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Test User Account**:
   - Email: `test@example.com`
   - Password: Create in Supabase Dashboard → Authentication → Users
   - Status: Email confirmed

3. **Development Server Running**:
   ```bash
   npm run dev
   ```
   Server should be at: http://localhost:3000

---

## Manual Testing Scenarios

### Scenario 1: Unauthenticated Access to Dashboard (P1 - Critical)

**Goal**: Verify unauthenticated users are redirected to login

**Steps**:

1. Open browser in Incognito/Private mode
2. Clear all cookies for localhost
3. Navigate directly to: http://localhost:3000/dashboard
4. **Expected**: Redirected to http://localhost:3000/auth/login?redirect=/dashboard
5. Verify URL contains `redirect=/dashboard` query parameter
6. Verify login page displays correctly

**Pass Criteria**:

- ✅ Immediate redirect to login page
- ✅ Redirect parameter preserved in URL
- ✅ No flash of dashboard content
- ✅ Network tab shows 307 redirect (not 200 then client redirect)

---

### Scenario 2: Unauthenticated Access to Nested Dashboard Route (P1 - Critical)

**Goal**: Verify all dashboard routes are protected, not just root

**Steps**:

1. Clear browser session (Incognito mode)
2. Navigate to: http://localhost:3000/guests
3. **Expected**: Redirected to http://localhost:3000/auth/login?redirect=/guests
4. Verify redirect parameter: `?redirect=/guests`

**Pass Criteria**:

- ✅ Redirected to login with correct redirect param
- ✅ Works for all dashboard routes (/dashboard, /guests, /settings, etc.)

---

### Scenario 3: Session Expiry During Active Use (P1 - Critical)

**Goal**: Handle session expiration gracefully

**Setup**:

1. Modify Supabase JWT expiry to 1 minute (for testing)
2. Login with test account
3. Access dashboard successfully
4. Wait for token to expire (>1 minute)
5. Click any navigation link or refresh page

**Expected**:

- Redirected to login page
- Original destination preserved in redirect param
- Clear indication session expired (optional: toast message)

**Pass Criteria**:

- ✅ Detects expired session
- ✅ Redirects to login
- ✅ Preserves intended destination
- ✅ No error in console

**Note**: Reset JWT expiry after test

---

### Scenario 4: Successful Login with Redirect (P2 - Important)

**Goal**: After login, user is sent to originally requested page

**Steps**:

1. Clear browser session
2. Navigate to: http://localhost:3000/guests
3. Verify redirected to login with `?redirect=/guests`
4. Enter valid credentials (test@example.com)
5. Submit login form
6. **Expected**: Redirected to http://localhost:3000/guests

**Pass Criteria**:

- ✅ Login successful
- ✅ Redirected to original destination (/guests)
- ✅ Dashboard page loads fully
- ✅ User remains authenticated on navigation

---

### Scenario 5: Login Without Redirect Parameter (P2 - Important)

**Goal**: Default to /dashboard if no redirect specified

**Steps**:

1. Clear browser session
2. Navigate directly to: http://localhost:3000/auth/login
3. Enter valid credentials
4. Submit form
5. **Expected**: Redirected to http://localhost:3000/dashboard

**Pass Criteria**:

- ✅ Login successful
- ✅ Redirected to /dashboard (default)
- ✅ Dashboard loads correctly

---

### Scenario 6: Authenticated User Accessing Auth Pages (P3 - Nice to Have)

**Goal**: Prevent authenticated users from accessing login page

**Steps**:

1. Login with valid credentials
2. Verify at /dashboard
3. Manually navigate to: http://localhost:3000/auth/login
4. **Expected**: Redirected back to /dashboard

**Pass Criteria**:

- ✅ Immediate redirect to /dashboard
- ✅ No flash of login page
- ✅ Works for all auth routes (/auth/login, /auth/register, etc.)

---

### Scenario 7: Authenticated Access to Dashboard Routes (P2 - Important)

**Goal**: Authenticated users can freely navigate dashboard

**Steps**:

1. Login with valid credentials
2. Navigate to /dashboard
3. Navigate to /guests
4. Navigate back to /dashboard
5. Refresh page
6. **Expected**: No redirects, smooth navigation

**Pass Criteria**:

- ✅ All dashboard routes accessible
- ✅ No unexpected redirects
- ✅ Session persists across navigation
- ✅ Page refresh doesn't log out user

---

### Scenario 8: Deep Link Access When Authenticated (P3 - Nice to Have)

**Goal**: Authenticated users can access deep-linked dashboard routes

**Steps**:

1. Login and remain at /dashboard
2. Open new tab
3. Navigate to: http://localhost:3000/guests/new
4. **Expected**: Page loads directly, no redirect

**Pass Criteria**:

- ✅ Direct access to deep route
- ✅ Session valid in new tab
- ✅ No redirect loop

---

## Automated Testing

### Setup Test Environment

```bash
# Install test dependencies (if not already installed)
npm install

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run specific test file
npm test middleware.test.ts
```

### Unit Tests for Middleware

**File**: `tests/unit/middleware.test.ts`

**Test Cases**:

```typescript
describe("Middleware Route Protection", () => {
  test("redirects unauthenticated user from dashboard to login", async () => {
    const request = new NextRequest("http://localhost/dashboard");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/auth/login?redirect=/dashboard",
    );
  });

  test("allows authenticated user to access dashboard", async () => {
    // Mock authenticated session
    const request = new NextRequest("http://localhost/dashboard");
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });

  test("redirects authenticated user away from auth pages", async () => {
    // Mock authenticated session
    const request = new NextRequest("http://localhost/auth/login");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  test("preserves complex redirect URLs", async () => {
    const request = new NextRequest("http://localhost/guests/123/edit");
    const response = await middleware(request);

    expect(response.headers.get("location")).toContain(
      "redirect=/guests/123/edit",
    );
  });
});
```

### Integration Tests for Login Flow

**File**: `tests/integration/auth-flow.test.tsx`

**Test Cases**:

```typescript
describe('Authentication Flow', () => {
  test('complete login flow with redirect', async () => {
    render(<LoginPage />)

    // Fill form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    // Submit
    fireEvent.click(screen.getByText('Sign In'))

    // Wait for redirect
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('displays error on invalid credentials', async () => {
    // Mock Supabase error
    mockSupabase.auth.signInWithPassword.mockRejectedValue({
      error: { message: 'Invalid credentials' }
    })

    render(<LoginPage />)

    // Submit form
    fireEvent.click(screen.getByText('Sign In'))

    // Verify error shown
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
```

### Running Full Test Suite

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode during development
npm test -- --watch
```

**Coverage Goals**:

- Middleware logic: 100% (critical security code)
- Login component: >90%
- Auth utilities: >90%

---

## Edge Cases to Test

### 1. Redirect Loop Prevention

**Scenario**: Redirect param points to auth page

```
URL: /auth/login?redirect=/auth/login
Expected: Redirect to /dashboard (override invalid redirect)
```

### 2. External Redirect Attempt (Security)

**Scenario**: Malicious redirect parameter

```
URL: /auth/login?redirect=https://evil.com
Expected: Redirect to /dashboard (validate internal only)
```

### 3. Very Long Redirect URL

**Scenario**: Redirect exceeds reasonable length

```
URL: /auth/login?redirect=/very/long/path/with/many/segments/...
Expected: Handle gracefully (truncate or default to /dashboard)
```

### 4. Session Refresh During Request

**Scenario**: Token expires mid-request

```
Setup: Token expires while page is loading
Expected: Middleware refreshes token, request succeeds
```

### 5. Concurrent Tab Logins

**Scenario**: User logs in on two tabs

```
Setup: Login on Tab 1, then Tab 2
Expected: Session shared across tabs, both work
```

### 6. Logout from One Tab

**Scenario**: User logs out in one tab

```
Setup: Authenticated in 2 tabs, logout from Tab 1
Expected: Tab 2 detects logout on next request, redirects to login
```

---

## Performance Testing

### Middleware Execution Time

**Goal**: <100ms average, <200ms p95

**Measurement**:

```typescript
// Add to middleware.ts temporarily
const start = Date.now();
const result = await middleware(request);
const duration = Date.now() - start;
console.log(`Middleware execution: ${duration}ms`);
return result;
```

**Test**:

1. Make 100 requests to protected routes
2. Record execution times
3. Calculate average and p95
4. Verify <100ms average

### Session Refresh Performance

**Goal**: <50ms for refresh, minimal impact on page load

**Test**:

1. Set token to expire soon
2. Access dashboard route
3. Measure time from request to response
4. Verify refresh doesn't block rendering

---

## Accessibility Testing

### Keyboard Navigation

- [ ] Tab through login form
- [ ] Submit with Enter key
- [ ] Focus indicators visible
- [ ] No keyboard traps

### Screen Reader

- [ ] Login form fields announced
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Redirect intent communicated (optional)

### Loading States

- [ ] Loading indicator has ARIA label
- [ ] Skeleton loaders have appropriate ARIA
- [ ] No content flash before redirect

---

## Browser Compatibility

Test in:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Cookie Compatibility**:

- Verify httpOnly cookies work in all browsers
- Verify SameSite=Lax respected
- Verify cookies persist across tabs

---

## Debugging Tips

### Middleware Not Running

```bash
# Check matcher config in middleware.ts
# Ensure route is included in matcher pattern
```

### Redirect Loop

```bash
# Check for conflicting route classifications
# Verify isAuthRoute and isDashboardRoute logic
# Check for multiple redirects in same request
```

### Session Not Persisting

```bash
# Verify Supabase env vars are set
# Check cookie domain in Network tab
# Verify HTTPS in production (cookies may not set on HTTP)
```

### Slow Authentication

```bash
# Check Supabase project region (use nearest)
# Verify Edge runtime is used (not Node.js)
# Check network tab for slow API calls
```

---

## Success Criteria Summary

Feature is considered complete when:

- ✅ All P1 manual scenarios pass
- ✅ All P2 manual scenarios pass
- ✅ All automated tests pass (100% for middleware)
- ✅ All edge cases handled gracefully
- ✅ Performance <100ms average middleware execution
- ✅ Accessibility requirements met (WCAG 2.1 AA)
- ✅ No console errors or warnings
- ✅ Works in all target browsers

---

## Next Steps After Testing

1. **Code Review**: Submit PR with test results
2. **Security Review**: Verify no auth bypass possible
3. **Performance Review**: Confirm <100ms middleware execution
4. **Documentation**: Update main README with auth flow
5. **Deploy to Staging**: Test with real Supabase project
6. **Monitor**: Track auth success/failure rates
7. **Production Deploy**: Roll out after staging validation
