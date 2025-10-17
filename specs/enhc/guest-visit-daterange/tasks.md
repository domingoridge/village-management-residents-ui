# Tasks: Guest Visit Date Range Picker

**Input**: Design documents from `/specs/enhc/guest-visit-daterange/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification - focusing on implementation tasks

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router structure: `app/`, `components/`, `lib/`, `hooks/`, `types/`
- Tests in `__tests__/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create base project structure for date range picker

- [x] T001 Install react-calendar package: `npm install react-calendar`
- [x] T002 Install react-calendar type definitions: `npm install --save-dev @types/react-calendar`
- [x] T003 [P] Import react-calendar base styles in global CSS or app layout

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, utilities, and schema updates that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create TypeScript types for date range in `types/calendar.ts` (DateRange, FormattedDateRange)
- [x] T005 [P] Create date helper utilities in `lib/utils/dateHelpers.ts` (calculateVisitDuration, formatDateRange, toISODateString, isValidDateRange)
- [x] T006 [P] Add date range validation functions in `lib/utils/validation.ts` (isWithin30Days, isValidDateRange)
- [x] T007 Update guest schema in `lib/schemas/guest.ts` - replace expectedArrivalDate with visitDateStart, visitDateEnd, visitDuration fields
- [x] T008 Update CreateGuestInput type in `lib/schemas/guest.ts` to include new date range fields
- [x] T009 Add zod validation for date range in `lib/schemas/guest.ts` (.refine for end >= start)
- [x] T010 Update createGuest API mapping in `lib/api/guests.ts` - map visitDateStart → visit_start_date, visitDateEnd → visit_end_date, visitDuration

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Specify Visit Duration for Multi-Day Guests (Priority: P1) 🎯 MVP

**Goal**: Enable residents to select a date range (start and end dates) for guest visits, with automatic duration calculation and validation to prevent invalid ranges.

**Independent Test**: Fill out the guest form with a multi-day date range (e.g., Dec 20-27), submit the form, and verify the authorization stores both dates and calculated duration correctly in the database.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create DateRangePicker component in `components/ui/DateRangePicker.tsx` with react-calendar integration, selectRange prop, and basic styling
- [ ] T012 [P] [US1] Add WCAG 2.1 AA accessibility features to DateRangePicker: ARIA labels (navigationAriaLabel, nextAriaLabel, etc.), aria-live region for announcements, and sr-only status messages
- [ ] T013 [P] [US1] Style DateRangePicker with Tailwind CSS and DaisyUI theme colors, ensure 44x44px touch targets, add focus indicators
- [ ] T014 [US1] Add minDate (today) and maxDate (today + 30 days) constraints to DateRangePicker component
- [ ] T015 [US1] Display calculated visit duration below calendar in DateRangePicker component
- [ ] T016 [US1] Add error message display to DateRangePicker component (show validation errors via props)
- [ ] T017 [US1] Update GuestForm component in `components/features/guests/GuestForm.tsx` - import Controller from react-hook-form
- [ ] T018 [US1] Replace expectedArrivalDate Input with Controller-wrapped DateRangePicker in GuestForm
- [ ] T019 [US1] Add setValue calls in DateRangePicker onChange to update both visitDateStart and visitDateEnd fields
- [ ] T020 [US1] Update form submission handler in GuestForm to calculate and include visitDuration before calling onSubmit
- [ ] T021 [US1] Add data-testid="date-range-picker" attribute to DateRangePicker for test automation
- [ ] T022 [US1] Test multi-day date range selection in the form - verify dates are stored correctly and duration is calculated

**Checkpoint**: At this point, User Story 1 should be fully functional - residents can select multi-day visit ranges with validation

---

## Phase 4: User Story 2 - Quick Single-Day Visit Entry (Priority: P2)

**Goal**: Automatically default the end date to match the start date when only start date is selected, enabling quick single-day visit entry without duplicate selections.

**Independent Test**: Select only a start date in the date picker and verify the end date automatically fills with the same date, then submit the form and confirm visit_duration = 1.

### Implementation for User Story 2

- [ ] T023 [US2] Add auto-fill logic to DateRangePicker onChange handler - if endDate is null, set it to startDate
- [ ] T024 [US2] Update DateRangePicker to handle single date selection (when user clicks only one date, auto-complete the range)
- [ ] T025 [US2] Add visual feedback in DateRangePicker to show when end date auto-fills (subtle UI indication)
- [ ] T026 [US2] Test single-day visit selection - verify end date auto-fills and form submission works correctly

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - multi-day and single-day visits both supported

---

## Phase 5: User Story 3 - Advance Booking for Extended Stays (Priority: P3)

**Goal**: Allow residents to pre-authorize guests up to 30 days in advance with clear validation messages when exceeding the limit.

**Independent Test**: Select a start date exactly 30 days in the future with a multi-day range, verify it's accepted. Then try 31 days in the future and verify the validation error appears.

### Implementation for User Story 3

- [ ] T027 [US3] Ensure maxDate prop in DateRangePicker correctly enforces 30-day limit from today
- [ ] T028 [US3] Add client-side validation message in DateRangePicker when attempting to select dates beyond 30 days
- [ ] T029 [US3] Verify zod schema validation in `lib/schemas/guest.ts` enforces isWithin30Days for visitDateStart
- [ ] T030 [US3] Test advance booking scenarios - verify 30-day limit enforcement and helpful error messages
- [ ] T031 [US3] Test future multi-day ranges (e.g., start 25 days out, end 28 days out) to ensure proper validation

**Checkpoint**: All user stories should now be independently functional - full date range picker feature complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality checks

- [ ] T032 [P] Add keyboard navigation documentation to DateRangePicker component comments (arrow keys, Enter/Space)
- [ ] T033 [P] Verify mobile responsiveness of DateRangePicker on small screens (<375px width)
- [ ] T034 [P] Test dark mode support for DateRangePicker with Tailwind dark: classes
- [ ] T035 [P] Add helper text to date range field in GuestForm explaining the 30-day advance booking limit
- [ ] T036 Update help text in `app/(dashboard)/guests/new/page.tsx` to mention date range selection instead of single arrival date
- [ ] T037 [P] Run linter and fix any TypeScript errors: `npm run lint`
- [ ] T038 [P] Verify Husky pre-commit hooks pass with all changes
- [ ] T039 Test complete form flow end-to-end: fill all fields including date range, submit, verify in database
- [ ] T040 Manual accessibility testing with screen reader (VoiceOver or NVDA) to verify ARIA announcements
- [ ] T041 Browser compatibility testing on Chrome, Firefox, Safari latest versions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1's DateRangePicker but is independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses existing validation infrastructure, independently testable

### Within Each User Story

**User Story 1** (T011-T022):

- T011-T016 (DateRangePicker component creation) can run in parallel
- T017-T020 (GuestForm integration) must run after DateRangePicker exists
- T021-T022 (testing) must run after integration complete

**User Story 2** (T023-T026):

- Requires DateRangePicker from US1 to exist
- All tasks sequential, building on auto-fill logic

**User Story 3** (T027-T031):

- Requires DateRangePicker and validation infrastructure
- Tasks can run in parallel except testing (T030-T031) which runs last

### Parallel Opportunities

- **Phase 1**: All 3 setup tasks can run in parallel
- **Phase 2**: Tasks T004-T006 (types and utilities) can run in parallel. T007-T010 (schema updates) must run sequentially.
- **Phase 3 (US1)**: T011-T013 (DateRangePicker component structure, accessibility, styling) can run in parallel
- **Phase 6**: Tasks T032-T035 and T037-T038 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch DateRangePicker component tasks together:
Task: "Create DateRangePicker component in components/ui/DateRangePicker.tsx"
Task: "Add WCAG 2.1 AA accessibility features to DateRangePicker"
Task: "Style DateRangePicker with Tailwind CSS and DaisyUI"

# After DateRangePicker is complete, integrate into form:
Task: "Update GuestForm component - import Controller from react-hook-form"
Task: "Replace expectedArrivalDate Input with Controller-wrapped DateRangePicker"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T010) - CRITICAL
3. Complete Phase 3: User Story 1 (T011-T022)
4. **STOP and VALIDATE**: Test multi-day date range selection independently
5. Deploy/demo if ready

**MVP Deliverable**: Residents can select multi-day visit date ranges with validation. This is the core value proposition.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test multi-day ranges → Deploy/Demo (MVP!)
3. Add User Story 2 → Test single-day auto-fill → Deploy/Demo
4. Add User Story 3 → Test advance booking validation → Deploy/Demo
5. Polish → Final quality checks → Production release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T010)
2. Once Foundational is done:
   - Developer A: User Story 1 (T011-T022) - Core date range picker
   - Developer B: Can start User Story 2 prep (review US1 code, plan auto-fill)
3. After US1 complete:
   - Developer A: Polish tasks
   - Developer B: User Story 2 (T023-T026)
   - Developer C: User Story 3 (T027-T031) in parallel

---

## Task Summary

**Total Tasks**: 41

**By Phase**:

- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (US1): 12 tasks
- Phase 4 (US2): 4 tasks
- Phase 5 (US3): 5 tasks
- Phase 6 (Polish): 10 tasks

**By User Story**:

- User Story 1: 12 tasks (T011-T022)
- User Story 2: 4 tasks (T023-T026)
- User Story 3: 5 tasks (T027-T031)

**Parallel Opportunities**: 14 tasks marked [P] for parallel execution

**Independent Test Criteria**:

- US1: Submit form with multi-day date range, verify database storage and duration calculation
- US2: Select single date, verify auto-fill behavior and duration = 1
- US3: Test 30-day limit enforcement with appropriate validation messages

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 22 tasks

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Database migration (mentioned in quickstart.md) is backend work - out of scope for this frontend feature
- Tests are not included as they were not explicitly requested in the specification
- Focus on constitution compliance: TypeScript strict mode, WCAG 2.1 AA, mobile-first, component-driven

---

## Format Validation

✅ All tasks follow required format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ Sequential Task IDs (T001-T041)
✅ Parallel tasks marked with [P]
✅ User story tasks marked with [US1], [US2], [US3]
✅ Setup and Foundational tasks have no story label
✅ Polish tasks have no story label
✅ All task descriptions include specific file paths or clear actions
