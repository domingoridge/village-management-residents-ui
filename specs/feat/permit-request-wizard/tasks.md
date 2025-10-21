# Tasks: Permit Request Wizard

**Input**: Design documents from `/specs/feat/permit-request-wizard/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Not requested in specification - tests excluded from this task list

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure

- [x] T001 Create permits directory structure at app/(dashboard)/permits/ with new/, [id]/, and [id]/edit/ subdirectories
- [x] T002 Create components directory at components/features/permits/
- [x] T003 [P] Create types directory files: types/permit.ts, types/forms.ts, types/payment.ts
- [x] T004 [P] Create constants directory files: constants/permitTypes.ts, constants/fileFormats.ts, constants/feeStructures.ts
- [x] T005 [P] Create lib/hooks directory for custom hooks
- [x] T006 [P] Create lib/services directory for API services
- [x] T007 [P] Create lib/utils directory for utility functions
- [x] T008 [P] Create lib/schemas/permits/ directory for JSON Schema files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Define PermitType union type in constants/permitTypes.ts (e.g., 'construction' | 'renovation' | 'electrical' | 'plumbing')
- [x] T010 [P] Define file format constants in constants/fileFormats.ts (MAX_FILE_SIZE=10MB, ALLOWED_FORMATS by document type)
- [x] T011 [P] Define PermitApplication type in types/permit.ts with all required fields
- [x] T012 [P] Define FormSchema and FieldDefinition types in types/forms.ts for JSON Schema structure
- [x] T013 [P] Define PaymentMethod and PaymentStatus types in types/payment.ts
- [x] T014 [P] Create shared FileUpload component in components/ui/FileUpload.tsx with drag-and-drop support
- [x] T015 [P] Implement useWizardStep hook in lib/hooks/useWizardStep.ts for step navigation state management
- [x] T016 [P] Implement file validation utilities in lib/utils/fileValidation.ts (validateFileSize, validateFileFormat)
- [x] T017 [P] Implement JSON Schema validator utilities in lib/utils/schemaValidator.ts for Draft 2020-12 compliance
- [x] T018 [P] Create WizardProgressIndicator component in components/features/permits/WizardProgressIndicator.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Submit Basic Permit Information (Priority: P1) 🎯 MVP

**Goal**: Enable residents to fill out Step 1 (Project Details) with dynamic form fields based on selected permit type, including contractor information

**Independent Test**: Navigate to /permits/new, select a permit type, fill all required fields with valid data, verify dynamic fields appear/disappear based on permit type, attempt to proceed with invalid data and verify validation errors display, verify "Next" button proceeds to Step 2

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create construction.json schema in lib/schemas/permits/construction.json with project details fields
- [ ] T020 [P] [US1] Create renovation.json schema in lib/schemas/permits/renovation.json with renovation-specific fields
- [ ] T021 [P] [US1] Create electrical.json schema in lib/schemas/permits/electrical.json with electrical-specific fields
- [ ] T022 [P] [US1] Create plumbing.json schema in lib/schemas/permits/plumbing.json with plumbing-specific fields
- [ ] T023 [US1] Implement useDynamicSchema hook in lib/hooks/useDynamicSchema.ts to load JSON Schema based on permit type
- [ ] T024 [US1] Implement usePermitForm hook in lib/hooks/usePermitForm.ts with react-hook-form and Zod validation
- [ ] T025 [P] [US1] Create DynamicFormRenderer component in components/features/permits/DynamicFormRenderer.tsx accepting JSON Schema and rendering Input/Select components
- [ ] T026 [P] [US1] Create PermitTypeSelector component in components/features/permits/PermitTypeSelector.tsx with dropdown
- [ ] T027 [US1] Create StepProjectDetails component in components/features/permits/StepProjectDetails.tsx integrating PermitTypeSelector and DynamicFormRenderer
- [ ] T028 [US1] Implement permitService.ts in lib/services/permitService.ts with createPermit and updatePermit API calls
- [ ] T029 [US1] Create PermitWizard main orchestrator component in components/features/permits/PermitWizard.tsx managing wizard state and step rendering
- [ ] T030 [US1] Create /permits/new page at app/(dashboard)/permits/new/page.tsx rendering PermitWizard component
- [ ] T031 [US1] Add form validation for email format, date ranges, and required fields in StepProjectDetails
- [ ] T032 [US1] Add data-testid attributes to permit type dropdown, form fields, and Next button
- [ ] T033 [US1] Implement character counter for project description textarea (500 char limit)
- [ ] T034 [US1] Add skeleton loaders for permit type loading state

**Checkpoint**: At this point, User Story 1 should be fully functional - residents can select permit type, see dynamic fields, fill out project details, and navigate to Step 2

---

## Phase 4: User Story 2 - Upload Required Documents (Priority: P2)

**Goal**: Enable residents to upload building plans, contracts, and site photos with file validation and visual feedback

**Independent Test**: Navigate to Step 2 (Document Upload), drag-and-drop or click to upload files for each document category, verify files under 10MB in correct formats are accepted, verify oversized/wrong format files show error messages, verify uploaded files display with name/size/status, verify remove and re-upload functionality works

### Implementation for User Story 2

- [ ] T035 [P] [US2] Implement useFileUpload hook in lib/hooks/useFileUpload.ts with Supabase Storage upload logic and progress tracking
- [ ] T036 [P] [US2] Implement fileService.ts in lib/services/fileService.ts with uploadDocument and deleteDocument methods
- [ ] T037 [P] [US2] Create DocumentUploadZone component in components/features/permits/DocumentUploadZone.tsx supporting multiple file types and visual list
- [ ] T038 [US2] Create StepDocuments component in components/features/permits/StepDocuments.tsx with three document sections (plans, contracts, photos)
- [ ] T039 [US2] Integrate StepDocuments into PermitWizard component with conditional rendering based on current step
- [ ] T040 [US2] Implement file format validation in DocumentUploadZone (JPG/PNG/DWG for plans, PDF for contracts, JPG/PNG for photos)
- [ ] T041 [US2] Implement 10MB file size validation with clear error messages
- [ ] T042 [US2] Add upload progress indicators for each file
- [ ] T043 [US2] Implement remove and re-upload functionality for uploaded files
- [ ] T044 [US2] Add visual feedback for upload success (green) and error (red) states
- [ ] T045 [US2] Update JSON schemas to include required_documents array based on permit type
- [ ] T046 [US2] Implement dynamic required/optional document logic based on permit type in StepDocuments
- [ ] T047 [US2] Add data-testid attributes to upload zones, file lists, and remove buttons

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - residents can complete project details AND upload documents

---

## Phase 5: User Story 3 - Review Fees and Complete Payment (Priority: P3)

**Goal**: Enable residents to review calculated permit fees, see itemized breakdown, select payment method (Pay Now/Pay Later), and complete application submission

**Independent Test**: Navigate to Step 3 (Payment), verify fee breakdown displays with Base Fee, Processing Fee, Road Use Fee and total in Philippine Peso format, select "Pay Later" and verify application submits without payment, select "Pay Now" and choose payment method to verify redirect flow simulation, verify confirmation page displays after submission

### Implementation for User Story 3

- [ ] T048 [P] [US3] Define base fee structures in constants/feeStructures.ts with fees per permit type
- [ ] T049 [P] [US3] Implement fee calculation utilities in lib/utils/feeCalculator.ts (calculateBaseFee, calculateProcessingFee, calculateRoadUseFee)
- [ ] T050 [P] [US3] Implement useFeeCalculation hook in lib/hooks/useFeeCalculation.ts with real-time fee updates based on form data
- [ ] T051 [P] [US3] Implement feeService.ts in lib/services/feeService.ts with getFees API endpoint
- [ ] T052 [P] [US3] Create FeeBreakdownCard component in components/features/permits/FeeBreakdownCard.tsx displaying itemized fees
- [ ] T053 [P] [US3] Create PaymentMethodSelector component in components/features/permits/PaymentMethodSelector.tsx with GCash, PayMaya, Credit Card options
- [ ] T054 [US3] Create StepPayment component in components/features/permits/StepPayment.tsx integrating FeeBreakdownCard and PaymentMethodSelector
- [ ] T055 [US3] Integrate StepPayment into PermitWizard component
- [ ] T056 [US3] Implement "Pay Later" submission flow in permitService.ts marking application as pending payment
- [ ] T057 [US3] Implement "Pay Now" redirect flow (placeholder/mock for payment gateway integration)
- [ ] T058 [US3] Create ConfirmationPage component in components/features/permits/ConfirmationPage.tsx showing submitted application details
- [ ] T059 [US3] Implement application submission with submitPermit API call in permitService.ts
- [ ] T060 [US3] Add Philippine Peso (₱) currency formatting throughout fee displays
- [ ] T061 [US3] Implement fee calculation updates when form data changes (< 1 second per SC-007)
- [ ] T062 [US3] Add skeleton loaders for fee calculation loading state
- [ ] T063 [US3] Add toast notification for successful submission
- [ ] T064 [US3] Add data-testid attributes to payment options, submit button, and confirmation page elements

**Checkpoint**: All core user stories (1, 2, 3) should now be independently functional - complete permit application flow from start to submission works end-to-end

---

## Phase 6: User Story 4 - Save Progress as Draft (Priority: P3)

**Goal**: Enable residents to save incomplete applications at any step and resume later with all data preserved

**Independent Test**: Start filling permit application at any step, click "Save as Draft" button, verify toast confirmation appears, leave and return to /permits page, verify draft appears in list, click to resume draft, verify all previously entered data is populated correctly

### Implementation for User Story 4

- [ ] T065 [P] [US4] Add saveDraft API endpoint to permitService.ts for saving incomplete applications
- [ ] T066 [P] [US4] Add getDraft API endpoint to permitService.ts for retrieving draft by ID
- [ ] T067 [US4] Add "Save as Draft" button to PermitWizard navigation on all steps
- [ ] T068 [US4] Implement draft save handler in PermitWizard with toast notification
- [ ] T069 [US4] Create /permits list page at app/(dashboard)/permits/page.tsx displaying drafts and submitted applications
- [ ] T070 [US4] Create /permits/[id]/edit page at app/(dashboard)/permits/[id]/edit/page.tsx for resuming drafts
- [ ] T071 [US4] Implement draft data restoration logic in PermitWizard when resuming
- [ ] T072 [US4] Add visual distinction between draft and submitted applications in list view
- [ ] T073 [US4] Implement draft status indicator in PermitWizard header
- [ ] T074 [US4] Add data-testid attributes to Save as Draft button and draft list items

**Checkpoint**: All user stories should now be independently functional - residents can complete applications, save drafts, and resume later

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality checks

- [ ] T075 [P] Add mobile-responsive styles for all wizard steps (320px minimum width)
- [ ] T076 [P] Verify WCAG 2.1 AA compliance for all form fields, buttons, and navigation
- [ ] T077 [P] Add aria-labels and aria-describedby attributes for screen reader support
- [ ] T078 [P] Implement wizard step transition animations (< 200ms per performance goal)
- [ ] T079 [P] Add form field rendering performance optimization (< 100ms after permit type selection)
- [ ] T080 [P] Add error boundary component for graceful error handling
- [ ] T081 [P] Implement toast notification positioning (top-right per constitution)
- [ ] T082 Create /permits/[id] view page at app/(dashboard)/permits/[id]/page.tsx for viewing submitted applications
- [ ] T083 [P] Add documentation comments to all custom hooks
- [ ] T084 [P] Add JSDoc comments to utility functions
- [ ] T085 [P] Verify all components follow PascalCase naming convention
- [ ] T086 [P] Verify all hooks follow camelCase with "use" prefix
- [ ] T087 [P] Run ESLint and fix any warnings
- [ ] T088 [P] Run Prettier to ensure consistent formatting
- [ ] T089 Final manual testing of complete wizard flow end-to-end
- [ ] T090 Verify all data-testid attributes are in place for test automation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P3)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1/US2 but should be independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Enhances all stories but independently testable

### Within Each User Story

- JSON Schema files before hooks that load them
- Hooks before components that use them
- Services before components that call APIs
- Individual components before integrating into wizard
- Core implementation before polish and edge cases

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003, T004, T005, T006, T007, T008)
- All Foundational tasks marked [P] can run in parallel within Phase 2
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- JSON schema files within a story marked [P] can run in parallel (T019-T022 for US1)
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all JSON schema files for User Story 1 together:
Task: "Create construction.json schema in lib/schemas/permits/construction.json"
Task: "Create renovation.json schema in lib/schemas/permits/renovation.json"
Task: "Create electrical.json schema in lib/schemas/permits/electrical.json"
Task: "Create plumbing.json schema in lib/schemas/permits/plumbing.json"

# After schemas done, launch parallel components:
Task: "Create DynamicFormRenderer component in components/features/permits/DynamicFormRenderer.tsx"
Task: "Create PermitTypeSelector component in components/features/permits/PermitTypeSelector.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T018) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T019-T034)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - residents can now fill out basic permit information

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! - Basic permit info capture)
3. Add User Story 2 → Test independently → Deploy/Demo (Document uploads added)
4. Add User Story 3 → Test independently → Deploy/Demo (Payment and submission added)
5. Add User Story 4 → Test independently → Deploy/Demo (Draft save/resume added)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Basic permit info)
   - Developer B: User Story 2 (Document uploads)
   - Developer C: User Story 3 (Payment)
   - Developer D: User Story 4 (Draft functionality)
3. Stories complete and integrate independently

---

## Summary Statistics

**Total Tasks**: 90

- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 10 tasks (BLOCKING)
- Phase 3 (US1 - Basic Permit Info): 16 tasks 🎯 MVP
- Phase 4 (US2 - Document Uploads): 13 tasks
- Phase 5 (US3 - Payment): 17 tasks
- Phase 6 (US4 - Draft Save): 10 tasks
- Phase 7 (Polish): 16 tasks

**Parallel Opportunities**: 50+ tasks marked [P] can run in parallel

**Independent Test Criteria**:

- US1: Can fill and validate Step 1 form with dynamic fields
- US2: Can upload documents with validation
- US3: Can review fees and submit application
- US4: Can save and resume drafts

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 34 tasks

---

## Notes

- [P] tasks = different files, no dependencies on incomplete work
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are absolute from repository root
- Follow constitution naming conventions: PascalCase for components, camelCase for hooks/utils
- Add data-testid attributes during implementation, not as separate tasks
- Skeleton loaders and toast notifications per constitution requirements
