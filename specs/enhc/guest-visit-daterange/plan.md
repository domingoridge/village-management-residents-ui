# Implementation Plan: Guest Visit Date Range Picker

**Branch**: `enhc/guest-visit-daterange` | **Date**: 2025-10-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/enhc/guest-visit-daterange/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Replace the single "Expected Arrival Date" field with a date range picker that captures both visit_date_start and visit_date_end for guest pre-authorizations. This enables residents to specify multi-day visit durations while automatically calculating visit_duration. The implementation uses react-calendar for the date range selection UI and updates the guest schema and API mappings accordingly.

## Technical Context

**Language/Version**: TypeScript 5.9+ with Next.js 15.5.5 (App Router), React 19.2.0
**Primary Dependencies**: react-calendar (date range picker), react-hook-form 7.65.0, zod 4.1.12, @supabase/supabase-js 2.75.0, Tailwind CSS 4.0.0, DaisyUI 5.3.3, lucide-react 0.545.0
**Storage**: Supabase (PostgreSQL) - cloud-hosted database with existing guests table
**Testing**: Vitest 3.2.4 with @testing-library/react 16.3.0
**Target Platform**: Web (responsive - mobile-first design per constitution)
**Project Type**: Web application (Next.js App Router with client-side rendering)
**Performance Goals**: Date picker interactions <100ms, form validation instant (<50ms), form submission <2s
**Constraints**: WCAG 2.1 AA compliant, mobile-first responsive, must work on touch devices, skeleton loaders during data fetch, toast notifications for feedback
**Scale/Scope**: Single feature enhancement affecting 1 form component, 1 schema file, 1 API mapping function, ~3-5 new components/hooks

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Phase 0 Check

| Principle                   | Requirement                                                                      | Status       | Notes                                                                     |
| --------------------------- | -------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| **I. Modern Web Standards** | Use standards-based web tech, client-side rendering                              | ✅ PASS      | Using Next.js App Router with "use client" directive, React 19            |
| **II. Component-Driven**    | Functional components with hooks, reusable                                       | ✅ PASS      | Will create DateRangePicker component, use react-hook-form integration    |
| **III. Type Safety**        | Strict TypeScript, no `any` types                                                | ✅ PASS      | All code strictly typed, zod schemas for validation                       |
| **IV. Naming Standards**    | PascalCase components, camelCase hooks/utils, snake_case→camelCase API transform | ✅ PASS      | Following all naming conventions, API transform in createGuest mapping    |
| **V. Accessibility & UX**   | WCAG 2.1 AA, mobile-first, skeleton loaders, toast notifications                 | ⚠️ ATTENTION | Must verify react-calendar is WCAG compliant or create accessible wrapper |
| **VI. Testing & Quality**   | data-testid attributes, Husky hooks, tests pass                                  | ✅ PASS      | Will add test IDs to date picker elements                                 |
| **VII. Documentation**      | Feature starts with `/specify`, traces to spec                                   | ✅ PASS      | Following speckit workflow                                                |

### Gates Assessment

**BLOCKING ISSUES**: None

**ATTENTION REQUIRED**:

- **Accessibility verification for react-calendar**: Must ensure the chosen date picker library meets WCAG 2.1 AA standards. If not compliant out-of-box, will need to create accessible wrapper component with proper ARIA labels, keyboard navigation, and screen reader support.

**Action**: Phase 0 research will evaluate react-calendar accessibility and document mitigation strategy if needed.

### Post-Phase 1 Check

**Status**: ✅ ALL GATES PASSED

| Principle                   | Requirement                                                                      | Status  | Notes                                                                        |
| --------------------------- | -------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| **I. Modern Web Standards** | Use standards-based web tech, client-side rendering                              | ✅ PASS | Confirmed: DateRangePicker uses "use client", follows React patterns         |
| **II. Component-Driven**    | Functional components with hooks, reusable                                       | ✅ PASS | Confirmed: DateRangePicker, Calendar, useDateRange hook all functional       |
| **III. Type Safety**        | Strict TypeScript, no `any` types                                                | ✅ PASS | Confirmed: All types defined in types/calendar.ts, strict schemas            |
| **IV. Naming Standards**    | PascalCase components, camelCase hooks/utils, snake_case→camelCase API transform | ✅ PASS | Confirmed: All naming conventions followed in data-model.md                  |
| **V. Accessibility & UX**   | WCAG 2.1 AA, mobile-first, skeleton loaders, toast notifications                 | ✅ PASS | Confirmed: Wrapper component adds ARIA labels, keyboard nav, 44x44px targets |
| **VI. Testing & Quality**   | data-testid attributes, Husky hooks, tests pass                                  | ✅ PASS | Confirmed: Test plan includes data-testid, unit and integration tests        |
| **VII. Documentation**      | Feature starts with `/specify`, traces to spec                                   | ✅ PASS | Confirmed: Full documentation trail from spec to quickstart                  |

**Accessibility Resolution**: Research confirmed react-calendar has basic accessibility support. DateRangePicker wrapper component (defined in quickstart.md) adds:

- Comprehensive ARIA labels (navigationAriaLabel, nextAriaLabel, etc.)
- aria-live region for selection announcements
- Visible focus indicators
- Minimum 44x44px touch targets
- Screen reader announcements for selected dates

**DESIGN APPROVED**: All constitution principles satisfied. Ready to proceed to `/speckit.tasks`.

## Project Structure

### Documentation (this feature)

```
specs/enhc/guest-visit-daterange/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── guests-daterange.yaml
├── checklists/
│   └── requirements.md  # Already created during /speckit.specify
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
app/
└── (dashboard)/
    └── guests/
        └── new/
            └── page.tsx              # [MODIFIED] Update to use DateRangePicker

components/
├── ui/
│   ├── DateRangePicker.tsx          # [NEW] Date range picker wrapper component
│   └── Calendar.tsx                 # [NEW] react-calendar styled wrapper
└── features/
    └── guests/
        └── GuestForm.tsx             # [MODIFIED] Replace expectedArrivalDate with date range

lib/
├── schemas/
│   └── guest.ts                      # [MODIFIED] Update schema: visitDateStart, visitDateEnd, visitDuration
├── api/
│   └── guests.ts                     # [MODIFIED] Update createGuest mapping (expected_arrival_date → visit_start_date)
└── utils/
    ├── validation.ts                 # [MODIFIED] Add date range validation functions
    └── dateHelpers.ts                # [NEW] calculateVisitDuration, formatDateRange utilities

hooks/
└── useDateRange.ts                   # [NEW] Custom hook for date range state management

types/
└── calendar.ts                       # [NEW] TypeScript types for date range picker

__tests__/
└── components/
    └── DateRangePicker.test.tsx      # [NEW] Unit tests for date range picker
```

**Structure Decision**: This is a Next.js App Router web application following the existing project structure. The feature touches multiple layers:

- **UI Layer**: New DateRangePicker component in `components/ui/`
- **Feature Layer**: Modified GuestForm in `components/features/guests/`
- **Schema Layer**: Updated guest schema with new fields
- **API Layer**: Modified API mapping in `lib/api/guests.ts`
- **Utils Layer**: New date helper utilities
- **Hooks Layer**: Custom hook for date range logic
- **Types Layer**: TypeScript definitions for calendar types

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

No violations requiring justification. All constitution principles are being followed.
