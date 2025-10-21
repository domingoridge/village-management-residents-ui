# Implementation Plan: Permit Request Wizard

**Branch**: `feat/permit-request-wizard` | **Date**: 2025-10-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/feat/permit-request-wizard/spec.md`

## Summary

Implement a multi-step wizard interface for residents to apply for construction permits. The wizard includes three main steps: Project Details (with dynamic fields based on permit type), Document Uploads (with file validation), and Payment (with external gateway integration). The implementation will use a JSON Schema-based dynamic form renderer to support permit type-specific form templates, reusing existing UI components (Input, Select, etc.) and extending them with file upload capabilities.

## Technical Context

**Language/Version**: TypeScript 5.9+ with strict mode enabled
**Primary Dependencies**:

- Next.js 15.5.5 (App Router)
- React 19.2.0
- react-hook-form 7.65.0 + @hookform/resolvers 5.2.2
- zod 4.1.12 (validation)
- @tanstack/react-query 5.90.5 (server state)
- @supabase/supabase-js 2.75.0 (database & storage)
- Tailwind CSS 4.0.0 + DaisyUI 5.3.3
- lucide-react 0.545.0 (icons)

**Storage**:

- Supabase PostgreSQL (permit applications, fee structures, permit type configurations)
- Supabase Storage (uploaded documents - building plans, contracts, photos)

**Testing**: Vitest 3.2.4 + @testing-library/react 16.3.0
**Target Platform**: Web application (mobile-first responsive design)
**Project Type**: Web application (Next.js App Router)

**Performance Goals**:

- Form field rendering < 100ms after permit type selection
- File upload feedback < 500ms for validation errors
- Fee calculation updates < 1 second (per SC-007)
- Wizard step transitions < 200ms

**Constraints**:

- File uploads limited to 10MB per file
- Support JPG, PNG, DWG, PDF formats based on document type
- Mobile-first design (320px minimum width)
- WCAG 2.1 AA compliance required
- Must use external payment gateway redirects (no PCI compliance burden)

**Scale/Scope**:

- Support multiple permit categories with different form templates
- Dynamic field visibility based on permit type selection
- 3 wizard steps + confirmation page
- File upload with drag-and-drop and click-to-upload interfaces
- Draft save/resume functionality

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Principle I: Modern Web Standards

- **Status**: PASS
- Next.js 15 App Router with React 19, client-side rendering, modern hooks-based architecture

### ✅ Principle II: Component-Driven Development

- **Status**: PASS
- Functional components only, wizard steps as discrete components, reusable form renderer component
- Custom hooks for wizard state management (useWizardStep, usePermitForm, useDynamicSchema)

### ✅ Principle III: Type Safety & Code Quality

- **Status**: PASS
- TypeScript strict mode enabled, Zod for runtime validation
- react-hook-form with TypeScript types for form state
- JSON Schema types for dynamic form definitions
- ESLint + Prettier via Husky pre-commit hooks

### ✅ Principle IV: Naming & Code Organization Standards

- **Status**: PASS
- **Components**: `PermitWizard`, `DynamicFormRenderer`, `StepProjectDetails`, `StepDocuments`, `StepPayment`
- **Hooks**: `useWizardStep`, `usePermitForm`, `useDynamicSchema`, `useFileUpload`, `useFeeCalculation`
- **Types**: `PermitApplication`, `PermitType`, `FormSchema`, `DocumentUpload`, `FeeBreakdown`
- **Utilities**: `validateFileSize`, `calculateFees`, `transformApiData`
- **Constants**: `PERMIT_TYPES`, `MAX_FILE_SIZE`, `ALLOWED_FILE_FORMATS`

### ✅ Principle V: Accessibility & UX First

- **Status**: PASS
- Mobile-first responsive design, WCAG 2.1 AA compliance
- Skeleton loaders for permit type loading and fee calculations
- Toast notifications for draft saves, validation errors, submission success/failure
- Clear visual hierarchy with progress indicator
- Form validation with accessible error messages
- lucide-react icons for consistent iconography

### ✅ Principle VI: Testing & Quality Assurance

- **Status**: PASS
- data-testid attributes on wizard navigation buttons, form fields, submit buttons
- Vitest + React Testing Library for component tests
- Husky pre-commit hooks enforcing lint and type checks

### ✅ Principle VII: Documentation & Specification Discipline

- **Status**: PASS
- Feature initiated via `/speckit.specify` workflow
- Implementation plan references spec.md
- Data models, contracts, and research documented in specs directory

## Project Structure

### Documentation (this feature)

\`\`\`
specs/feat/permit-request-wizard/
├── spec.md # Feature specification (completed)
├── plan.md # This file
├── research.md # Phase 0 output (to be generated)
├── data-model.md # Phase 1 output (to be generated)
├── quickstart.md # Phase 1 output (to be generated)
├── contracts/ # Phase 1 output (to be generated)
│ ├── permit-types-api.yaml
│ ├── fee-calculation-api.yaml
│ └── file-upload-api.yaml
├── examples/ # Example JSON Schema files for reference
│ ├── construction-schema.json
│ └── renovation-schema.json
├── checklists/
│ └── requirements.md # Spec quality checklist (completed)
└── tasks.md # Phase 2 output (NOT created by /speckit.plan)
\`\`\`

### Source Code (repository root)

\`\`\`
app/
├── (dashboard)/
│ └── permits/
│ ├── new/
│ │ └── page.tsx # Permit wizard entry page
│ ├── [id]/
│ │ ├── page.tsx # View submitted permit
│ │ └── edit/
│ │ └── page.tsx # Resume draft permit
│ └── page.tsx # List permits (existing/drafts)

components/
├── features/
│ └── permits/
│ ├── PermitWizard.tsx # Main wizard orchestrator
│ ├── DynamicFormRenderer.tsx # JSON Schema form renderer
│ ├── WizardProgressIndicator.tsx # Progress bar component
│ ├── StepProjectDetails.tsx # Step 1: Dynamic form for project info
│ ├── StepDocuments.tsx # Step 2: Document uploads
│ ├── StepPayment.tsx # Step 3: Fee breakdown + payment options
│ ├── ConfirmationPage.tsx # Post-submission confirmation
│ ├── PermitTypeSelector.tsx # Permit type dropdown
│ ├── DocumentUploadZone.tsx # Multi-file upload with validation
│ ├── FeeBreakdownCard.tsx # Fee itemization display
│ └── PaymentMethodSelector.tsx # Payment gateway selection
└── ui/
├── FileUpload.tsx # Shared file upload component (new)
├── Input.tsx # Existing - reused
├── Select.tsx # Existing - reused
├── Button.tsx # Existing - reused
├── Card.tsx # Existing - reused
└── Toast.tsx # Existing - reused

lib/
├── hooks/
│ ├── useWizardStep.ts # Wizard state management
│ ├── usePermitForm.ts # Form state with react-hook-form
│ ├── useDynamicSchema.ts # Load & parse JSON Schema from file
│ ├── useFileUpload.ts # File validation & upload to Supabase Storage
│ └── useFeeCalculation.ts # Calculate fees based on permit type + params
├── schemas/
│ ├── permitApplicationSchema.ts # Zod schema for application data
│ └── permits/ # JSON Schema 2020-12 files per permit type
│ ├── construction.json
│ ├── renovation.json
│ ├── electrical.json
│ └── plumbing.json
├── services/
│ ├── permitService.ts # API calls for permit CRUD
│ ├── fileService.ts # Supabase Storage operations
│ └── feeService.ts # Fee calculation logic
└── utils/
├── fileValidation.ts # File size, format validation
├── feeCalculator.ts # Fee computation algorithms
└── schemaValidator.ts # JSON Schema Draft 2020-12 validator utilities

types/
├── permit.ts # PermitApplication, PermitType union, etc.
├── forms.ts # FormSchema, FieldDefinition, etc.
└── payment.ts # PaymentMethod, PaymentStatus, etc.

constants/
├── permitTypes.ts # Permit type union types and metadata
├── fileFormats.ts # ALLOWED_FORMATS, MAX_FILE_SIZE
└── feeStructures.ts # Base fee configuration by permit type
\`\`\`

**Structure Decision**: Selected **Web Application** structure using Next.js App Router. The project follows Next.js conventions with:

- Route-based pages in `app/` directory
- Feature-specific components in `components/features/permits/`
- Reusable UI components in `components/ui/`
- Business logic in `lib/` (hooks, services, schemas, utils)
- Type definitions in `types/` with union types for permit categories
- Configuration constants in `constants/` for metadata
- JSON Schema files in `lib/schemas/permits/` for form definitions

This structure supports component-driven development, clear separation of concerns, and aligns with the existing codebase patterns (guests, stickers features follow similar organization).

**Schema Storage Approach**:

- Permit types defined as TypeScript union types in `constants/permitTypes.ts` (e.g., `type PermitType = 'construction' | 'renovation' | 'electrical' | 'plumbing'`)
- JSON Schema 2020-12 definitions stored as `.json` files in `lib/schemas/permits/` directory
- Schema files loaded dynamically based on selected permit type (e.g., import construction.json when permit type is 'construction')
- TypeScript types for schema structure defined in `types/forms.ts` to ensure type safety when working with loaded schemas
- Schemas follow JSON Schema Draft 2020-12 specification exactly as stored

## Complexity Tracking

_No constitution violations - this section intentionally left empty._

## Phase 0: Research & Design Decisions

**Key Research Tasks**:

1. **JSON Schema 2020-12 Implementation**
   - Research libraries for JSON Schema validation in React (ajv for runtime validation)
   - Determine approach for mapping JSON Schema to react-hook-form
   - Investigate conditional field rendering (allOf, if/then/else in JSON Schema)
   - Dynamic import strategy for loading JSON files based on permit type
   - TypeScript type definitions for JSON Schema structure

2. **Dynamic Form Rendering Patterns**
   - Best practices for rendering forms from schema definitions
   - Handling nested objects and array fields in JSON Schema
   - Mapping JSON Schema types to UI components (Input, Select, FileUpload, etc.)

3. **Multi-Step Wizard State Management**
   - Local state vs URL params for wizard step tracking
   - Draft persistence strategy (localStorage vs database)
   - Validation strategy per step vs end-to-end

4. **File Upload Architecture**
   - Supabase Storage bucket structure for permit documents
   - Direct upload vs signed URL approach
   - File validation before upload vs server-side validation
   - Progress tracking for large files

5. **Fee Calculation Strategy**
   - Client-side vs server-side fee calculation
   - Caching strategy for fee structures
   - Real-time updates as form fields change

6. **Payment Gateway Integration**
   - GCash, PayMaya, Credit Card gateway research (Philippine providers)
   - Redirect flow vs iframe embedding patterns
   - Webhook/callback URL security for payment status updates
   - Payment status reconciliation after browser close

**Output**: Documented in `research.md` after agent-based research completes.

## Phase 1: Data Model & Contracts

**Prerequisites**: research.md complete

### Data Model Entities

1. **permit_applications** table
   - Fields: id, resident_id, permit_type (text - matches TypeScript union), status, form_data (JSONB), created_at, updated_at, submitted_at
   - Relationships: belongs to resident, has many documents, has one payment
   - Note: permit_type stored as string literal matching TypeScript union type (e.g., 'construction', 'renovation')

2. **permit_type_metadata** table (optional - for dynamic configuration)
   - Fields: id, type_key (text - matches TypeScript union), display_name, category, base_fee, processing_fee, is_active, created_at
   - Note: Form schemas stored as JSON files in `lib/schemas/permits/`, not database
   - Allows fee structures to be updated without code deployment if needed

3. **permit_documents** table
   - Fields: id, application_id, document_type, file_path, file_name, file_size, mime_type, uploaded_at
   - Relationships: belongs to application

4. **permit_fees** table
   - Fields: id, application_id, base_fee, processing_fee, road_use_fee, total, calculation_params (JSONB), created_at
   - Relationships: belongs to application

5. **permit_payments** table
   - Fields: id, application_id, payment_method, amount, status, gateway_transaction_id, paid_at, created_at
   - Relationships: belongs to application

### API Contracts

1. **GET /api/permits/types** - Fetch all permit types with categories and schemas
2. **GET /api/permits/types/:id/schema** - Get JSON Schema for specific permit type
3. **POST /api/permits** - Create new permit application (draft)
4. **PUT /api/permits/:id** - Update permit application
5. **POST /api/permits/:id/submit** - Submit application for review
6. **POST /api/permits/:id/documents** - Upload document
7. **GET /api/permits/:id/fees** - Calculate fees for application
8. **POST /api/permits/:id/payment** - Initiate payment gateway redirect
9. **POST /api/webhooks/payment/callback** - Handle payment gateway callback

**Output**: OpenAPI specs in `/contracts/`, data model documented in `data-model.md`, quickstart guide in `quickstart.md`.

### Agent Context Update

After Phase 1 completion, run:
\`\`\`bash
.specify/scripts/bash/update-agent-context.sh claude
\`\`\`

This will update `CLAUDE.md` to include:

- JSON Schema 2020-12 form rendering
- Supabase Storage for file uploads
- Payment gateway integration patterns

## Next Steps

After Phase 1 completes:

1. Run `/speckit.tasks` to generate actionable tasks from this plan
2. Begin implementation following generated task sequence
3. Ensure all components follow constitution naming conventions
4. Add data-testid attributes during implementation for test automation
5. Implement skeleton loaders for async operations (permit type loading, fee calculations)
6. Configure toast notifications for user feedback
