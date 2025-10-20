# Tasks: Vehicle Sticker Request List Page

**Input**: Design documents from `/specs/feat/vehicle-sticker-list/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/stickers-api.md, quickstart.md

**Tests**: Tests are NOT explicitly requested in the specification. Test tasks are excluded per guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Next.js App Router)**: Files at repository root
  - Pages: `app/(dashboard)/[feature]/`
  - Components: `components/features/[feature]/`
  - Hooks: `lib/hooks/`
  - API clients: `lib/api/`
  - Types: `types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare type definitions and shared utilities needed across all user stories

- [x] T001 [P] Add StickerFilterParams interface to types/sticker.ts
- [x] T002 [P] Add StickerListResponse interface to types/sticker.ts
- [x] T003 [P] Create StatusBadgeConfig type mapping for sticker status badges (component-internal, documented for reference)

**Checkpoint**: Type definitions ready for component and hook implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API client and data hook infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create new file lib/api/stickers.ts with fetchStickerRequests function
- [x] T005 Implement Supabase query builder in lib/api/stickers.ts (select with count, ordering)
- [x] T006 Implement status filter logic in lib/api/stickers.ts (apply if filters.status provided)
- [x] T007 Implement householdId filter logic in lib/api/stickers.ts (apply if filters.householdId provided)
- [x] T008 Implement pagination logic in lib/api/stickers.ts (calculate from/to range from page and pageSize)
- [x] T009 Implement snake_case to camelCase transformation in lib/api/stickers.ts (map all StickerRequest fields)
- [x] T010 Implement response structure builder in lib/api/stickers.ts (return StickerListResponse with requests, count, page, pageSize, totalPages)
- [x] T011 Add stickerKeys query key factory to lib/hooks/useStickers.ts (all, lists, list, details, detail)
- [x] T012 Add useStickerRequests hook to lib/hooks/useStickers.ts (useQuery with stickerKeys.list and fetchStickerRequests)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View All Sticker Requests (Priority: P1) 🎯 MVP

**Goal**: Residents can view all their household's vehicle sticker requests in a card-based layout with real-time updates

**Independent Test**: Navigate to /stickers, verify all household requests display as cards with vehicle info and status, submit new request from another tab and confirm it appears automatically

### Implementation for User Story 1

- [x] T013 [P] [US1] Create StickerCard component in components/features/stickers/StickerCard.tsx
- [x] T014 [P] [US1] Create StickerStatusBadge component in components/features/stickers/StickerStatusBadge.tsx
- [x] T015 [US1] Implement card layout structure in StickerCard.tsx (Link wrapper, Card with CardHeader and CardContent)
- [x] T016 [US1] Implement CardHeader section in StickerCard.tsx (vehicle plate number as title, make/model as subtitle, status badge)
- [x] T017 [US1] Implement CardContent section in StickerCard.tsx (vehicle details row with Car icon, sticker type row with Tag icon, submitted date row with Calendar icon, reviewed date row with CheckCircle/XCircle icon if reviewed)
- [x] T018 [US1] Add navigation link to StickerCard.tsx (ROUTES.STICKERS.DETAIL with request.id)
- [x] T019 [US1] Implement status badge rendering in StickerStatusBadge.tsx (create statusConfig mapping with labels and DaisyUI badge classes)
- [x] T020 [US1] Apply badge color classes in StickerStatusBadge.tsx (pending→badge-warning, approved→badge-success, rejected→badge-error, cancelled→badge-ghost)
- [x] T021 [US1] Create main page component in app/(dashboard)/stickers/page.tsx
- [x] T022 [US1] Implement state management in page.tsx (useState for currentPage and statusFilter)
- [x] T023 [US1] Implement data fetching in page.tsx (useStickerRequests with householdId from auth, status filter, page, pageSize)
- [x] T024 [US1] Implement header section in page.tsx (title "Vehicle Sticker Requests", description, "Request New Sticker" button linking to ROUTES.STICKERS.NEW)
- [x] T025 [US1] Implement loading state in page.tsx (SkeletonList with 5 items when isLoading)
- [x] T026 [US1] Implement empty state in page.tsx (dashed border card with message, "Request First Sticker" button when no requests)
- [x] T027 [US1] Implement card grid layout in page.tsx (grid gap-4 md:grid-cols-2 lg:grid-cols-3, map requests to StickerCard components)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can view all sticker requests

---

## Phase 4: User Story 2 - Filter Requests by Status (Priority: P2)

**Goal**: Residents can filter vehicle sticker requests by status to quickly find pending requests or view only approved stickers

**Independent Test**: Click "Pending" filter button, verify only pending requests display; click "All", verify all requests display; click "Rejected" with no rejected requests, verify empty state with appropriate message

### Implementation for User Story 2

- [x] T029 [US2] Implement filter section layout in app/(dashboard)/stickers/page.tsx (flex container with Filter icon, label, and filter buttons)
- [x] T030 [US2] Implement status filter buttons in app/(dashboard)/stickers/page.tsx (all, pending, approved, rejected, cancelled buttons)
- [x] T031 [US2] Implement filter button styling in app/(dashboard)/stickers/page.tsx (variant primary for active filter, outline for inactive, size sm)
- [x] T032 [US2] Implement handleStatusFilterChange function in app/(dashboard)/stickers/page.tsx (update statusFilter state, reset currentPage to 1)
- [x] T033 [US2] Update empty state message in app/(dashboard)/stickers/page.tsx (conditional message based on statusFilter - "No requests" vs "No {status} requests")

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - filtering works correctly and doesn't break basic list view

---

## Phase 5: User Story 3 - Navigate Through Paginated Results (Priority: P2)

**Goal**: Residents with many vehicle sticker requests can browse through them in manageable pages (10 per page)

**Independent Test**: Create 25+ sticker requests, verify first page shows 10 requests with pagination controls, click "Next", verify second page shows next 10 requests, click page number directly, verify navigation works

### Implementation for User Story 3

- [x] T034 [US3] Implement pagination controls layout in app/(dashboard)/stickers/page.tsx (flex container with PaginationInfo and Pagination components)
- [x] T035 [US3] Add PaginationInfo component in app/(dashboard)/stickers/page.tsx (pass currentPage, pageSize, totalCount)
- [x] T036 [US3] Add Pagination component in app/(dashboard)/stickers/page.tsx (pass currentPage, totalPages, onPageChange handler)
- [x] T037 [US3] Implement handlePageChange function in app/(dashboard)/stickers/page.tsx (update currentPage state with new page number)
- [x] T038 [US3] Integrate pagination with filter reset in app/(dashboard)/stickers/page.tsx (ensure handleStatusFilterChange resets to page 1)

**Checkpoint**: All pagination functionality works - users can navigate through multiple pages, pagination resets when filter changes

---

## Phase 6: User Story 4 - Request New Vehicle Sticker (Priority: P1)

**Goal**: Residents can initiate a new vehicle sticker request directly from the list page

**Independent Test**: Click "Request New Sticker" button from list page, verify navigation to /stickers/new; view empty state, click request button, verify navigation to /stickers/new

### Implementation for User Story 4

- [x] T039 [US4] Verify "Request New Sticker" button in header section of app/(dashboard)/stickers/page.tsx (Link to ROUTES.STICKERS.NEW with Plus icon, implemented in T024)
- [x] T040 [US4] Verify "Request First Sticker" button in empty state of app/(dashboard)/stickers/page.tsx (Link to ROUTES.STICKERS.NEW with Plus icon, implemented in T026)

**Checkpoint**: Navigation to sticker request form works from both header button and empty state - User Story 4 complete

---

## Phase 7: User Story 5 - View Detailed Request Information (Priority: P3)

**Goal**: Residents can see complete details about a specific sticker request including submission date, review date, and vehicle information

**Independent Test**: Click a sticker card, verify navigation occurs to detail page (detail page implementation is out of scope, only navigation verified)

### Implementation for User Story 5

- [x] T041 [US5] Verify card click navigation in components/features/stickers/StickerCard.tsx (Link wrapper navigates to ROUTES.STICKERS.DETAIL(request.id), implemented in T018)

**Checkpoint**: Card click navigation works - User Story 5 complete (detail page implementation is out of scope per spec.md)

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final refinements

- [x] T042 [P] Add hover effect to StickerCard in components/features/stickers/StickerCard.tsx (transition-shadow hover:shadow-lg classes)
- [x] T043 [P] Add data-testid attributes to interactive elements in app/(dashboard)/stickers/page.tsx (filter buttons, pagination controls, "Request New Sticker" button)
- [x] T044 [P] Add data-testid attributes to StickerCard in components/features/stickers/StickerCard.tsx (card wrapper, status badge)
- [x] T045 [P] Verify mobile responsive layout in app/(dashboard)/stickers/page.tsx (test at 375px, 768px, 1024px - grid columns adjust correctly)
- [x] T046 [P] Verify WCAG 2.1 AA compliance in all components (color contrast ratios, keyboard navigation, screen reader support)
- [x] T047 [P] Add formatDate utility usage in StickerCard.tsx for submission and review dates (import from lib/utils/formatters)
- [x] T048 Verify real-time updates work correctly (test INSERT, UPDATE, DELETE events trigger query invalidation)
- [x] T049 Verify all edge cases from spec.md (household quota exceeded display, network connectivity loss handling, pagination during real-time updates)
- [x] T050 Run manual testing checklist from quickstart.md (page loads, filters work, pagination works, empty states, loading states, real-time updates, mobile responsive)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Stories 1, 2, 3 can proceed in parallel after Foundational (different concerns)
  - User Story 4 depends on User Story 1 (buttons added in US1 implementation)
  - User Story 5 depends on User Story 1 (card navigation added in US1 implementation)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable
- **User Story 4 (P1)**: Depends on US1 (T025, T027) - Verifies buttons added in US1
- **User Story 5 (P3)**: Depends on US1 (T018) - Verifies navigation added in US1

### Within Each User Story

- Components can be created in parallel (StickerCard and StickerStatusBadge in US1)
- Page implementation tasks must be sequential (state → data fetching → rendering)
- Polish tasks can all run in parallel (different aspects of quality)

### Parallel Opportunities

- **Phase 1**: All 3 type definition tasks can run in parallel [T001, T002, T003]
- **Phase 2**: API client implementation is sequential (builds upon previous steps)
- **User Story 1**: T013 and T014 can run in parallel (different component files)
- **User Story 1**: Card structure tasks are mostly sequential within StickerCard component
- **Polish Phase**: All data-testid tasks can run in parallel [T043, T044], WCAG verification [T046], formatDate utility [T047]

---

## Parallel Example: User Story 1

```bash
# Launch both component files together (no dependencies):
Task: "Create StickerCard component in components/features/stickers/StickerCard.tsx"
Task: "Create StickerStatusBadge component in components/features/stickers/StickerStatusBadge.tsx"

# After both component shells exist, implement their internals:
# (These are sequential within each component but can be done in parallel across components)
```

---

## Parallel Example: Polish Phase

```bash
# Launch all test attribute additions together (different files/sections):
Task: "Add data-testid attributes to interactive elements in app/(dashboard)/stickers/page.tsx"
Task: "Add data-testid attributes to StickerCard in components/features/stickers/StickerCard.tsx"

# Launch accessibility and responsive checks together:
Task: "Verify mobile responsive layout in app/(dashboard)/stickers/page.tsx"
Task: "Verify WCAG 2.1 AA compliance in all components"
Task: "Add formatDate utility usage in StickerCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 4 Only)

1. Complete Phase 1: Setup → Type definitions ready
2. Complete Phase 2: Foundational → API client and hooks ready (CRITICAL)
3. Complete Phase 3: User Story 1 → Basic list view with real-time updates
4. Complete Phase 6: User Story 4 → Navigation to request form
5. **STOP and VALIDATE**: Test basic list view and request navigation
6. Deploy/demo if ready

**Value Delivered**: Residents can view their sticker requests and create new ones - core functionality complete!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic list view! 🎯)
3. Add User Story 2 → Test independently → Deploy/Demo (Filtering added)
4. Add User Story 3 → Test independently → Deploy/Demo (Pagination added)
5. Add User Story 4 → Test independently → Deploy/Demo (Navigation confirmed)
6. Add User Story 5 → Test independently → Deploy/Demo (Card click confirmed)
7. Polish Phase → Final quality pass → Deploy/Demo (Production ready)

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers (after Foundational phase):

1. **Developer A**: User Story 1 (core list view) - Priority P1
2. **Developer B**: User Story 2 (filtering) - Priority P2 (can start in parallel)
3. **Developer C**: User Story 3 (pagination) - Priority P2 (can start in parallel)
4. Once US1 complete: Developer D can verify US4 and US5 (quick verification tasks)
5. All converge on Polish Phase

**Note**: While US2 and US3 can technically start in parallel with US1, it's recommended to wait for US1 completion to avoid merge conflicts in `page.tsx`.

---

## Task Summary

**Total Tasks**: 50

- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 9 tasks (BLOCKING - must complete first)
- **Phase 3 (US1 - View All)**: 16 tasks (P1 - MVP core)
- **Phase 4 (US2 - Filter)**: 5 tasks (P2)
- **Phase 5 (US3 - Pagination)**: 5 tasks (P2)
- **Phase 6 (US4 - Request New)**: 2 tasks (P1 - verification only)
- **Phase 7 (US5 - View Detail)**: 1 task (P3 - verification only)
- **Phase 8 (Polish)**: 9 tasks (cross-cutting quality)

**Parallel Opportunities**: 6 tasks can run in parallel (marked with [P])

- 3 in Setup phase (type definitions)
- 2 in User Story 1 (component creation)
- 5 in Polish phase (test attributes, verification)

**Independent Test Criteria**: Each user story has clear, independent test criteria documented

**MVP Scope**: Phases 1 + 2 + 3 + 6 (Setup + Foundational + US1 + US4) = Core functionality (29 tasks)

---

## Notes

- All tasks follow strict checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- [P] tasks = different files or sections, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable after its phase completes
- Commit after each task or logical group of related tasks
- Stop at any checkpoint to validate story independently
- Tests are NOT included as they were not requested in specification
- Reference `research.md` for guest list patterns when implementing
- Reference `data-model.md` for type structures and transformations
- Reference `contracts/stickers-api.md` for API implementation details
- Reference `quickstart.md` for testing scenarios and debugging help

**Key Pattern**: This feature copies the guests list implementation pattern - when in doubt during implementation, check `app/(dashboard)/guests/page.tsx` and adapt for stickers.
