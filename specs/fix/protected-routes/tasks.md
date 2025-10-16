# Tasks: Dashboard Route Protection

**Input**: Design documents from `/specs/fix/protected-routes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/supabase-auth.md, quickstart.md

**Tests**: Not explicitly requested in spec - focusing on implementation with manual testing via quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js 15 App Router at repository root
- Paths: `middleware.ts`, `app/`, `lib/`, `hooks/`, `components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Supabase client utilities

- [x] T001 [P] Create Supabase client utilities directory structure at lib/supabase/
- [x] T002 [P] Implement client-side Supabase client in lib/supabase/client.ts
- [x] T003 [P] Implement server-side Supabase client in lib/supabase/server.ts
- [x] T004 [P] Create hooks directory structure at hooks/
- [x] T005 [P] Create tests directory structure at tests/unit/ and tests/integration/

**Checkpoint**: Basic infrastructure ready for authentication implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core middleware enhancements that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Review and document existing middleware logic in middleware.ts (lines 8-60)
- [x] T007 Add explicit isDashboardRoute helper function in middleware.ts
- [x] T008 Add validateRedirectUrl utility function in middleware.ts to prevent open redirects
- [x] T009 Enhance middleware route classification to explicitly check dashboard route group

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Unauthenticated Access Prevention (Priority: P1) 🎯 MVP

**Goal**: Ensure all unauthenticated users are redirected to login when accessing any dashboard route

**Independent Test**: Access any dashboard route without authentication and verify immediate redirect to /auth/login with redirect parameter

### Implementation for User Story 1

- [x] T010 [US1] Update middleware to use isDashboardRoute helper for explicit dashboard protection in middleware.ts:41-57
- [x] T011 [US1] Ensure redirect parameter includes full pathname when redirecting unauthenticated users in middleware.ts:51-57
- [x] T012 [US1] Add session expiry detection (user null check) in middleware.ts:36-39
- [x] T013 [US1] Verify middleware matcher config includes all dashboard routes in middleware.ts:62-74
- [x] T014 [US1] Add data-testid="protected-route" to dashboard layout for testing in app/(dashboard)/layout.tsx:10
- [x] T015 [US1] Add loading.tsx to dashboard route group at app/(dashboard)/loading.tsx with skeleton UI
- [ ] T016 [US1] Manually test Scenario 1 from quickstart.md (unauthenticated access to /dashboard)
- [ ] T017 [US1] Manually test Scenario 2 from quickstart.md (unauthenticated access to /guests)
- [ ] T018 [US1] Manually test Scenario 3 from quickstart.md (session expiry during active use)

**Checkpoint**: User Story 1 complete - Unauthenticated users cannot access dashboard routes

---

## Phase 4: User Story 2 - Authenticated Access Allowance (Priority: P2)

**Goal**: Ensure authenticated users can access dashboard routes without unexpected redirects

**Independent Test**: Login with valid credentials and navigate freely between dashboard routes without redirects

### Implementation for User Story 2

- [x] T019 [US2] Verify authenticated user bypass logic in middleware.ts:44-49 allows dashboard access
- [x] T020 [US2] Ensure session refresh happens correctly via getUser() in middleware.ts:36-39
- [x] T021 [US2] Test that authenticated users are redirected FROM auth pages TO /dashboard in middleware.ts:44-49
- [x] T022 [US2] Add useAuth hook at hooks/useAuth.ts for client-side auth state management
- [x] T023 [US2] Update Header component to use useAuth hook in components/layout/Header.tsx
- [x] T024 [US2] Ensure loading states are accessible with ARIA labels in app/(dashboard)/loading.tsx
- [ ] T025 [US2] Manually test Scenario 4 from quickstart.md (successful login with redirect)
- [ ] T026 [US2] Manually test Scenario 6 from quickstart.md (authenticated user accessing auth pages)
- [ ] T027 [US2] Manually test Scenario 7 from quickstart.md (authenticated access to dashboard routes)

**Checkpoint**: User Story 2 complete - Authenticated users have seamless dashboard access

---

## Phase 5: User Story 3 - Return to Intended Destination (Priority: P3)

**Goal**: Redirect users to their originally requested route after successful login

**Independent Test**: Access a specific dashboard route while unauthenticated, login, and verify redirect to original route

### Implementation for User Story 3

- [x] T028 [US3] Verify redirect parameter is set correctly in middleware.ts:51-57
- [x] T029 [US3] Update login page to extract redirect query parameter using useSearchParams in app/auth/login/page.tsx
- [x] T030 [US3] Add validateRedirectUrl call before redirecting in app/auth/login/page.tsx to prevent open redirects
- [x] T031 [US3] Implement post-login redirect logic using router.push() in app/auth/login/page.tsx
- [x] T032 [US3] Add default redirect to /dashboard if no redirect param in app/auth/login/page.tsx
- [x] T033 [US3] Add loading state indicator during post-login redirect in app/auth/login/page.tsx
- [x] T034 [US3] Add data-testid="login-form" to login form for testing in app/auth/login/page.tsx
- [ ] T035 [US3] Manually test Scenario 4 from quickstart.md (login with redirect parameter)
- [ ] T036 [US3] Manually test Scenario 5 from quickstart.md (login without redirect parameter)
- [ ] T037 [US3] Test edge case: redirect loop prevention (redirect param pointing to /auth)
- [ ] T038 [US3] Test edge case: external redirect attempt (malicious redirect parameter)

**Checkpoint**: User Story 3 complete - Post-login navigation preserves user intent

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T039 [P] Add inline code comments to middleware explaining route protection logic in middleware.ts
- [x] T040 [P] Add TypeScript types for route patterns in middleware.ts
- [x] T041 [P] Verify all loading states meet accessibility requirements (WCAG 2.1 AA)
- [ ] T042 Verify middleware execution time is <100ms using performance measurement from quickstart.md
- [ ] T043 Test all edge cases from quickstart.md Edge Cases section
- [ ] T044 [P] Run browser compatibility tests from quickstart.md (Chrome, Firefox, Safari, Edge)
- [ ] T045 [P] Run accessibility tests from quickstart.md (keyboard navigation, screen reader)
- [ ] T046 Verify all success criteria from spec.md are met (SC-001 through SC-005)
- [ ] T047 Run full manual test suite from quickstart.md and document results
- [ ] T048 Update CLAUDE.md if any new patterns or conventions were established

**Checkpoint**: Feature complete and validated - ready for code review

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T005) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion (T006-T009)
  - US1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - US2 (Phase 4): Can start after Foundational - Minimal dependency on US1 (middleware changes)
  - US3 (Phase 5): Depends on US1 and US2 (requires middleware redirect + login page)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

```
Foundational (T006-T009)
         │
         ├──────────────┬──────────────┐
         │              │              │
      US1 (T010-T018)   │              │
         │              │              │
         └────────► US2 (T019-T027)    │
                        │              │
                        └──────► US3 (T028-T038)
                                       │
                                       ▼
                                Polish (T039-T048)
```

### Recommended Execution Order

**Sequential (Single Developer)**:

1. Complete Phase 1: Setup (T001-T005) - can parallelize within phase
2. Complete Phase 2: Foundational (T006-T009) - sequential, builds on each other
3. Complete Phase 3: US1 (T010-T018) - test after T018
4. Complete Phase 4: US2 (T019-T027) - test after T027
5. Complete Phase 5: US3 (T028-T038) - test after T038
6. Complete Phase 6: Polish (T039-T048) - can parallelize within phase

**Parallel (Multiple Developers)**:

1. All developers: Phase 1 (T001-T005 in parallel)
2. One developer: Phase 2 (T006-T009 sequential)
3. After Phase 2 complete:
   - Developer A: US1 (T010-T018)
   - Developer B: Can work on US2 setup (T019-T021) after reviewing US1 middleware changes
   - Developer C: Prepare loading states and auth hook (T015, T022, T024)
4. Coordinate US3 after US1 and US2 complete
5. All developers: Polish tasks in parallel

### Within Each User Story

**User Story 1** (T010-T018):

- T010-T015: Can be done in parallel (different concerns)
- T016-T018: Manual tests - sequential after implementation

**User Story 2** (T019-T027):

- T019-T021: Verification tasks - sequential
- T022-T024: Can be done in parallel (different files)
- T025-T027: Manual tests - sequential after implementation

**User Story 3** (T028-T038):

- T028: Verification (prerequisite)
- T029-T034: Login page changes - sequential
- T035-T038: Manual tests - can be done in parallel

### Parallel Opportunities

**Setup Phase**:

```bash
# All can run in parallel:
Task T001: Create lib/supabase/ structure
Task T002: Create lib/supabase/client.ts
Task T003: Create lib/supabase/server.ts
Task T004: Create hooks/ structure
Task T005: Create tests/ structure
```

**User Story 1**:

```bash
# Can run in parallel:
Task T010: Update middleware dashboard protection
Task T014: Add data-testid to layout
Task T015: Add loading.tsx
```

**User Story 2**:

```bash
# Can run in parallel:
Task T022: Create useAuth hook
Task T024: Update loading states for accessibility
```

**Polish Phase**:

```bash
# Can run in parallel:
Task T039: Add code comments
Task T040: Add TypeScript types
Task T041: Verify accessibility
Task T044: Browser compatibility tests
Task T045: Accessibility tests
```

---

## Parallel Example: User Story 1

```bash
# Launch parallel implementation tasks:
Task: "Update middleware to use isDashboardRoute helper for explicit dashboard protection in middleware.ts:41-57"
Task: "Add data-testid='protected-route' to dashboard layout for testing in app/(dashboard)/layout.tsx:10"
Task: "Add loading.tsx to dashboard route group at app/(dashboard)/loading.tsx with skeleton UI"

# Then run sequential manual tests:
Task: "Manually test Scenario 1 from quickstart.md (unauthenticated access to /dashboard)"
Task: "Manually test Scenario 2 from quickstart.md (unauthenticated access to /guests)"
Task: "Manually test Scenario 3 from quickstart.md (session expiry during active use)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T009) - CRITICAL
3. Complete Phase 3: User Story 1 (T010-T018)
4. **STOP and VALIDATE**: Run manual tests T016-T018
5. Verify success criteria SC-001 and SC-005
6. Deploy/demo if ready

**Outcome**: Dashboard routes are now protected - unauthenticated users cannot access them

### Incremental Delivery

1. **Foundation** (Phases 1-2): Setup + Middleware enhancements
2. **MVP Release** (Phase 3): US1 - Protection works, users redirected to login
3. **V2 Release** (Phase 4): US2 - Authenticated users have seamless access
4. **V3 Release** (Phase 5): US3 - Post-login redirect preserves user intent
5. **Final Polish** (Phase 6): Accessibility, performance, edge cases validated

Each release is independently testable and adds value without breaking previous functionality.

### Parallel Team Strategy

**Team of 3 Developers**:

1. **Phase 1 (Setup)**:
   - Dev A: Supabase clients (T001-T003)
   - Dev B: Directory structure (T004-T005)
   - Lead: Review existing middleware (T006)

2. **Phase 2 (Foundational)** - Sequential by one developer:
   - Lead: T006-T009 (middleware foundation)

3. **Phase 3-5 (User Stories)** - After Phase 2 complete:
   - Dev A: US1 (T010-T018) - Core protection
   - Dev B: US2 prep (T022, T024) - Auth hook and loading states
   - Dev C: Documentation and test prep

4. **Phase 6 (Polish)** - All developers in parallel:
   - Dev A: Comments and types (T039-T040)
   - Dev B: Accessibility tests (T041, T045)
   - Dev C: Browser and performance tests (T042, T044)

---

## Task Statistics

- **Total Tasks**: 48
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 4 tasks
- **User Story 1 (P1)**: 9 tasks
- **User Story 2 (P2)**: 9 tasks
- **User Story 3 (P3)**: 11 tasks
- **Polish Phase**: 10 tasks

**Parallelizable Tasks**: 15 tasks marked with [P]

**Testing Approach**: Manual testing via quickstart.md scenarios (no automated tests requested in spec)

---

## MVP Scope (Minimum Viable Product)

**Recommended MVP**: Phase 1 + Phase 2 + Phase 3 (US1 only)

**Deliverables**:

- ✅ Supabase client utilities
- ✅ Enhanced middleware with explicit dashboard protection
- ✅ Unauthenticated users redirected to login
- ✅ Redirect parameter preserved
- ✅ Session expiry detection
- ✅ Loading states for dashboard routes
- ✅ Manual test validation

**Success Criteria for MVP**:

- SC-001: 100% of unauthenticated access attempts redirect to login ✅
- SC-005: Zero unauthorized access in testing ✅

**Time Estimate**: ~6-8 hours for solo developer (assuming existing middleware works)

**Post-MVP**: Add US2 and US3 for complete user experience

---

## Notes

- [P] tasks = different files/concerns, no dependencies - can parallelize
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Middleware changes (Phase 2) are foundational - must complete before user stories
- Manual testing strategy using quickstart.md (no automated tests per spec)
- Performance target: <100ms middleware execution (verify in T042)
- Security critical: Validate all redirect URLs (T008, T030)
- Accessibility required: WCAG 2.1 AA (verify in T041)
- Follow constitution naming conventions (PascalCase components, camelCase functions)
- Commit after each logical group of tasks
- Stop at checkpoints to validate story independently
