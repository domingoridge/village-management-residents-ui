# Implementation Plan: Village Management Resident Web Application

**Branch**: `feat/resident-web-app` | **Date**: 2025-10-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/feat/resident-web-app/spec.md`

## Summary

The Village Management Resident Web Application is a comprehensive mobile-first progressive web app that enables residents to manage guest pre-authorizations, vehicle stickers, payments, construction permits, incident reports, and communication with village administration. The application serves three user roles (household-head, household-member, household-beneficial-user) with distinct permission levels and provides real-time notifications for critical events.

**Technical Approach**: Next.js 15 App Router with TypeScript for the frontend, Supabase for backend services (authentication, database, real-time subscriptions, storage), React Hook Form + Zod for type-safe form validation, Tailwind CSS v4 + DaisyUI v5 for styling with design tokens, and Zustand for state management. The architecture emphasizes component-driven development, type safety, mobile-first design, and accessibility compliance (WCAG 2.1 AA).

## Technical Context

**Language/Version**: TypeScript 5.7+, Next.js 15 (App Router), React 19
**Primary Dependencies**:

- Next.js 15+ (App Router)
- Supabase (Authentication, Database PostgreSQL, Realtime, Storage)
- React Hook Form 7+ with Zod 4+ for form validation
- Tailwind CSS v4 with DaisyUI v5
- Zustand 5+ for state management
- TanStack Table 8+ for data tables
- Lucide React for icons
- Vitest for testing
- clsx for conditional classnames

**Storage**: Supabase PostgreSQL for relational data, Supabase Storage for file uploads (OR/CR documents, photos, attachments)

**Testing**: Vitest for unit tests, React Testing Library for component tests, test coverage for critical user flows

**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), responsive for desktop/tablet/mobile, progressive web app (PWA) capabilities

**Project Type**: Web application (Next.js frontend + Supabase backend)

**Performance Goals**:

- Initial page load < 3 seconds on 4G
- Page navigation < 300ms
- API responses < 500ms (p95)
- Support 1,000 concurrent users
- Real-time notification delivery < 5 seconds

**Constraints**:

- Mobile-first design (test mobile breakpoints first)
- WCAG 2.1 AA compliance mandatory
- Client-side rendering by default
- No console.log statements (production)
- Zero TypeScript `any` types without justification
- File uploads: 10MB per file, 50MB total per transaction
- Offline support for cached data (30-60 day windows)

**Scale/Scope**:

- Expected users: 500-2,000 residents
- 9 major feature modules
- 81 functional requirements
- 12 key entities
- 50+ components estimated

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Initial Check (Pre-Phase 0)

### Principle I: Modern Web Standards ✅ PASS

- Using Next.js 15 with App Router (modern React 19 features)
- Client-side rendering prioritized
- TypeScript for static typing
- Standards-based web technologies throughout

### Principle II: Component-Driven Development ✅ PASS

- All UI elements will be functional React components
- Hooks-only architecture (no class components)
- Shared component library in `/components`
- Custom hooks for reusable logic (useAuth, useGuests, useNotifications, etc.)
- Each component independently testable

### Principle III: Type Safety & Code Quality ✅ PASS

- Strict TypeScript mode enabled
- Zod schemas for runtime validation + TypeScript inference
- Union types for status enums (GuestStatus, StickerStatus, etc.)
- Zero `any` types policy
- ESLint + Prettier configured
- Husky pre-commit hooks

### Principle IV: Naming & Code Organization ✅ PASS

**Naming Conventions**:

- Components: PascalCase (GuestList, StickerForm, PaymentDashboard)
- Files: Match component name (GuestList.tsx, StickerForm.tsx)
- Hooks: camelCase with "use" prefix (useAuth, usePermissions, useRealtime)
- Utilities: camelCase (formatDate, calculateDaysUntilExpiry, formatCurrency)
- Constants: UPPER_SNAKE_CASE in `/constants` (GUEST_STATUS, STICKER_STATUS, API_ENDPOINTS)
- Types: PascalCase (Guest, VehicleSticker, Household, User)
- Enums/Unions: PascalCase with UPPER_CASE values
- API transformation: snake_case → camelCase
- Form controls: camelCase matching database columns

**Organization**:

- Constants in `/constants` folder with domain files (guestConstants.ts, stickerConstants.ts)
- Shared types in `/types` folder with domain grouping
- Zod schemas in `/lib/schemas` folder
- Domain-driven folder structure

### Principle V: Accessibility & UX First ✅ PASS

- WCAG 2.1 AA compliance target
- Mobile-first responsive design (320px → 1920px)
- Design tokens for spacing, color, typography
- Dark mode support via DaisyUI themes
- Golden ratio applied to layout proportions
- Lucide React icons only (approved library)
- Skeleton loaders for all data-loading components
- Loading indicators during save operations
- Toast notifications (top-right) for success/error
- Touch targets minimum 44x44px

### Principle VI: Testing & Quality Assurance ✅ PASS

- data-testid attributes on interactive elements
- Husky pre-commit hooks configured
- Vitest + React Testing Library
- Test coverage for critical flows
- Pre-commit linting and type checking

### Principle VII: Documentation & Specification Discipline ✅ PASS

- Feature began with `/specify` (spec.md created)
- Implementation plan traces to spec
- Architecture decisions documented in research.md
- All changes reference originating specification

**Initial Gate Result**: ✅ ALL PRINCIPLES PASS - Proceed to Phase 0 Research

---

### Phase 1 Re-Check (Post-Design Artifacts)

**Date**: 2025-10-16 | **Artifacts Reviewed**: data-model.md, contracts/, quickstart.md

### Principle I: Modern Web Standards ✅ PASS

**Evidence**:

- Research.md documents Next.js 15 App Router patterns (research.md:001-078)
- Supabase integration follows SSR best practices (research.md:080-156)
- All API contracts use REST/OpenAPI standards (contracts/\*.yaml)
- No proprietary or non-standard technologies introduced

### Principle II: Component-Driven Development ✅ PASS

**Evidence**:

- Project structure defines component hierarchy (plan.md:187-212)
- Custom hooks documented in research.md and quickstart.md
- Form components follow React Hook Form patterns (quickstart.md:235-260)
- Each feature module independently composable

### Principle III: Type Safety & Code Quality ✅ PASS

**Evidence**:

- Data model references Supabase generated types (data-model.md:001-050)
- Zod schemas for all entities documented (quickstart.md:215-230)
- API contracts define strict TypeScript interfaces (contracts/\*.yaml components/schemas)
- snake_case → camelCase transformation strategy documented (data-model.md:051-100)
- No `any` types in example code

### Principle IV: Naming & Code Organization ✅ PASS

**Evidence**:

- All naming conventions followed in examples (quickstart.md:200-280)
- Constants folder structure matches plan (plan.md:258-264)
- Zod schemas in `/lib/schemas` (plan.md:219-225)
- Types in `/types` with domain grouping (plan.md:244-256)
- camelCase DTOs, PascalCase types consistently applied (data-model.md)

### Principle V: Accessibility & UX First ✅ PASS

**Evidence**:

- WCAG 2.1 AA compliance mentioned in research (research.md:242-290)
- Mobile-first constraints enforced (plan.md:42)
- Design tokens strategy in research.md (research.md:293-335)
- Touch target minimums documented (plan.md:115)
- Skeleton loaders specified (plan.md:112)
- data-testid attributes in examples (quickstart.md:255)

### Principle VI: Testing & Quality Assurance ✅ PASS

**Evidence**:

- Vitest configuration documented (research.md:392-434)
- Testing examples in quickstart.md (quickstart.md:285-310)
- data-testid attributes in form examples (quickstart.md:258)
- Pre-commit hooks in project structure (plan.md:283-285)

### Principle VII: Documentation & Specification Discipline ✅ PASS

**Evidence**:

- All artifacts trace back to spec.md requirements
- API contracts align with functional requirements (spec.md → contracts/)
- Data model matches entity definitions in spec.md
- Quickstart.md references spec, plan, data-model, contracts
- No implementation details leaked into spec.md
- Constitution referenced in multiple artifacts

**Phase 1 Gate Result**: ✅ ALL PRINCIPLES PASS - Proceed to Task Generation

**Notes**:

- No constitution violations detected
- Design artifacts maintain separation of concerns
- All examples follow established conventions
- Documentation completeness verified
- Ready for `/speckit.tasks` execution

## Project Structure

### Documentation (this feature)

```
specs/feat/resident-web-app/
├── spec.md                      # Feature specification
├── plan.md                      # This file (implementation plan)
├── research.md                  # Phase 0 output (technical research)
├── data-model.md                # Phase 1 output (entity definitions)
├── quickstart.md                # Phase 1 output (development guide)
├── contracts/                   # Phase 1 output (API contracts)
│   ├── auth.yaml               # Authentication endpoints
│   ├── guests.yaml             # Guest management endpoints
│   ├── stickers.yaml           # Vehicle sticker endpoints
│   ├── households.yaml         # Household profile endpoints
│   ├── announcements.yaml      # Announcements endpoints
│   ├── payments.yaml           # Payment endpoints
│   ├── permits.yaml            # Construction permit endpoints
│   ├── incidents.yaml          # Incident reporting endpoints
│   ├── rules.yaml              # Village rules endpoints
│   ├── messages.yaml           # Communication endpoints
│   └── notifications.yaml      # Notification endpoints
└── checklists/
    └── requirements.md          # Requirements validation checklist
```

### Source Code (repository root)

```
village-management-resident-ui/
├── app/                         # Next.js 15 App Router
│   ├── (auth)/                 # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/            # Protected routes group
│   │   ├── layout.tsx          # Dashboard shell with navigation
│   │   ├── page.tsx            # Dashboard home
│   │   ├── guests/             # Guest management routes
│   │   ├── stickers/           # Vehicle sticker routes
│   │   ├── profile/            # Household profile routes
│   │   ├── announcements/      # Announcements routes
│   │   ├── payments/           # Payments routes
│   │   ├── permits/            # Construction permits routes
│   │   ├── incidents/          # Incident reporting routes
│   │   ├── rules/              # Village rules routes
│   │   └── messages/           # Communication routes
│   ├── api/                    # API routes (if needed for server actions)
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Tailwind v4 + DaisyUI config
│   └── providers.tsx           # Context providers wrapper
│
├── components/                  # Shared React components
│   ├── ui/                     # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Pagination.tsx
│   │   └── ...
│   ├── forms/                  # Form components
│   │   ├── GuestForm.tsx
│   │   ├── StickerForm.tsx
│   │   ├── PermitForm.tsx
│   │   ├── IncidentForm.tsx
│   │   └── ...
│   ├── features/               # Feature-specific components
│   │   ├── guests/
│   │   ├── stickers/
│   │   ├── payments/
│   │   └── ...
│   └── layout/                 # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── MobileNav.tsx
│       └── Footer.tsx
│
├── lib/                        # Shared libraries and utilities
│   ├── supabase/              # Supabase client configuration
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   └── middleware.ts      # Auth middleware
│   ├── schemas/               # Zod validation schemas
│   │   ├── guest.ts           # Guest schemas
│   │   ├── sticker.ts         # Sticker schemas
│   │   ├── payment.ts         # Payment schemas
│   │   ├── permit.ts          # Permit schemas
│   │   ├── incident.ts        # Incident schemas
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useGuests.ts
│   │   ├── useStickers.ts
│   │   ├── useNotifications.ts
│   │   ├── useRealtime.ts
│   │   └── ...
│   ├── utils/                 # Utility functions
│   │   ├── formatters.ts      # Date, currency, etc.
│   │   ├── validators.ts      # Custom validators
│   │   ├── helpers.ts         # General helpers
│   │   └── ...
│   └── api/                   # API client functions
│       ├── guests.ts
│       ├── stickers.ts
│       ├── payments.ts
│       └── ...
│
├── types/                      # TypeScript type definitions
│   ├── database.types.ts      # Supabase generated types
│   ├── guest.ts               # Guest types
│   ├── sticker.ts             # Sticker types
│   ├── household.ts           # Household types
│   ├── payment.ts             # Payment types
│   ├── permit.ts              # Permit types
│   ├── incident.ts            # Incident types
│   ├── announcement.ts        # Announcement types
│   ├── rule.ts                # Rule types
│   ├── message.ts             # Message types
│   ├── notification.ts        # Notification types
│   └── index.ts               # Barrel export
│
├── constants/                  # Application constants
│   ├── guestConstants.ts      # Guest-related constants (statuses, etc.)
│   ├── stickerConstants.ts    # Sticker-related constants
│   ├── paymentConstants.ts    # Payment-related constants
│   ├── routes.ts              # Route definitions
│   ├── api.ts                 # API endpoint constants
│   └── ...
│
├── store/                      # Zustand state management
│   ├── authStore.ts           # Authentication state
│   ├── notificationStore.ts   # Notification state
│   ├── uiStore.ts             # UI state (sidebar, modals, etc.)
│   └── ...
│
├── public/                     # Static assets
│   ├── icons/                 # PWA icons
│   ├── images/                # Static images
│   └── manifest.json          # PWA manifest
│
├── __tests__/                  # Test files
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── integration/
│
├── .husky/                     # Git hooks
│   ├── pre-commit
│   └── pre-push
│
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration (if needed for v4)
├── tsconfig.json               # TypeScript configuration
├── eslint.config.mjs           # ESLint configuration
├── vitest.config.ts            # Vitest configuration
├── package.json
└── README.md
```

**Structure Decision**: Web application structure with Next.js App Router. This architecture uses:

- **App Router** (`/app`) for file-based routing with layouts, loading states, and error boundaries
- **Route Groups** for logical organization: `(auth)` for public routes, `(dashboard)` for protected routes
- **Colocation** of components, hooks, and utilities in logical folders outside `/app`
- **Domain-driven types** in `/types` folder with clear entity boundaries
- **Zod schemas** in `/lib/schemas` for validation logic separation
- **Supabase integration** in `/lib/supabase` with client/server separation
- **Zustand stores** for client-side state management (auth, notifications, UI state)
- **Constants** folder for shared values and enums across the application

This structure aligns with Next.js 15 best practices and supports:

- Server and client component separation
- Type-safe data fetching with Supabase
- Reusable components and hooks
- Testable business logic
- Clear separation of concerns

## Complexity Tracking

_No constitution violations identified - all principles passed_

## Phase 0: Research & Technical Decisions

### Research Areas

1. **Next.js 15 + React 19 Best Practices**
   - App Router patterns for authentication
   - Server vs Client components optimization
   - Streaming and Suspense boundaries
   - Metadata and SEO considerations

2. **Supabase Integration Architecture**
   - Client vs Server Supabase client usage
   - Row-Level Security (RLS) policy design
   - Realtime subscriptions for notifications
   - File upload strategies with Supabase Storage
   - Authentication flow with Next.js middleware

3. **Form Management Strategy**
   - React Hook Form + Zod integration patterns
   - Multi-step form handling (permits, sticker requests)
   - File upload handling in forms
   - Form state persistence (localStorage)
   - Optimistic UI updates

4. **State Management Architecture**
   - Zustand vs React Context decision
   - Server state vs Client state separation
   - Notification state management
   - Cache invalidation strategies

5. **Real-time Notifications Architecture**
   - Supabase Realtime subscriptions setup
   - Browser notification permission handling
   - WebSocket connection management
   - Notification action handling
   - Fallback for denied permissions

6. **Offline Support & PWA Strategy**
   - Service worker configuration
   - Cache strategies for different data types
   - Background sync for queued actions
   - Conflict resolution for offline changes

7. **Performance Optimization**
   - Code splitting strategies
   - Image optimization with Next.js Image
   - Lazy loading patterns
   - Bundle size optimization
   - Database query optimization with Supabase

8. **Accessibility Implementation**
   - ARIA attributes for custom components
   - Keyboard navigation patterns
   - Focus management
   - Screen reader testing approach
   - Color contrast validation

9. **Design Token System**
   - Tailwind v4 @theme configuration
   - DaisyUI theme customization
   - Color palette generation from hex values
   - Responsive spacing scale
   - Typography scale with golden ratio

10. **Payment Gateway Integration**
    - PayMongo, GCash, PayMaya integration approaches
    - Security considerations (PCI compliance)
    - Transaction status handling
    - Receipt generation strategies
    - Payment failure recovery

11. **File Upload & Compression**
    - Client-side image compression libraries
    - File type validation
    - Progress tracking for uploads
    - Drag-and-drop implementation
    - Presigned URL patterns with Supabase Storage

12. **Testing Strategy**
    - Vitest configuration for Next.js
    - React Testing Library patterns
    - Mock strategies for Supabase
    - Integration test approach
    - E2E testing needs assessment

### Research Output

See `research.md` for detailed findings and decisions for each research area.

## Phase 1: Design Artifacts

### Data Model

See `data-model.md` for complete entity definitions including:

- Field specifications with types
- Validation rules
- Relationships between entities
- State machine definitions for statuses
- Database schema considerations

### API Contracts

See `contracts/` directory for OpenAPI specifications for:

- Authentication endpoints
- Guest management CRUD
- Vehicle sticker lifecycle
- Household profile operations
- Announcement delivery
- Payment processing
- Construction permit workflow
- Incident reporting
- Village rules access
- Messaging with admin
- Notification management

### Development Guide

See `quickstart.md` for:

- Environment setup instructions
- Supabase project configuration
- Local development workflow
- Testing procedures
- Deployment checklist

## Next Steps

After Phase 1 completion, proceed to:

1. ✅ **Constitution Re-check**: Validate Phase 1 design against constitution principles - COMPLETED
2. **Task Generation**: Run `/speckit.tasks` to generate implementation tasks from this plan
3. **Implementation**: Execute tasks following the generated task list
4. **Testing**: Validate each user story independently per spec requirements
5. **Deployment**: Follow deployment checklist from quickstart.md

---

**Plan Status**: ✅ Phase 0 COMPLETE | ✅ Phase 1 COMPLETE | Ready for Task Generation

**Artifacts Completed**:

- ✅ research.md - Technical research and decisions (12 research areas)
- ✅ data-model.md - Entity definitions based on Supabase schema
- ✅ contracts/ - 11 API contract specifications (OpenAPI 3.1.0)
  - auth.yaml, households.yaml, stickers.yaml, permits.yaml (existing tables)
  - guests.yaml, announcements.yaml, payments.yaml, incidents.yaml, messages.yaml, notifications.yaml, rules.yaml (new tables)
- ✅ quickstart.md - Development setup and workflow guide
- ✅ Constitution re-check - All 7 principles passed

**Next Action**: Execute `/speckit.tasks` to generate implementation task list
