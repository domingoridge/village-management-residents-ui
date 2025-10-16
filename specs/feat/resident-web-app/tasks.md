# Tasks: Village Management Resident Web Application

**Input**: Design documents from `/specs/feat/resident-web-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification. This task list focuses on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story in priority order (P1 → P5).

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US9)
- Exact file paths included in descriptions

## Path Conventions

- **App Routes**: `app/` (Next.js 15 App Router)
- **Components**: `components/` (ui/, forms/, features/, layout/)
- **Libraries**: `lib/` (supabase/, schemas/, hooks/, utils/, api/)
- **Types**: `types/` (TypeScript type definitions)
- **Constants**: `constants/` (application constants)
- **Stores**: `store/` (Zustand state management)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure based on Next.js 15 + Supabase architecture

- [ ] T001 Initialize Next.js 15 project with TypeScript 5.7+ in repository root
- [ ] T002 [P] Install dependencies: next@15+, react@19+, typescript@5.7+, @supabase/ssr, @supabase/supabase-js
- [ ] T003 [P] Install form dependencies: react-hook-form@7+, zod@4+, @hookform/resolvers
- [ ] T004 [P] Install UI dependencies: tailwindcss@4+, daisyui@5+, @tailwindcss/postcss, lucide-react, clsx
- [ ] T005 [P] Install state/table dependencies: zustand@5+, @tanstack/react-table@8+
- [ ] T006 [P] Install testing dependencies: vitest, @testing-library/react, @testing-library/jest-dom
- [ ] T007 Configure tsconfig.json with strict mode and path aliases (@/\*)
- [ ] T008 [P] Configure eslint.config.mjs with Next.js and TypeScript rules
- [ ] T009 [P] Configure vitest.config.ts for Next.js testing
- [ ] T010 [P] Setup Husky pre-commit hooks in .husky/ directory
- [ ] T011 Create project structure: app/, components/, lib/, types/, constants/, store/, public/
- [ ] T012 [P] Configure Tailwind CSS v4 in app/globals.css with DaisyUI v5 plugin
- [ ] T013 [P] Create next.config.mjs with image domains and environment configuration
- [ ] T014 [P] Create environment file templates: .env.local.example with Supabase keys
- [ ] T015 [P] Create PWA manifest.json in public/ with village app metadata

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Setup

- [ ] T016 Create Supabase migration for guest table in supabase/migrations/
- [ ] T017 [P] Create Supabase migration for announcement table in supabase/migrations/
- [ ] T018 [P] Create Supabase migration for announcement_read table in supabase/migrations/
- [ ] T019 [P] Create Supabase migration for payment table in supabase/migrations/
- [ ] T020 [P] Create Supabase migration for incident table in supabase/migrations/
- [ ] T021 [P] Create Supabase migration for message table in supabase/migrations/
- [ ] T022 [P] Create Supabase migration for notification table in supabase/migrations/
- [ ] T023 Apply all migrations to Supabase project
- [ ] T024 Generate updated TypeScript types in docs/supabase/database.types.ts from schema

### Authentication & Core Infrastructure

- [ ] T025 Create Supabase browser client in lib/supabase/client.ts
- [ ] T026 [P] Create Supabase server client in lib/supabase/server.ts
- [ ] T027 [P] Create Supabase auth middleware in lib/supabase/middleware.ts
- [ ] T028 Create auth store in store/authStore.ts with Zustand for user session management
- [ ] T029 [P] Create notification store in store/notificationStore.ts for realtime notifications
- [ ] T030 [P] Create UI store in store/uiStore.ts for sidebar/modal state
- [ ] T031 Create useAuth hook in lib/hooks/useAuth.ts for authentication operations
- [ ] T032 [P] Create useRealtime hook in lib/hooks/useRealtime.ts for Supabase subscriptions
- [ ] T033 [P] Create useNotifications hook in lib/hooks/useNotifications.ts for notification management

### Base TypeScript Types

- [ ] T034 [P] Create guest types in types/guest.ts with camelCase DTOs
- [ ] T035 [P] Create sticker types in types/sticker.ts
- [ ] T036 [P] Create household types in types/household.ts
- [ ] T037 [P] Create payment types in types/payment.ts
- [ ] T038 [P] Create permit types in types/permit.ts
- [ ] T039 [P] Create incident types in types/incident.ts
- [ ] T040 [P] Create announcement types in types/announcement.ts
- [ ] T041 [P] Create rule types in types/rule.ts
- [ ] T042 [P] Create message types in types/message.ts
- [ ] T043 [P] Create notification types in types/notification.ts
- [ ] T044 Create barrel export in types/index.ts for all entity types

### Utility Functions & Constants

- [ ] T045 [P] Create date formatter utilities in lib/utils/formatters.ts
- [ ] T046 [P] Create currency formatter for PHP in lib/utils/formatters.ts
- [ ] T047 [P] Create validation helpers in lib/utils/validators.ts
- [ ] T048 [P] Create route constants in constants/routes.ts
- [ ] T049 [P] Create API endpoint constants in constants/api.ts
- [ ] T050 [P] Create guest constants (statuses, etc.) in constants/guestConstants.ts
- [ ] T051 [P] Create sticker constants in constants/stickerConstants.ts
- [ ] T052 [P] Create payment constants in constants/paymentConstants.ts

### Base UI Components

- [ ] T053 [P] Create Button component in components/ui/Button.tsx with DaisyUI classes
- [ ] T054 [P] Create Input component in components/ui/Input.tsx
- [ ] T055 [P] Create Card component in components/ui/Card.tsx
- [ ] T056 [P] Create Modal component in components/ui/Modal.tsx
- [ ] T057 [P] Create Toast component in components/ui/Toast.tsx (top-right positioning)
- [ ] T058 [P] Create Skeleton loader component in components/ui/Skeleton.tsx
- [ ] T059 [P] Create Pagination component in components/ui/Pagination.tsx

### Layout Components

- [ ] T060 Create root layout in app/layout.tsx with providers and global CSS
- [ ] T061 Create providers wrapper in app/providers.tsx for Zustand stores
- [ ] T062 [P] Create Header component in components/layout/Header.tsx with user menu
- [ ] T063 [P] Create Sidebar component in components/layout/Sidebar.tsx for desktop navigation
- [ ] T064 [P] Create MobileNav component in components/layout/MobileNav.tsx for mobile navigation
- [ ] T065 Create dashboard layout in app/(dashboard)/layout.tsx with Header/Sidebar/MobileNav

### Authentication Routes

- [ ] T066 Create login page in app/(auth)/login/page.tsx
- [ ] T067 [P] Create register page in app/(auth)/register/page.tsx
- [ ] T068 [P] Create reset password page in app/(auth)/reset-password/page.tsx
- [ ] T069 Create auth layout in app/(auth)/layout.tsx for auth pages
- [ ] T070 Create dashboard home page in app/(dashboard)/page.tsx with overview

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Guest Pre-Authorization (Priority: P1) 🎯 MVP

**Goal**: Enable residents to pre-register guests and approve walk-in requests for smooth gate entry

**Independent Test**: Create a guest pre-registration, verify it appears in upcoming guests list, simulate guard notification, confirm guest status updates

### Zod Schemas

- [ ] T071 [US1] Create guest validation schema in lib/schemas/guest.ts with name/date/vehicle validation

### API Functions

- [ ] T072 [US1] Create getHouseholdGuests function in lib/api/guests.ts for fetching guest list
- [ ] T073 [P] [US1] Create createGuest function in lib/api/guests.ts for pre-authorization
- [ ] T074 [P] [US1] Create updateGuest function in lib/api/guests.ts for editing
- [ ] T075 [P] [US1] Create cancelGuest function in lib/api/guests.ts for cancellation
- [ ] T076 [P] [US1] Create bulkCreateGuests function in lib/api/guests.ts for event guests

### Custom Hooks

- [ ] T077 [US1] Create useGuests hook in lib/hooks/useGuests.ts for guest data management

### Components

- [ ] T078 [P] [US1] Create GuestForm component in components/forms/GuestForm.tsx with React Hook Form + Zod
- [ ] T079 [P] [US1] Create GuestList component in components/features/guests/GuestList.tsx with TanStack Table
- [ ] T080 [P] [US1] Create GuestStatusBadge component in components/features/guests/GuestStatusBadge.tsx
- [ ] T081 [US1] Create GuestNotificationHandler component in components/features/guests/GuestNotificationHandler.tsx for realtime updates

### Routes

- [ ] T082 [US1] Create guests list page in app/(dashboard)/guests/page.tsx
- [ ] T083 [P] [US1] Create new guest page in app/(dashboard)/guests/new/page.tsx
- [ ] T084 [P] [US1] Create edit guest page in app/(dashboard)/guests/[id]/edit/page.tsx
- [ ] T085 [P] [US1] Create guest details page in app/(dashboard)/guests/[id]/page.tsx

### Integration

- [ ] T086 [US1] Integrate realtime guest notifications using useRealtime hook
- [ ] T087 [US1] Add guest approval/denial actions to notification component
- [ ] T088 [US1] Implement auto-deny after 5-minute timeout for walk-in requests

**Checkpoint**: User Story 1 (Guest Pre-Authorization) is fully functional and testable independently

---

## Phase 4: User Story 2 - Vehicle Sticker Management (Priority: P2)

**Goal**: Enable residents to request vehicle stickers, track approval status, and manage renewals

**Independent Test**: Submit sticker request with vehicle details and documents, track application status, view household stickers with expiration dates, request renewal

### Zod Schemas

- [ ] T089 [US2] Create sticker validation schema in lib/schemas/sticker.ts with vehicle/document validation

### API Functions

- [ ] T090 [US2] Create getHouseholdStickers function in lib/api/stickers.ts for fetching sticker list
- [ ] T091 [P] [US2] Create createStickerRequest function in lib/api/stickers.ts
- [ ] T092 [P] [US2] Create updateStickerRequest function in lib/api/stickers.ts
- [ ] T093 [P] [US2] Create cancelStickerRequest function in lib/api/stickers.ts
- [ ] T094 [P] [US2] Create requestStickerRenewal function in lib/api/stickers.ts
- [ ] T095 [P] [US2] Create uploadVehicleDocument function in lib/api/stickers.ts for OR/CR uploads

### Custom Hooks

- [ ] T096 [US2] Create useStickers hook in lib/hooks/useStickers.ts for sticker data management
- [ ] T097 [P] [US2] Create useFileUpload hook in lib/hooks/useFileUpload.ts for document uploads with compression

### Components

- [ ] T098 [P] [US2] Create StickerForm component in components/forms/StickerForm.tsx with file upload
- [ ] T099 [P] [US2] Create StickerList component in components/features/stickers/StickerList.tsx
- [ ] T100 [P] [US2] Create StickerStatusBadge component in components/features/stickers/StickerStatusBadge.tsx
- [ ] T101 [P] [US2] Create StickerExpiryWarning component in components/features/stickers/StickerExpiryWarning.tsx
- [ ] T102 [P] [US2] Create FileUploader component in components/ui/FileUploader.tsx with drag-and-drop

### Routes

- [ ] T103 [US2] Create stickers list page in app/(dashboard)/stickers/page.tsx
- [ ] T104 [P] [US2] Create new sticker request page in app/(dashboard)/stickers/new/page.tsx
- [ ] T105 [P] [US2] Create edit sticker page in app/(dashboard)/stickers/[id]/edit/page.tsx
- [ ] T106 [P] [US2] Create sticker details page in app/(dashboard)/stickers/[id]/page.tsx

### Integration

- [ ] T107 [US2] Add sticker expiry notifications (30 days, 7 days before expiration)
- [ ] T108 [US2] Implement client-side image compression before upload
- [ ] T109 [US2] Add sticker quota validation against household limit

**Checkpoint**: User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Household Profile and Access History (Priority: P2)

**Goal**: Provide residents visibility into household information, member list, and entry/exit activity

**Independent Test**: View household profile with member list and sticker quota, filter access history by date range and vehicle, verify all household entries/exits are logged

### API Functions

- [ ] T110 [US3] Create getCurrentHousehold function in lib/api/households.ts
- [ ] T111 [P] [US3] Create updateHousehold function in lib/api/households.ts for contact info updates
- [ ] T112 [P] [US3] Create getHouseholdResidents function in lib/api/households.ts
- [ ] T113 [P] [US3] Create getAccessHistory function in lib/api/households.ts with date/vehicle filters

### Custom Hooks

- [ ] T114 [US3] Create useHousehold hook in lib/hooks/useHousehold.ts
- [ ] T115 [P] [US3] Create useAccessHistory hook in lib/hooks/useAccessHistory.ts

### Components

- [ ] T116 [P] [US3] Create HouseholdProfile component in components/features/profile/HouseholdProfile.tsx
- [ ] T117 [P] [US3] Create ResidentList component in components/features/profile/ResidentList.tsx
- [ ] T118 [P] [US3] Create AccessHistoryTable component in components/features/profile/AccessHistoryTable.tsx with TanStack Table
- [ ] T119 [P] [US3] Create AccessHistoryFilter component in components/features/profile/AccessHistoryFilter.tsx

### Routes

- [ ] T120 [US3] Create profile page in app/(dashboard)/profile/page.tsx
- [ ] T121 [P] [US3] Create access history page in app/(dashboard)/profile/access-history/page.tsx

### Integration

- [ ] T122 [US3] Add role-based data filtering (beneficial users see only their logs)
- [ ] T123 [US3] Implement pagination for large access history datasets
- [ ] T124 [US3] Add data caching for 30-day access log window

**Checkpoint**: User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Announcements and Village Updates (Priority: P3)

**Goal**: Keep residents informed about events, maintenance, emergencies, and rule changes

**Independent Test**: View announcement feed, filter by type, mark as read, receive notifications for urgent announcements, view attachments

### Zod Schemas

- [ ] T125 [US4] Create announcement validation schema in lib/schemas/announcement.ts

### API Functions

- [ ] T126 [US4] Create getAnnouncements function in lib/api/announcements.ts with type/priority filters
- [ ] T127 [P] [US4] Create getUnreadAnnouncements function in lib/api/announcements.ts
- [ ] T128 [P] [US4] Create markAnnouncementRead function in lib/api/announcements.ts
- [ ] T129 [P] [US4] Create getAnnouncementStats function in lib/api/announcements.ts

### Custom Hooks

- [ ] T130 [US4] Create useAnnouncements hook in lib/hooks/useAnnouncements.ts

### Components

- [ ] T131 [P] [US4] Create AnnouncementFeed component in components/features/announcements/AnnouncementFeed.tsx
- [ ] T132 [P] [US4] Create AnnouncementCard component in components/features/announcements/AnnouncementCard.tsx
- [ ] T133 [P] [US4] Create AnnouncementFilter component in components/features/announcements/AnnouncementFilter.tsx
- [ ] T134 [P] [US4] Create AnnouncementDetails component in components/features/announcements/AnnouncementDetails.tsx

### Routes

- [ ] T135 [US4] Create announcements list page in app/(dashboard)/announcements/page.tsx
- [ ] T136 [P] [US4] Create announcement details page in app/(dashboard)/announcements/[id]/page.tsx

### Integration

- [ ] T137 [US4] Add realtime notifications for urgent announcements
- [ ] T138 [US4] Implement web share API for announcement sharing
- [ ] T139 [US4] Add announcement caching for 60-day window

**Checkpoint**: User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Payments and Billing (Priority: P3)

**Goal**: Enable convenient online payment of association fees and other charges

**Independent Test**: View payment dashboard with outstanding balance, filter payment history, initiate online payment, download receipt

### Zod Schemas

- [ ] T140 [US5] Create payment validation schema in lib/schemas/payment.ts

### API Functions

- [ ] T141 [US5] Create getPayments function in lib/api/payments.ts with status/type filters
- [ ] T142 [P] [US5] Create getPaymentSummary function in lib/api/payments.ts for dashboard stats
- [ ] T143 [P] [US5] Create initiatePayment function in lib/api/payments.ts for PayMongo integration
- [ ] T144 [P] [US5] Create recordManualPayment function in lib/api/payments.ts
- [ ] T145 [P] [US5] Create downloadReceipt function in lib/api/payments.ts

### Custom Hooks

- [ ] T146 [US5] Create usePayments hook in lib/hooks/usePayments.ts
- [ ] T147 [P] [US5] Create usePaymentGateway hook in lib/hooks/usePaymentGateway.ts for PayMongo

### Components

- [ ] T148 [P] [US5] Create PaymentDashboard component in components/features/payments/PaymentDashboard.tsx
- [ ] T149 [P] [US5] Create PaymentHistory component in components/features/payments/PaymentHistory.tsx
- [ ] T150 [P] [US5] Create PaymentMethodSelector component in components/features/payments/PaymentMethodSelector.tsx
- [ ] T151 [P] [US5] Create PaymentBreakdown component in components/features/payments/PaymentBreakdown.tsx

### Routes

- [ ] T152 [US5] Create payments dashboard page in app/(dashboard)/payments/page.tsx
- [ ] T153 [P] [US5] Create payment details page in app/(dashboard)/payments/[id]/page.tsx

### Integration

- [ ] T154 [US5] Integrate PayMongo for GCash/PayMaya/Card payments
- [ ] T155 [US5] Add payment reminder notifications (7 days before, due date, overdue)
- [ ] T156 [US5] Implement receipt PDF generation
- [ ] T157 [US5] Add payment proof upload for manual payments (bank transfer/cash)

**Checkpoint**: User Stories 1-5 should all work independently

---

## Phase 8: User Story 6 - Construction Permit Application (Priority: P4)

**Goal**: Streamline construction permit applications with document uploads and fee payments

**Independent Test**: Submit permit application with project details and documents, track approval status, view road fees, pay fees online

### Zod Schemas

- [ ] T158 [US6] Create permit validation schema in lib/schemas/permit.ts with contractor/date validation

### API Functions

- [ ] T159 [US6] Create getPermits function in lib/api/permits.ts with status/type filters
- [ ] T160 [P] [US6] Create createPermit function in lib/api/permits.ts
- [ ] T161 [P] [US6] Create updatePermit function in lib/api/permits.ts
- [ ] T162 [P] [US6] Create submitPermit function in lib/api/permits.ts for status change
- [ ] T163 [P] [US6] Create getPermitPayment function in lib/api/permits.ts
- [ ] T164 [P] [US6] Create createPermitPayment function in lib/api/permits.ts

### Custom Hooks

- [ ] T165 [US6] Create usePermits hook in lib/hooks/usePermits.ts

### Components

- [ ] T166 [P] [US6] Create PermitForm component in components/forms/PermitForm.tsx
- [ ] T167 [P] [US6] Create PermitList component in components/features/permits/PermitList.tsx
- [ ] T168 [P] [US6] Create PermitTimeline component in components/features/permits/PermitTimeline.tsx
- [ ] T169 [P] [US6] Create PermitPaymentCard component in components/features/permits/PermitPaymentCard.tsx

### Routes

- [ ] T170 [US6] Create permits list page in app/(dashboard)/permits/page.tsx
- [ ] T171 [P] [US6] Create new permit page in app/(dashboard)/permits/new/page.tsx
- [ ] T172 [P] [US6] Create edit permit page in app/(dashboard)/permits/[id]/edit/page.tsx
- [ ] T173 [P] [US6] Create permit details page in app/(dashboard)/permits/[id]/page.tsx

### Integration

- [ ] T174 [US6] Add permit approval/rejection notifications
- [ ] T175 [US6] Add permit expiration reminder notifications
- [ ] T176 [US6] Integrate road fee payment with payment gateway

**Checkpoint**: User Stories 1-6 should all work independently

---

## Phase 9: User Story 7 - Incident Reporting (Priority: P4)

**Goal**: Enable quick reporting of security incidents and safety concerns with photo evidence

**Independent Test**: Submit incident report with type/description/location/photos, track status, receive status update notifications, view resolution notes

### Zod Schemas

- [ ] T177 [US7] Create incident validation schema in lib/schemas/incident.ts

### API Functions

- [ ] T178 [US7] Create getIncidents function in lib/api/incidents.ts with filters
- [ ] T179 [P] [US7] Create createIncident function in lib/api/incidents.ts
- [ ] T180 [P] [US7] Create updateIncident function in lib/api/incidents.ts
- [ ] T181 [P] [US7] Create cancelIncident function in lib/api/incidents.ts
- [ ] T182 [P] [US7] Create getIncidentStatistics function in lib/api/incidents.ts

### Custom Hooks

- [ ] T183 [US7] Create useIncidents hook in lib/hooks/useIncidents.ts
- [ ] T184 [P] [US7] Create useGeolocation hook in lib/hooks/useGeolocation.ts for incident location

### Components

- [ ] T185 [P] [US7] Create IncidentForm component in components/forms/IncidentForm.tsx with photo upload
- [ ] T186 [P] [US7] Create IncidentList component in components/features/incidents/IncidentList.tsx
- [ ] T187 [P] [US7] Create IncidentStatusBadge component in components/features/incidents/IncidentStatusBadge.tsx
- [ ] T188 [P] [US7] Create IncidentDetails component in components/features/incidents/IncidentDetails.tsx

### Routes

- [ ] T189 [US7] Create incidents list page in app/(dashboard)/incidents/page.tsx
- [ ] T190 [P] [US7] Create new incident page in app/(dashboard)/incidents/new/page.tsx
- [ ] T191 [P] [US7] Create incident details page in app/(dashboard)/incidents/[id]/page.tsx

### Integration

- [ ] T192 [US7] Add incident status change notifications (acknowledged, in progress, resolved)
- [ ] T193 [US7] Implement anonymous incident submission option
- [ ] T194 [US7] Add geolocation capture for incident location

**Checkpoint**: User Stories 1-7 should all work independently

---

## Phase 10: User Story 8 - Village Rules and Regulations (Priority: P5)

**Goal**: Provide easy access to village rules with search and category filters

**Independent Test**: View categorized rules list, search by keyword, filter by category, view rule details with penalties, receive notifications for rule updates

### API Functions

- [ ] T195 [US8] Create getAllRules function in lib/api/rules.ts
- [ ] T196 [P] [US8] Create searchRules function in lib/api/rules.ts

### Custom Hooks

- [ ] T197 [US8] Create useRules hook in lib/hooks/useRules.ts

### Components

- [ ] T198 [P] [US8] Create RulesList component in components/features/rules/RulesList.tsx
- [ ] T199 [P] [US8] Create RulesSearch component in components/features/rules/RulesSearch.tsx
- [ ] T200 [P] [US8] Create RuleCategoryFilter component in components/features/rules/RuleCategoryFilter.tsx
- [ ] T201 [P] [US8] Create RuleDetails component in components/features/rules/RuleDetails.tsx

### Routes

- [ ] T202 [US8] Create rules list page in app/(dashboard)/rules/page.tsx
- [ ] T203 [P] [US8] Create rule details page in app/(dashboard)/rules/[category]/page.tsx

### Integration

- [ ] T204 [US8] Add notifications for new/updated rules
- [ ] T205 [US8] Add "New" and "Updated" badges for recently changed rules

**Checkpoint**: User Stories 1-8 should all work independently

---

## Phase 11: User Story 9 - Communication with Administration (Priority: P5)

**Goal**: Enable direct messaging with village administration with attachment support

**Independent Test**: Send message to admin with category and attachments, view conversation history, receive admin replies, get notifications for responses

### Zod Schemas

- [ ] T206 [US9] Create message validation schema in lib/schemas/message.ts

### API Functions

- [ ] T207 [US9] Create getMessages function in lib/api/messages.ts
- [ ] T208 [P] [US9] Create sendMessage function in lib/api/messages.ts
- [ ] T209 [P] [US9] Create markMessageRead function in lib/api/messages.ts
- [ ] T210 [P] [US9] Create getMessageThreads function in lib/api/messages.ts
- [ ] T211 [P] [US9] Create getThreadMessages function in lib/api/messages.ts

### Custom Hooks

- [ ] T212 [US9] Create useMessages hook in lib/hooks/useMessages.ts

### Components

- [ ] T213 [P] [US9] Create MessageComposer component in components/features/messages/MessageComposer.tsx
- [ ] T214 [P] [US9] Create MessageThreadList component in components/features/messages/MessageThreadList.tsx
- [ ] T215 [P] [US9] Create MessageThread component in components/features/messages/MessageThread.tsx
- [ ] T216 [P] [US9] Create MessageBubble component in components/features/messages/MessageBubble.tsx

### Routes

- [ ] T217 [US9] Create messages list page in app/(dashboard)/messages/page.tsx
- [ ] T218 [P] [US9] Create message thread page in app/(dashboard)/messages/[threadId]/page.tsx
- [ ] T219 [P] [US9] Create new message page in app/(dashboard)/messages/new/page.tsx

### Integration

- [ ] T220 [US9] Add realtime notifications for admin replies
- [ ] T221 [US9] Implement unread message badge in navigation
- [ ] T222 [US9] Add file attachment support for messages

**Checkpoint**: All user stories (1-9) should now be independently functional

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

### PWA & Offline Support

- [ ] T223 [P] Configure service worker for offline caching in public/sw.js
- [ ] T224 [P] Implement cache strategies for guest list (30-day), announcements (60-day), payments (12-month)
- [ ] T225 [P] Add offline indicator and manual refresh in Header component

### Performance Optimization

- [ ] T226 [P] Implement lazy loading for dashboard route modules
- [ ] T227 [P] Add React.memo to list components for performance
- [ ] T228 [P] Optimize bundle size with Next.js analyzer
- [ ] T229 [P] Add image optimization with Next.js Image component

### Accessibility Compliance

- [ ] T230 [P] Add ARIA labels to all interactive elements
- [ ] T231 [P] Implement keyboard navigation for modals and forms
- [ ] T232 [P] Validate color contrast meets WCAG 2.1 AA standards
- [ ] T233 [P] Test with screen reader for all major flows

### Design System Polish

- [ ] T234 [P] Apply golden ratio to spacing and typography scales in globals.css
- [ ] T235 [P] Create custom DaisyUI theme with brand colors in globals.css @theme
- [ ] T236 [P] Ensure minimum 44x44px touch targets on all buttons and links

### Production Readiness

- [ ] T237 [P] Remove all console.log statements from codebase
- [ ] T238 [P] Add error boundary components for graceful error handling
- [ ] T239 [P] Implement comprehensive error logging
- [ ] T240 [P] Add analytics tracking (if required)
- [ ] T241 [P] Update README.md with setup instructions from quickstart.md
- [ ] T242 Run quickstart.md validation checklist before deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order: US1(P1) → US2(P2) → US3(P2) → US4(P3) → US5(P3) → US6(P4) → US7(P4) → US8(P5) → US9(P5)
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1) - Guests**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **US2 (P2) - Stickers**: Can start after Foundational - No dependencies on other stories
- **US3 (P2) - Profile/History**: Can start after Foundational - No dependencies on other stories
- **US4 (P3) - Announcements**: Can start after Foundational - No dependencies on other stories
- **US5 (P3) - Payments**: Can start after Foundational - No dependencies on other stories
- **US6 (P4) - Permits**: Can start after Foundational - May integrate with US5 (payments) but independently testable
- **US7 (P4) - Incidents**: Can start after Foundational - No dependencies on other stories
- **US8 (P5) - Rules**: Can start after Foundational - No dependencies on other stories
- **US9 (P5) - Messages**: Can start after Foundational - No dependencies on other stories

### Within Each User Story

- Zod schemas before API functions (for validation)
- API functions before hooks (hooks use API functions)
- Hooks before components (components use hooks)
- Components before routes (routes use components)
- Core implementation before integration tasks
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: Tasks T002-T006, T008-T010, T012-T015 can run in parallel (different files)

**Phase 2 (Foundational)**:

- Database migrations T017-T022 can run in parallel
- Supabase clients T026-T027 can run in parallel after T025
- Stores T029-T030 can run in parallel after T028
- Hooks T032-T033 can run in parallel after T031
- Type definitions T035-T043 can run in parallel
- Utility functions T046-T047 can run in parallel
- Constants T049-T052 can run in parallel
- Base UI components T054-T059 can run in parallel
- Layout components T062-T064 can run in parallel
- Auth pages T067-T068 can run in parallel after T066

**User Stories (Phase 3-11)**: Once Foundational phase completes, all 9 user stories can start in parallel by different team members

**Within Each Story**: Tasks marked [P] can run in parallel (different files, no dependencies)

---

## Parallel Example: User Story 1 (Guests)

```bash
# After T071 completes, launch API functions together:
Task T072: "Create getHouseholdGuests function in lib/api/guests.ts"
Task T073: "Create createGuest function in lib/api/guests.ts"
Task T074: "Create updateGuest function in lib/api/guests.ts"
Task T075: "Create cancelGuest function in lib/api/guests.ts"
Task T076: "Create bulkCreateGuests function in lib/api/guests.ts"

# After T077 completes, launch components together:
Task T078: "Create GuestForm component in components/forms/GuestForm.tsx"
Task T079: "Create GuestList component in components/features/guests/GuestList.tsx"
Task T080: "Create GuestStatusBadge component in components/features/guests/GuestStatusBadge.tsx"

# After T082 completes, launch route pages together:
Task T083: "Create new guest page in app/(dashboard)/guests/new/page.tsx"
Task T084: "Create edit guest page in app/(dashboard)/guests/[id]/edit/page.tsx"
Task T085: "Create guest details page in app/(dashboard)/guests/[id]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T015)
2. Complete Phase 2: Foundational (T016-T070) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 - Guests (T071-T088)
4. **STOP and VALIDATE**: Test guest pre-authorization flow independently
5. Deploy/demo MVP

**Estimated MVP**: ~88 tasks for core guest management functionality

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T070)
2. Add US1 (Guests) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Stickers) → Test independently → Deploy/Demo
4. Add US3 (Profile/History) → Test independently → Deploy/Demo
5. Add US4 (Announcements) → Test independently → Deploy/Demo
6. Add US5 (Payments) → Test independently → Deploy/Demo
7. Add US6 (Permits) → Test independently → Deploy/Demo
8. Add US7 (Incidents) → Test independently → Deploy/Demo
9. Add US8 (Rules) → Test independently → Deploy/Demo
10. Add US9 (Messages) → Test independently → Deploy/Demo
11. Polish & Production (T223-T242)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers after Foundational phase:

1. Team completes Setup + Foundational together (T001-T070)
2. Once Foundational is done:
   - **Developer A**: US1 (Guests) - Priority P1
   - **Developer B**: US2 (Stickers) - Priority P2
   - **Developer C**: US3 (Profile/History) - Priority P2
   - **Developer D**: US4 (Announcements) - Priority P3
   - **Developer E**: US5 (Payments) - Priority P3
3. Higher priority stories (P1-P2) complete first
4. Stories integrate and test independently
5. Team collaborates on Polish phase

---

## Task Summary

**Total Tasks**: 242 tasks across 12 phases

**Breakdown by Phase**:

- Phase 1 (Setup): 15 tasks
- Phase 2 (Foundational): 55 tasks
- Phase 3 (US1 - Guests): 18 tasks
- Phase 4 (US2 - Stickers): 21 tasks
- Phase 5 (US3 - Profile/History): 15 tasks
- Phase 6 (US4 - Announcements): 15 tasks
- Phase 7 (US5 - Payments): 17 tasks
- Phase 8 (US6 - Permits): 19 tasks
- Phase 9 (US7 - Incidents): 17 tasks
- Phase 10 (US8 - Rules): 11 tasks
- Phase 11 (US9 - Messages): 16 tasks
- Phase 12 (Polish): 20 tasks

**Parallel Opportunities**: 140+ tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**: Each user story (US1-US9) has clear test criteria for independent validation

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1 - Guest Pre-Authorization) = 88 tasks

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label (US1-US9) maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests are NOT included (not explicitly requested in spec)
- snake_case → camelCase transformation required for all Supabase data
- All file paths follow Next.js 15 App Router structure
- DaisyUI v5 classes used for styling (no custom Tailwind config file needed)
- Mobile-first approach: test on 320px breakpoint first
- WCAG 2.1 AA compliance mandatory for all components
- Zero TypeScript `any` types allowed per constitution
- Stop at any checkpoint to validate story independently before proceeding
