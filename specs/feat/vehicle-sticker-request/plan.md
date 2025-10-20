# Implementation Plan: Vehicle Sticker Request System

**Branch**: `feat/vehicle-sticker-request` | **Date**: 2025-10-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/feat/vehicle-sticker-request/spec.md`

**Additional Requirements from User**:

- Use React Hook Form array to handle multiple vehicle submissions
- Add validation against household `sticker_quota` to limit how many stickers can be requested

## Summary

Implement a single-page vehicle sticker request form that allows residents to request vehicle access stickers for one or more vehicles. The form will collect vehicle information (plate number, make, model, color, year, registered owner), sticker type (Resident/Beneficial User), and required documents (Official Receipt, Certificate of Registration, optional Vehicle Photo). Multiple vehicles can be added using React Hook Form's `useFieldArray`, with validation against the household's sticker quota. Each submitted vehicle creates a separate sticker request record in Supabase, with documents uploaded to Supabase Storage.

## Technical Context

**Language/Version**: TypeScript 5.9+
**Primary Framework**: Next.js 15.5.5 (App Router), React 19.2.0
**Form Management**: React Hook Form 7.65.0 with useFieldArray for dynamic vehicle entries
**Validation**: Zod 4.1.12 for schema validation
**Storage**: Supabase (PostgreSQL) for data, Supabase Storage for document files
**State Management**: TanStack Query 5.90.5 for server state, Zustand 5.0.8 for UI state
**Styling**: Tailwind CSS 4.0.0, DaisyUI 5.3.3
**Icons**: Lucide React 0.545.0
**Testing**: Vitest 3.2.4 with @testing-library/react 16.3.0
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web (single Next.js application with App Router)
**Performance Goals**:

- Page load < 3 seconds
- Form validation feedback < 500ms
- Document upload for files up to 5MB
- Support up to 10 vehicles per session without degradation
  **Constraints**:
- Maximum file size: 5MB per document
- Supported file formats: PDF, JPG, PNG
- Must respect household sticker_quota limit
- Form data preservation on validation errors
  **Scale/Scope**:
- Estimated hundreds of households
- Multiple vehicles per household (typically 1-5)
- 3 document types per vehicle request

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Constitution Compliance Analysis

#### ✅ **I. Modern Web Standards**

- Using Next.js 15.5.5 with App Router (modern standards-based)
- Client-side rendering for form interactions
- Modern React 19.2.0 with hooks

#### ✅ **II. Component-Driven Development**

- Functional components with hooks exclusively
- React Hook Form's useFieldArray for dynamic vehicle management
- Reusable components (form inputs, file upload, vehicle sections)
- Custom hooks for Supabase queries and mutations

#### ✅ **III. Type Safety & Code Quality**

- Strict TypeScript mode enabled
- Zod schemas for runtime validation
- No `any` types (union types and proper typing throughout)
- All ESLint/TSConfig rules enforced via Husky

#### ✅ **IV. Naming & Code Organization Standards**

- Components: PascalCase (StickerRequestForm, VehicleFieldsArray)
- Files: Match component names
- Hooks: camelCase with "use" prefix (useCreateStickerRequest, useHouseholdQuota)
- API transformation: snake_case → camelCase
- Constants: UPPER_SNAKE_CASE in /constants folder

#### ✅ **V. Accessibility & UX First**

- WCAG 2.1 AA compliance with semantic HTML and aria labels
- Mobile-first responsive design
- Clear visual hierarchy for multi-vehicle form sections
- Skeleton loaders during quota check and document uploads
- Loading indicators on submit button during save
- Toast notifications for success/error (top-right positioning)
- Lucide React icons only (approved library)

#### ✅ **VI. Testing & Quality Assurance**

- data-testid attributes on interactive elements (vehicle sections, file uploads, submit button)
- Husky pre-commit hooks configured
- Vitest test setup available

#### ✅ **VII. Documentation & Specification Discipline**

- Feature initiated via /speckit.specify
- Specification document created and validated
- This implementation plan traces to spec.md

### Gates Status

All constitution gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```
specs/feat/vehicle-sticker-request/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   └── api-schema.yaml  # API contract definitions
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
app/
├── (dashboard)/
│   ├── stickers/
│   │   ├── new/
│   │   │   └── page.tsx           # NEW: Main sticker request page
│   │   ├── [id]/
│   │   │   └── page.tsx           # FUTURE: Request details view
│   │   └── page.tsx               # FUTURE: Requests list
│   └── layout.tsx                 # Existing dashboard layout

components/
├── features/
│   └── stickers/
│       ├── StickerRequestForm.tsx      # NEW: Main form component
│       ├── VehicleSection.tsx          # NEW: Single vehicle form section
│       ├── DocumentUploadField.tsx     # NEW: File upload with preview
│       └── QuotaWarning.tsx            # NEW: Quota limit indicator
└── ui/
    ├── Button.tsx                      # Existing
    ├── Card.tsx                        # Existing
    └── Input.tsx                       # Existing

lib/
├── hooks/
│   ├── useStickers.ts                  # NEW: Sticker CRUD operations
│   └── useHouseholdQuota.ts            # NEW: Quota validation hook
├── schemas/
│   └── sticker.ts                      # NEW: Zod schemas for validation
├── services/
│   └── stickerService.ts               # NEW: Supabase service layer
└── supabase/
    ├── browser.ts                      # Existing
    └── client.ts                       # Existing

types/
└── sticker.ts                          # NEW: TypeScript type definitions

constants/
└── stickers.ts                         # NEW: Sticker-related constants (ROUTES, file limits, etc.)
```

**Structure Decision**: Using existing Next.js App Router structure with `app/` directory. This is a web application with integrated frontend and backend (Supabase client-side SDK). Following the established pattern from guests feature: page components in `app/(dashboard)/`, feature components in `components/features/`, and data hooks in `lib/hooks/`.

## Complexity Tracking

_No Constitution Check violations - this section intentionally left empty._
