# Tasks: Vehicle Sticker Request System

**Input**: Design documents from `/specs/feat/vehicle-sticker-request/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT explicitly requested in the spec, so test tasks are excluded. Focus is on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `app/`, `components/`, `lib/`, `types/`, `constants/` at repository root
- All paths shown are absolute from repository root
- Following Next.js 15 App Router conventions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database setup and project configuration for sticker requests

- [x] T001 Run Supabase migration to create sticker_requests table from data-model.md
- [x] T002 Add sticker_quota column to households table in Supabase
- [x] T003 [P] Create Supabase Storage bucket 'sticker-documents' with RLS policies
- [x] T004 [P] Create TypeScript types in types/sticker.ts (StickerType, StickerRequestStatus, StickerRequest, VehicleFormData, HouseholdQuota)
- [x] T005 [P] Create constants file in constants/stickers.ts (file limits, accepted types, routes)

**Checkpoint**: Database schema and basic types ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services and schemas that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Zod validation schemas in lib/schemas/sticker.ts (vehicleFormSchema, stickerRequestFormSchema, file validation helpers)
- [x] T007 [P] Implement Supabase service layer in lib/services/stickerService.ts (getHouseholdQuota, uploadDocument, createStickerRequest)
- [x] T008 [P] Create useHouseholdQuota hook in lib/hooks/useStickers.ts with TanStack Query
- [x] T009 Create useCreateStickerRequests mutation hook in lib/hooks/useStickers.ts with rollback logic

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Single Vehicle Sticker Request (Priority: P1) 🎯 MVP

**Goal**: Resident can submit a sticker request for one vehicle with documents and receive confirmation

**Independent Test**: Navigate to /stickers/new, complete form for one vehicle with valid information and documents, submit, verify confirmation message appears and dashboard redirect occurs. Delivers the ability for residents to formally request vehicle access authorization.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create QuotaWarning component in components/features/stickers/QuotaWarning.tsx (displays used/total quota, visual indicator)
- [x] T011 [P] [US1] Create DocumentUploadField component in components/features/stickers/DocumentUploadField.tsx (file input, preview, validation, remove/replace)
- [x] T012 [US1] Create VehicleSection component in components/features/stickers/VehicleSection.tsx (single vehicle form fields: plate, make, model, color, year, registeredTo, stickerType, 3 document uploads)
- [x] T013 [US1] Create StickerRequestForm component in components/features/stickers/StickerRequestForm.tsx (React Hook Form setup, single vehicle form, quota check, submit handler)
- [x] T014 [US1] Create new sticker request page in app/(dashboard)/stickers/new/page.tsx (page component, auth check, quota fetch, form integration, success redirect)
- [x] T015 [US1] Add ROUTES.STICKERS constants to constants/stickers.ts (NEW, LIST, DETAIL routes)
- [x] T016 [US1] Add navigation link to stickers page in dashboard layout navigation
- [ ] T017 [US1] Test single vehicle submission end-to-end (form fill, document upload, database record creation, toast notification, redirect)

**Checkpoint**: At this point, User Story 1 should be fully functional - resident can submit one vehicle sticker request

---

## Phase 4: User Story 2 - Multiple Vehicle Sticker Requests (Priority: P2)

**Goal**: Resident can submit sticker requests for multiple vehicles in a single session using "Add Another Vehicle" functionality

**Independent Test**: Access sticker request page, fill out one vehicle, click "Add Another Vehicle", complete information for a second vehicle, verify both vehicles appear in submission, submit successfully with all request IDs displayed.

**Dependencies**: Requires User Story 1 components (extends single-vehicle form)

### Implementation for User Story 2

- [ ] T018 [US2] Add useFieldArray integration to StickerRequestForm in components/features/stickers/StickerRequestForm.tsx (React Hook Form array management, default single vehicle)
- [ ] T019 [US2] Add "Add Another Vehicle" button to StickerRequestForm with quota validation (disable if at quota limit)
- [ ] T020 [US2] Add remove vehicle functionality to VehicleSection component (show remove button if > 1 vehicle, update array on remove)
- [ ] T021 [US2] Add vehicle numbering labels to VehicleSection (Vehicle 1, Vehicle 2, etc. in section headers)
- [ ] T022 [US2] Update form submission logic in StickerRequestForm to handle multiple vehicles (loop through vehicles array, create request per vehicle)
- [ ] T023 [US2] Update success toast in lib/hooks/useStickers.ts to display all request IDs from multi-vehicle submission
- [ ] T024 [US2] Update quota validation to prevent exceeding household limit when adding vehicles
- [ ] T025 [US2] Test multi-vehicle submission end-to-end (add 3 vehicles, submit, verify 3 separate database records created, all request IDs shown in toast)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - single or multiple vehicle submissions

---

## Phase 5: User Story 3 - Document Upload Management (Priority: P2)

**Goal**: Resident can upload required documents (OR, CR) and optional vehicle photo with validation, preview, and replace functionality

**Independent Test**: Click upload buttons, select files of various formats and sizes, verify previews appear, test file removal, confirm validation messages for invalid files (oversized, wrong type).

**Dependencies**: Requires DocumentUploadField component from User Story 1 (enhances existing upload component)

### Implementation for User Story 3

- [ ] T026 [US3] Add file preview generation to DocumentUploadField (image preview for JPG/PNG, filename display for PDF)
- [ ] T027 [US3] Add file size validation to DocumentUploadField with user-friendly error messages (5MB limit)
- [ ] T028 [US3] Add file type validation to DocumentUploadField with accepted formats list display
- [ ] T029 [US3] Add remove/replace file functionality to DocumentUploadField (clear button, re-upload capability)
- [ ] T030 [US3] Add upload progress indicator to DocumentUploadField for large files
- [ ] T031 [US3] Add visual distinction between required and optional document uploads in VehicleSection
- [ ] T032 [US3] Implement client-side image compression in stickerService.ts for photos > 2MB (before upload, optional optimization)
- [ ] T033 [US3] Add upload error handling in useCreateStickerRequests hook (network failures, storage errors, rollback on failure)
- [ ] T034 [US3] Test document upload edge cases (file too large, unsupported format, network failure, partial upload)

**Checkpoint**: All document upload features functional - validation, preview, error handling

---

## Phase 6: User Story 4 - Form Validation and Error Handling (Priority: P3)

**Goal**: System provides real-time feedback on field requirements and format expectations, helping residents complete form without frustration

**Independent Test**: Intentionally enter invalid data (empty required fields, invalid year formats, etc.) and verify appropriate error messages appear at the right time with clear indicators of which fields need correction.

**Dependencies**: Enhances validation across all existing form components

### Implementation for User Story 4

- [ ] T035 [US4] Add real-time field validation to VehicleSection inputs (onBlur validation, error message display below fields)
- [ ] T036 [US4] Add year validation refinement to Zod schema (check year not in future, min 1900, custom error messages)
- [ ] T037 [US4] Add plate number format validation to Zod schema (alphanumeric + hyphens, reasonable length)
- [ ] T038 [US4] Add error summary display to StickerRequestForm (show all validation errors on submit attempt)
- [ ] T039 [US4] Add field-level error indicators to form inputs (red border, error icon, aria-invalid)
- [ ] T040 [US4] Add form data preservation on validation errors (React Hook Form maintains state on submit failure)
- [ ] T041 [US4] Add client-side duplicate plate number check before submission (optional, check against household's existing requests via query)
- [ ] T042 [US4] Implement validation error toast for submission failures with actionable guidance
- [ ] T043 [US4] Test validation UX (all required fields trigger errors, year validation works, multiple errors displayed clearly)

**Checkpoint**: All user stories should now be independently functional with comprehensive validation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure production readiness

- [ ] T044 [P] Add skeleton loaders to sticker request page while quota data loads
- [ ] T045 [P] Add loading states to document upload fields during file processing
- [ ] T046 [P] Add ARIA labels and semantic HTML for accessibility (WCAG 2.1 AA compliance)
- [ ] T047 [P] Add keyboard navigation support (tab order, enter to submit, escape to cancel if needed)
- [ ] T048 [P] Add focus management when adding/removing vehicles (focus new vehicle section on add)
- [ ] T049 [P] Add data-testid attributes to key interactive elements (vehicle sections, file uploads, submit button, quota warning)
- [ ] T050 [P] Implement mobile-responsive design for form (test on mobile breakpoints, adjust layout for small screens)
- [ ] T051 [P] Add confirmation modal before leaving page with unsaved changes (optional, browser beforeunload)
- [ ] T052 Add performance optimization for multiple file uploads (parallel uploads via Promise.all)
- [ ] T053 [P] Add request tracking link in success toast (redirect to request detail page - future feature placeholder)
- [ ] T054 Code cleanup and refactoring (remove console.logs per constitution, ensure naming conventions)
- [ ] T055 [P] Update CLAUDE.md with sticker request feature completion notes
- [ ] T056 Run through quickstart.md validation checklist (15 items)
- [ ] T057 Manual accessibility testing (keyboard-only navigation, screen reader testing)
- [ ] T058 End-to-end testing across all user stories (complete user journeys)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
  - Database migrations and type definitions
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
  - Core services, schemas, and hooks required by all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Independent - no dependencies on other stories
  - User Story 2 (P2): Extends User Story 1 components - requires T013, T014 complete
  - User Story 3 (P2): Enhances User Story 1 components - requires T011 complete
  - User Story 4 (P3): Enhances all user stories - requires all previous forms complete
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - MVP foundation
- **User Story 2 (P2)**: Depends on User Story 1 components (StickerRequestForm, VehicleSection)
- **User Story 3 (P2)**: Depends on User Story 1 components (DocumentUploadField)
- **User Story 4 (P3)**: Enhances all forms - can start after any user story's forms exist

**Note**: US2 and US3 are both P2 but can be worked in parallel by different developers if desired, as they enhance different aspects (US2 = array management, US3 = file upload UX)

### Within Each User Story

- **User Story 1**: T010-T012 can run in parallel (different components), then T013 (uses T012), then T014 (uses T013)
- **User Story 2**: Sequential enhancements to existing form component
- **User Story 3**: Sequential enhancements to existing upload component
- **User Story 4**: Can enhance validation across components in parallel

### Parallel Opportunities

**Setup Phase (Phase 1)**:

- T002, T003, T004, T005 can all run in parallel

**Foundational Phase (Phase 2)**:

- T007, T008 can run in parallel
- T009 depends on T008 (uses the quota hook)

**User Story 1**:

- T010, T011, T012 can run in parallel (different component files)

**Polish Phase (Phase 7)**:

- T044, T045, T046, T047, T048, T049, T050, T051 can all run in parallel (different concerns)

---

## Parallel Example: User Story 1

```bash
# Launch all independent components for User Story 1 together:
Task T010: "Create QuotaWarning component in components/features/stickers/QuotaWarning.tsx"
Task T011: "Create DocumentUploadField component in components/features/stickers/DocumentUploadField.tsx"
Task T012: "Create VehicleSection component in components/features/stickers/VehicleSection.tsx"

# These can be developed simultaneously by different developers or by AI agents
# Then T013 (StickerRequestForm) integrates them all together
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005) - Database and types ready
2. Complete Phase 2: Foundational (T006-T009) - Core services ready
3. Complete Phase 3: User Story 1 (T010-T017) - Single vehicle request works
4. **STOP and VALIDATE**: Test User Story 1 independently per acceptance scenarios
5. Deploy/demo MVP - residents can now submit single vehicle sticker requests

**Estimated MVP Tasks**: 17 tasks (T001-T017)

### Incremental Delivery

1. **Foundation** (T001-T009): Setup + Foundational → Core infrastructure ready
2. **MVP** (T010-T017): Add User Story 1 → Test independently → Deploy/Demo
   - Value: Residents can submit single vehicle requests with documents
3. **Enhancement 1** (T018-T025): Add User Story 2 → Test independently → Deploy/Demo
   - Value: Residents can batch multiple vehicle requests (time savings)
4. **Enhancement 2** (T026-T034): Add User Story 3 → Test independently → Deploy/Demo
   - Value: Better document upload UX (preview, validation, error recovery)
5. **Enhancement 3** (T035-T043): Add User Story 4 → Test independently → Deploy/Demo
   - Value: Improved form validation reduces submission errors
6. **Polish** (T044-T058): Production readiness → Full feature complete

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers or AI agents:

**Phase 1 + 2**: Team completes Setup + Foundational together (9 tasks)

**After Foundational Complete**:

- **Developer A**: User Story 1 core components (T010-T012) → Form integration (T013-T017)
- **Developer B**: Can start User Story 2 planning (waits for T013-T014 to complete)
- **Developer C**: Can start User Story 3 planning (waits for T011 to complete)

**Optimal Parallel Execution**:

1. All team: Complete Setup + Foundational (foundation for everything)
2. Dev A: User Story 1 (T010-T017) - creates baseline components
3. Once T013-T014 complete:
   - Dev B: User Story 2 (T018-T025) - extends form for arrays
   - Dev C: User Story 3 (T026-T034) - enhances document uploads
   - These can run in parallel as they modify different aspects
4. Dev A (freed up): User Story 4 (T035-T043) - adds validation across all
5. All team: Polish phase (T044-T058) in parallel

---

## Task Count Summary

- **Total Tasks**: 58 tasks
- **Setup (Phase 1)**: 5 tasks
- **Foundational (Phase 2)**: 4 tasks
- **User Story 1 - Single Vehicle Request (P1)**: 8 tasks
- **User Story 2 - Multiple Vehicles (P2)**: 8 tasks
- **User Story 3 - Document Upload UX (P2)**: 9 tasks
- **User Story 4 - Validation & Errors (P3)**: 9 tasks
- **Polish & Cross-Cutting**: 15 tasks

**Parallel Opportunities**: 19 tasks marked [P] can run in parallel within their phases

**MVP Scope** (Suggested): Phase 1 + Phase 2 + Phase 3 = 17 tasks

---

## Notes

- **[P] tasks** = Different files, no dependencies within phase, can run in parallel
- **[Story] label** = Maps task to specific user story for traceability and independent testing
- **Each user story** should be independently completable and testable per spec acceptance scenarios
- **Commit strategy**: Commit after each task or logical group of [P] tasks
- **Stop at any checkpoint** to validate story independently before proceeding
- **Constitution compliance**: All tasks follow naming conventions, type safety, accessibility requirements
- **No tests included**: Tests not explicitly requested in spec.md, focus on implementation
- **File paths**: All paths are exact locations in Next.js App Router structure
- **Avoid**: Vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Edge Cases Addressed in Tasks

Per spec.md edge cases:

- **Form abandonment**: T051 adds beforeunload confirmation (optional)
- **Duplicate plate numbers**: T041 adds client-side check, database has UNIQUE constraint
- **Network failures**: T033 handles upload failures with rollback
- **File validation**: T027-T028 validate size and type
- **Special characters**: Zod schemas (T006) handle unicode in make/model
- **Vehicle limits**: T024 enforces quota, T019 adds max vehicle validation
- **Future years**: T036 validates year constraints
- **Large files**: T032 implements image compression for >2MB photos

---

## Quickstart.md Integration

The quickstart.md testing checklist (15 items) is addressed by task T056. Key items mapped to implementation tasks:

- Database migration: T001, T002
- RLS policies: T001, T003
- File upload limits: T027, T028
- Quota validation: T024
- Form validation: T035-T043
- Multi-vehicle form: T018-T025
- Success toast: T023
- Redirect: T014
- Accessibility: T046-T048, T057
- Mobile responsive: T050

All quickstart requirements covered in task breakdown.
