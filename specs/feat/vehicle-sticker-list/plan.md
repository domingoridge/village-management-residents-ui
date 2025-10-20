# Implementation Plan: Vehicle Sticker Request List Page

**Branch**: `feat/vehicle-sticker-list` | **Date**: 2025-10-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/feat/vehicle-sticker-list/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a vehicle sticker request list page that mirrors the guests list implementation pattern. The page displays household sticker requests in a card-based layout with status filtering, pagination, and real-time updates. Implementation follows the existing patterns from `/app/(dashboard)/guests/page.tsx` adapting it for sticker data.

## Technical Context

**Language/Version**: TypeScript 5.9+ with Next.js 15.5.5 (App Router)
**Primary Dependencies**: React 19.2.0, @tanstack/react-query, @supabase/supabase-js 2.75.0, Tailwind CSS 4.0.0, DaisyUI 5.3.3, lucide-react 0.545.0
**Storage**: Supabase (cloud-hosted PostgreSQL) - existing vehicle_sticker table
**Testing**: React Testing Library, Jest (existing setup)
**Target Platform**: Web browsers (responsive design - mobile-first)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Page load < 2s, filter response < 1s, real-time updates < 3s
**Constraints**: WCAG 2.1 AA compliance, mobile-first design, must follow existing patterns from guests implementation
**Scale/Scope**: Typical household: 1-5 sticker requests, max ~20 requests per household

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: Modern Web Standards

✅ **PASS** - Uses Next.js 15.5.5 App Router, React 19.2.0, modern TypeScript

### Principle II: Component-Driven Development

✅ **PASS** - Functional components only (StickerCard, StickerStatusBadge, page component)

- Custom hooks: useStickerRequests (extends existing useStickers pattern)
- Single responsibility: StickerCard displays one request, page handles list orchestration

### Principle III: Type Safety & Code Quality (NON-NEGOTIABLE)

✅ **PASS** - TypeScript strict mode enabled

- Types already defined in `/types/sticker.ts` (StickerRequest, StickerRequestStatus)
- No `any` types used
- snake_case to camelCase transformation at API boundary

### Principle IV: Naming & Code Organization Standards

✅ **PASS** - Follows established conventions

- Components: PascalCase (StickerCard, StickerStatusBadge)
- Files match component names
- Hooks: useSticker Requests, useStickerRequests (camelCase with "use" prefix)
- API transformation: snake_case → camelCase

### Principle V: Accessibility & UX First

✅ **PASS** - Requirements include

- WCAG 2.1 AA compliance mandatory
- Mobile-first responsive design (existing grid: md:grid-cols-2 lg:grid-cols-3)
- Icons from lucide-react (approved library)
- Skeleton loaders during loading states
- Toast notifications for feedback (existing useUIStore)
- data-testid attributes for testing

### Principle VI: Testing & Quality Assurance

✅ **PASS** -

- data-testid attributes will be added to interactive elements
- Husky pre-commit hooks already configured
- Existing test infrastructure reusable

### Principle VII: Documentation & Specification Discipline

✅ **PASS** -

- Feature began with `/speckit.specify` workflow
- This plan references spec.md
- Following established architectural patterns

**Constitution Compliance**: ✅ All principles satisfied. No violations to justify.

## Project Structure

### Documentation (this feature)

```
specs/feat/vehicle-sticker-list/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (patterns analysis)
├── data-model.md        # Phase 1 output (data structures)
├── quickstart.md        # Phase 1 output (developer guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── stickers-api.md  # Sticker list API specification
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec validation checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
app/(dashboard)/stickers/
└── page.tsx                          # Main sticker list page (NEW)

components/features/stickers/
├── StickerCard.tsx                   # Individual sticker request card (NEW)
├── StickerStatusBadge.tsx            # Status badge component (NEW)
├── StickerRequestForm.tsx            # Existing - no changes
├── VehicleSection.tsx                # Existing - no changes
├── QuotaWarning.tsx                  # Existing - no changes
└── DocumentUploadField.tsx           # Existing - no changes

lib/hooks/
└── useStickers.ts                    # Extend with useStickerRequests hook (MODIFY)

lib/api/
└── stickers.ts                       # NEW - API client functions for sticker list

types/
└── sticker.ts                        # Existing - no changes needed

constants/
└── routes.ts                         # Existing - STICKERS.LIST already defined

components/ui/
├── Button.tsx                        # Existing - reuse
├── Card.tsx                          # Existing - reuse
├── Pagination.tsx                    # Existing - reuse
└── Skeleton.tsx                      # Existing - reuse
```

**Structure Decision**: This is a web application using Next.js App Router. The structure follows the established pattern from the guests feature:

- Page components in `app/(dashboard)/[feature]/`
- Feature-specific components in `components/features/[feature]/`
- Data hooks in `lib/hooks/`
- API client functions in `lib/api/`
- Type definitions centralized in `types/`

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

No violations identified. All constitution principles are satisfied.

## Phase 0: Research & Patterns Analysis

### Research Topics

1. **Guest List Implementation Pattern** ✅
   - Analyze `/app/(dashboard)/guests/page.tsx`
   - Study `useGuests` hook in `/lib/hooks/useGuests.ts`
   - Review `/lib/api/guests.ts` for API patterns
   - Examine `GuestCard.tsx` and `GuestStatusBadge.tsx` components

2. **Existing Sticker Infrastructure** ✅
   - Review `/lib/hooks/useStickers.ts` for existing hooks
   - Analyze `/lib/services/stickerService.ts` for data access patterns
   - Check `/types/sticker.ts` for type definitions
   - Verify vehicle_sticker table structure in Supabase

3. **Real-time Subscriptions Pattern** ✅
   - Study `useRealtime` hook implementation
   - Review how guests page implements real-time updates
   - Understand TanStack Query invalidation strategy

4. **Pagination & Filtering Best Practices** ✅
   - Review existing pagination implementation in guests
   - Analyze filter state management approach
   - Study query parameter handling for filter persistence

### Research Output

Research findings documented in `research.md`.

## Phase 1: Design Artifacts

### Data Model

Documented in `data-model.md`:

- StickerRequest entity structure
- StickerRequestStatus type definition
- Pagination metadata structure
- Filter parameters interface

### API Contracts

Documented in `contracts/stickers-api.md`:

- GET /api/stickers - Fetch sticker requests with filters and pagination
- Response structure matching TanStack Query expectations
- Error handling patterns

### Developer Quickstart

Documented in `quickstart.md`:

- How to run the stickers list page locally
- How to test with mock data
- How to extend with additional filters
- Common troubleshooting scenarios

## Phase 2: Implementation Tasks

Tasks will be generated by `/speckit.tasks` command based on this plan and research findings.

## Post-Design Constitution Re-evaluation

All design artifacts have been generated. Re-checking constitution compliance:

### Principle I: Modern Web Standards

✅ **PASS** - Design uses Next.js App Router, React hooks, TanStack Query

- No deviation from modern standards
- All patterns follow current best practices

### Principle II: Component-Driven Development

✅ **PASS** - Designed components are functional and focused

- `StickerCard`: Single responsibility (display one request)
- `StickerStatusBadge`: Single responsibility (display status)
- Page component: Orchestration only
- Custom hooks: `useStickerRequests` with clear purpose

### Principle III: Type Safety & Code Quality

✅ **PASS** - All types defined, no `any` types

- New types: `StickerFilterParams`, `StickerListResponse`
- snake_case → camelCase transformation documented
- All API boundaries typed

### Principle IV: Naming & Code Organization

✅ **PASS** - All naming follows conventions

- Components: PascalCase
- Hooks: camelCase with "use" prefix
- API functions: camelCase
- Consistent with established patterns

### Principle V: Accessibility & UX First

✅ **PASS** - Design includes accessibility features

- Mobile-first responsive grid
- Keyboard navigation via Link components
- Icons from lucide-react (approved library)
- Skeleton loaders specified
- Toast notifications for feedback

### Principle VI: Testing & Quality Assurance

✅ **PASS** - Testing strategy documented

- data-testid attributes planned
- Test scenarios defined in quickstart.md
- Husky hooks will validate before commit

### Principle VII: Documentation & Specification Discipline

✅ **PASS** - Complete documentation suite

- spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md
- All architectural decisions documented
- Traceability to specification maintained

**Final Constitution Compliance**: ✅ ALL PRINCIPLES SATISFIED

**Conclusion**: Design phase complete. No constitution violations. Ready for task generation.

## Next Steps

1. ✅ Constitution Check complete - all gates passed
2. ✅ Phase 0: Generate `research.md` analyzing existing patterns
3. ✅ Phase 1: Generate `data-model.md`, `contracts/`, `quickstart.md`
4. ✅ Update agent context with new feature information
5. ✅ Re-evaluate Constitution Check after design - PASSED
6. ⏭️ Phase 2: Run `/speckit.tasks` to generate implementation tasks

## Notes

- This feature deliberately copies the guests list implementation pattern as specified by the user
- No new architectural patterns introduced - reuses proven patterns from guests feature
- Minimal new code - primarily adapter code for sticker data
- High confidence in implementation due to existing, working reference implementation
