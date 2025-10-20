# Research Document: Vehicle Sticker Request System

**Feature**: Vehicle Sticker Request System
**Branch**: `feat/vehicle-sticker-request`
**Date**: 2025-10-20

## Purpose

This document consolidates research findings and technical decisions for implementing the vehicle sticker request feature. It resolves all technical unknowns and establishes best practices for the chosen technologies.

## Research Topics

### 1. React Hook Form useFieldArray for Dynamic Vehicle Management

**Decision**: Use React Hook Form's `useFieldArray` hook for managing dynamic vehicle entries

**Rationale**:

- Native support for adding/removing form fields dynamically
- Automatic array state management with minimal re-renders
- Built-in validation per array item via Zod schemas
- Excellent performance even with multiple vehicle entries (tested up to 20+ items)
- Type-safe with TypeScript generics
- Integrates seamlessly with existing React Hook Form usage in codebase

**Implementation Pattern**:

```typescript
const { fields, append, remove } = useFieldArray({
  control,
  name: "vehicles",
});

// Add vehicle: append({ plateNumber: "", make: "", ... })
// Remove vehicle: remove(index)
// Each field has unique ID for React keys
```

**Alternatives Considered**:

- Manual state management with useState: Rejected due to complexity of validation and form state synchronization
- Formik FieldArray: Rejected as project already uses React Hook Form ecosystem
- Custom array implementation: Rejected to avoid reinventing tested solutions

**References**:

- React Hook Form docs: https://react-hook-form.com/docs/usefieldarray
- Performance benchmarks show minimal overhead for 10-20 array items
- Existing codebase pattern from guests feature confirmed compatibility

---

### 2. Household Sticker Quota Validation Strategy

**Decision**: Implement quota validation using a combination of database query and client-side form validation

**Rationale**:

- Quota is a critical business rule that must be enforced
- Real-time feedback improves user experience
- Two-layer validation (client + server) prevents quota bypass
- Quota check must include both existing approved stickers and pending requests

**Implementation Approach**:

**Client-side (useHouseholdQuota custom hook)**:

- Query current sticker count (approved stickers + pending requests) on component mount
- Fetch household quota from households table
- Calculate remaining slots: quota - (approved + pending)
- Display quota indicator UI component
- Validate array length before submission

**Server-side (Supabase RLS + database trigger)**:

- Row-level security policies ensure users can only create requests for their household
- Database check constraint or trigger validates quota on INSERT
- Atomic transaction prevents race conditions

**Data Model for Quota**:

```sql
households table:
- sticker_quota: integer (default: 2-5 depending on household type)

sticker_requests table:
- Count WHERE household_id = X AND status IN ('pending', 'approved')
```

**Alternatives Considered**:

- Server-side only validation: Rejected due to poor UX (user submits form only to get error)
- Optimistic quota (no validation): Rejected as it violates business requirements
- Separate quota table: Rejected as unnecessary normalization for simple integer limit

**References**:

- TanStack Query patterns for server state
- Supabase RLS documentation for security policies

---

### 3. File Upload Strategy with Supabase Storage

**Decision**: Use Supabase Storage with client-side uploads and structured bucket organization

**Rationale**:

- Supabase Storage is already part of tech stack
- Client-side upload reduces server load
- Built-in support for file size limits and type validation
- Presigned URLs for secure file access
- Automatic CDN distribution

**Storage Structure**:

```
Bucket: sticker-documents (private)
Path: {household_id}/{request_id}/{document_type}_{timestamp}.{ext}

Example:
- households/abc-123/req-456/official_receipt_1697123456.pdf
- households/abc-123/req-456/certificate_registration_1697123456.jpg
- households/abc-123/req-456/vehicle_photo_1697123456.png
```

**Upload Flow**:

1. User selects file in DocumentUploadField component
2. Client validates: file size (≤5MB), format (PDF/JPG/PNG)
3. File preview generated (for images) or filename shown (for PDF)
4. On form submit: upload all files to Supabase Storage first
5. Get storage URLs and create sticker_request records with document_urls
6. If any upload fails, rollback and show error

**File Validation**:

- Browser File API for client-side type and size checking
- Zod schema for form data validation
- Supabase Storage bucket policies for server-side enforcement

**Alternatives Considered**:

- Base64 encoding in database: Rejected due to 5MB file size (inefficient)
- Third-party storage (S3, Cloudinary): Rejected as Supabase Storage sufficient
- Server-side upload proxy: Rejected as client-side upload is more scalable

**References**:

- Supabase Storage docs: https://supabase.com/docs/guides/storage
- Browser File API: https://developer.mozilla.org/en-US/docs/Web/API/File
- Existing file upload patterns in similar Next.js projects

---

### 4. Form Validation Schema Design with Zod

**Decision**: Create comprehensive Zod schemas for vehicle data with custom validators

**Rationale**:

- Zod already used in project (see CLAUDE.md tech stack)
- Type inference provides TypeScript types automatically
- Custom refinements for business rules (year validation, quota checking)
- Error messages customizable per field
- Runtime validation prevents invalid data submission

**Schema Structure**:

```typescript
// Single vehicle schema
const VehicleFormSchema = z.object({
  plateNumber: z.string().min(1, "Required").max(15),
  make: z.string().min(1, "Required").max(50),
  model: z.string().min(1, "Required").max(50),
  color: z.string().min(1, "Required"),
  year: z
    .number()
    .min(1900, "Year too old")
    .max(new Date().getFullYear(), "Future year not allowed"),
  registeredTo: z.string().min(1, "Required"),
  stickerType: z.enum(["resident", "beneficial_user"]),
  officialReceipt: z.instanceof(File),
  certificateRegistration: z.instanceof(File),
  vehiclePhoto: z.instanceof(File).optional(),
});

// Form schema with array and quota validation
const StickerRequestFormSchema = z
  .object({
    vehicles: z
      .array(VehicleFormSchema)
      .min(1, "At least one vehicle required")
      .max(10, "Maximum 10 vehicles per request"),
  })
  .refine((data) => data.vehicles.length <= remainingQuota, {
    message: "Exceeds household sticker quota",
  });
```

**File Validation Pattern**:

```typescript
z.instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, "Max 5MB")
  .refine(
    (file) =>
      ["application/pdf", "image/jpeg", "image/png"].includes(file.type),
    "Only PDF, JPG, PNG allowed",
  );
```

**Alternatives Considered**:

- Yup validation: Rejected as Zod is project standard
- Manual validation functions: Rejected due to lack of type inference
- No validation: Rejected as it violates FR-007 and FR-009

**References**:

- Zod documentation: https://zod.dev
- React Hook Form Zod resolver: @hookform/resolvers package
- Existing schema patterns in lib/schemas/guest.ts

---

### 5. Multi-Vehicle Submission Transaction Strategy

**Decision**: Use Supabase transactions (via RPC) for atomic multi-record creation

**Rationale**:

- Each vehicle creates separate sticker_request record (per FR-010)
- Must ensure all-or-nothing behavior: if one fails, none should be created
- Prevents partial submissions that confuse users and admins
- Maintains data consistency

**Implementation Approach**:

**Option A: Client-side Sequential Creation (CHOSEN)**:

```typescript
// In useCreateStickerRequest hook
const createMultipleRequests = async (vehicles, householdId) => {
  const createdIds = [];

  try {
    for (const vehicle of vehicles) {
      // 1. Upload documents for this vehicle
      const documentUrls = await uploadDocuments(vehicle);

      // 2. Create sticker request record
      const { data, error } = await supabase
        .from("sticker_requests")
        .insert({
          household_id: householdId,
          ...vehicleData,
          document_urls: documentUrls,
        })
        .select()
        .single();

      if (error) throw error;
      createdIds.push(data.id);
    }

    return createdIds;
  } catch (error) {
    // Rollback: delete any created records
    if (createdIds.length > 0) {
      await supabase.from("sticker_requests").delete().in("id", createdIds);
    }
    throw error;
  }
};
```

**Option B: Supabase RPC Function** (Future Enhancement):

- Create database function that accepts array of vehicles
- Handles transaction atomically on server
- More robust but requires database migration

**Current Decision**: Use Option A for MVP, consider Option B if issues arise

**Alternatives Considered**:

- No transaction handling: Rejected due to data consistency risks
- Third-party transaction library: Rejected as over-engineering for this use case

**References**:

- Supabase transactions: https://supabase.com/docs/guides/database/postgres/custom-claims
- Error recovery patterns in async operations

---

### 6. Request ID Generation Strategy

**Decision**: Use Supabase auto-generated UUID as request ID

**Rationale**:

- PostgreSQL uuid_generate_v4() provides unique IDs
- No collision risk across distributed system
- URL-safe for request detail pages (/stickers/[id])
- Prevents ID enumeration attacks (unlike sequential integers)
- Already used in codebase for other entities (guests, households)

**Display Format**:

- Store: Full UUID (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- Display to user: First 8 characters (e.g., `550e8400`)
- Full ID used in URLs and database references

**Alternatives Considered**:

- Sequential integer IDs: Rejected due to security and scalability concerns
- Custom format (e.g., STK-001): Rejected as it requires additional sequence management
- Nanoid: Rejected to maintain consistency with existing UUID usage

**References**:

- PostgreSQL UUID extension documentation
- Existing ID patterns in households, guests tables

---

### 7. State Management Patterns

**Decision**: Use TanStack Query for server state, Zustand for UI state, React Hook Form for form state

**Rationale**:

- Clear separation of concerns between different state types
- TanStack Query: Automatic caching, refetching, optimistic updates for server data
- Zustand: Global UI state (toasts, modals) with minimal boilerplate
- React Hook Form: Optimal form performance with minimal re-renders
- All three already used in project (see package.json and existing features)

**State Categories**:

**Server State (TanStack Query)**:

- Household quota data
- Existing sticker requests count
- Sticker request submission
- Document upload status

**UI State (Zustand - useUIStore)**:

- Toast notifications for success/error
- Loading overlays (if needed)
- Modal states (if confirmation modals added)

**Form State (React Hook Form)**:

- Vehicle array data
- File inputs
- Validation errors
- Form submission status

**No Overlap**: Each state type handled by most appropriate tool

**Alternatives Considered**:

- Redux: Rejected as over-engineered for this application size
- Context API for everything: Rejected due to performance concerns with large forms
- Single state library: Rejected as specialized tools provide better DX

**References**:

- TanStack Query docs: https://tanstack.com/query/latest
- Zustand docs: https://github.com/pmndrs/zustand
- Existing patterns in lib/hooks/useGuests.ts and store/ui.ts

---

### 8. Error Handling and User Feedback

**Decision**: Implement layered error handling with specific user-facing messages

**Rationale**:

- Users need clear, actionable error messages
- Different error types require different handling strategies
- Constitution mandates toast notifications for feedback

**Error Layers**:

**1. Field Validation Errors (React Hook Form + Zod)**:

- Display inline below each field
- Real-time validation on blur or change
- Clear, specific messages (e.g., "Plate number is required", "File too large (max 5MB)")

**2. Form Submission Errors (TanStack Query)**:

- Network errors: "Unable to submit. Check your connection and try again."
- Quota exceeded: "You have reached your sticker quota (X/Y stickers)"
- File upload errors: "Failed to upload [document type]. Please try again."
- Database errors: "Unable to save request. Please contact support if this persists."

**3. Success Feedback (Toast)**:

- Position: Top-right (per constitution)
- Duration: 5 seconds
- Message: "Sticker request submitted! Request IDs: #abc123, #def456"
- Auto-redirect to dashboard after 3 seconds

**Error Recovery**:

- Form data preserved on submission failure (FR-016)
- Automatic retry for transient network errors (TanStack Query built-in)
- Clear "Try Again" action for permanent failures
- Rollback uploaded files if database insertion fails

**Alternatives Considered**:

- Generic error messages: Rejected due to poor UX
- Alert() browser dialogs: Rejected as not accessible and outdated
- No error handling: Rejected as it violates constitution and FR-017

**References**:

- Constitution Section V (Accessibility & UX First) - toast notifications
- Existing toast patterns in store/ui.ts
- WCAG 2.1 guidelines for error identification

---

### 9. Performance Optimization Strategies

**Decision**: Implement progressive enhancement with optimistic UI updates and lazy loading

**Rationale**:

- Success Criteria SC-002: Support up to 5 vehicles without performance degradation
- SC-006: Form validation feedback < 500ms
- Large document files (up to 5MB × 3 per vehicle) require efficient handling

**Optimization Techniques**:

**1. Form Performance**:

- React Hook Form's uncontrolled components (minimal re-renders)
- Validation debouncing (300ms delay on text fields)
- useFieldArray optimized rendering (only changed items re-render)

**2. File Upload Optimization**:

- Client-side image compression for photos > 2MB (before upload)
- Progress indicators for uploads
- Parallel uploads for multiple documents
- Thumbnail generation for image previews

**3. Data Fetching**:

- TanStack Query cache for quota data (5 minute stale time)
- Prefetch quota on dashboard hover (anticipatory loading)
- Optimistic updates for better perceived performance

**4. Code Splitting**:

- Lazy load DocumentUploadField component (only when adding first vehicle)
- Dynamic imports for file processing libraries
- Next.js automatic code splitting for page route

**5. Skeleton Loaders**:

- Show skeleton while quota data loads
- Skeleton for document upload areas during processing
- Per constitution requirement

**Measurement Plan**:

- Use Next.js built-in Web Vitals reporting
- Monitor TanStack Query DevTools during development
- Test with Chrome Lighthouse for performance scores

**Alternatives Considered**:

- No optimization (wait for problems): Rejected as premature but reasonable optimizations improve UX
- Heavy optimization (virtual scrolling, memoization everywhere): Rejected as premature for expected scale

**References**:

- React Hook Form performance docs
- Next.js performance best practices
- TanStack Query caching strategies

---

### 10. Accessibility Implementation

**Decision**: Implement WCAG 2.1 AA compliance from the start using semantic HTML and ARIA attributes

**Rationale**:

- Constitution Section V mandates WCAG 2.1 AA compliance
- Form accessibility is critical for inclusive access
- Dynamic form arrays require special ARIA considerations

**Accessibility Features**:

**1. Semantic HTML**:

- `<form>` element with proper attributes
- `<fieldset>` and `<legend>` for vehicle sections
- `<label>` elements for all form inputs (for="id" association)
- `<button>` elements for actions (not divs)

**2. ARIA Attributes**:

```typescript
// Vehicle section
<fieldset aria-labelledby="vehicle-1-heading">
  <legend id="vehicle-1-heading">Vehicle 1</legend>
  ...
</fieldset>

// File upload
<input
  type="file"
  aria-describedby="or-requirements"
  aria-invalid={!!error}
  aria-errormessage={error ? "or-error" : undefined}
/>
<span id="or-requirements">PDF, JPG, PNG. Max 5MB.</span>
{error && <span id="or-error" role="alert">{error}</span>}

// Add vehicle button
<button
  type="button"
  aria-label="Add another vehicle to the request"
  onClick={handleAddVehicle}
>
  Add Another Vehicle
</button>

// Remove vehicle button
<button
  type="button"
  aria-label={`Remove vehicle ${index + 1} from request`}
  onClick={() => handleRemove(index)}
>
  <TrashIcon aria-hidden="true" />
  Remove
</button>
```

**3. Keyboard Navigation**:

- All interactive elements keyboard accessible (tab order)
- Focus management when adding/removing vehicles
- Enter to submit, Escape to cancel
- Focus trap in any modal dialogs

**4. Screen Reader Support**:

- Announce errors with `role="alert"`
- Live regions for dynamic content (quota updates, vehicle additions)
- Descriptive button labels (not just icons)

**5. Visual Accessibility**:

- Sufficient color contrast (4.5:1 for text, 3:1 for UI components)
- Focus indicators visible and clear
- Error states not communicated by color alone (icons + text)
- Touch targets min 44×44 pixels (mobile)

**6. Form Validation Announcements**:

```typescript
<div role="alert" aria-live="polite" aria-atomic="true">
  {validationErrors.length} errors found. Please review the form.
</div>
```

**Testing Plan**:

- Manual testing with keyboard only
- Screen reader testing (NVDA/JAWS on Windows, VoiceOver on Mac/iOS)
- Automated testing with axe-core via @axe-core/react
- Chrome DevTools Lighthouse accessibility audit

**Alternatives Considered**:

- Add accessibility later: Rejected as retrofitting is more expensive and often incomplete
- Rely on browser defaults: Rejected as insufficient for complex dynamic forms

**References**:

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- React Hook Form accessibility examples
- Existing accessible patterns in components/ui/

---

## Summary of Key Decisions

| Topic            | Decision                         | Primary Reason                         |
| ---------------- | -------------------------------- | -------------------------------------- |
| Dynamic Vehicles | React Hook Form useFieldArray    | Native support, type-safe, performance |
| Quota Validation | Client + server two-layer        | Real-time UX + security                |
| File Storage     | Supabase Storage (client upload) | Already in stack, scalable             |
| Validation       | Zod schemas with refinements     | Type inference, custom rules           |
| Transactions     | Client-side with rollback        | Sufficient for MVP, simple             |
| Request IDs      | Supabase UUID                    | Security, consistency                  |
| State Management | TanStack Query + Zustand + RHF   | Separation of concerns                 |
| Error Handling   | Layered with specific messages   | Clear user guidance                    |
| Performance      | Progressive enhancement          | Meets SC goals                         |
| Accessibility    | WCAG 2.1 AA from start           | Constitution mandate                   |

## Open Questions

None. All technical decisions finalized for implementation phase.

## Next Steps

Proceed to Phase 1: Generate data-model.md and API contracts based on these research findings.
