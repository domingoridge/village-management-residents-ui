# Data Model: Vehicle Sticker Request List

**Feature**: Vehicle Sticker Request List Page
**Date**: 2025-10-20
**Status**: Design Complete

## Overview

This document defines the data structures used in the vehicle sticker request list feature. All types follow TypeScript conventions with camelCase naming. Data from the database (snake_case) is transformed at the API boundary to maintain consistency with frontend patterns.

## Core Entities

### 1. StickerRequest

Represents a vehicle sticker application submitted by a household resident.

```typescript
export interface StickerRequest {
  // Identity
  id: string; // UUID primary key
  householdId: string; // Foreign key to household table
  residentId: string; // Foreign key to resident who owns the sticker
  tenantId: string; // Foreign key to tenant (subdivision)

  // Vehicle Information
  vehiclePlateNumber: string; // Vehicle plate number (primary identifier)
  vehicleMake: string; // Vehicle manufacturer (e.g., "Toyota")
  vehicleModel: string; // Vehicle model (e.g., "Corolla")
  vehicleColor: string | null; // Vehicle color (optional)
  vehicleYear: number | null; // Manufacturing year (optional)
  registeredTo: string | null; // Name of registered owner (optional)

  // Sticker Details
  stickerType: StickerType; // "resident" | "beneficial_user"
  status: StickerRequestStatus; // Request lifecycle status

  // Timestamps
  submittedAt: string; // ISO 8601 datetime when request was created
  reviewedAt: string | null; // ISO 8601 datetime when admin reviewed (if reviewed)
  createdAt: string; // ISO 8601 datetime of record creation
  updatedAt: string; // ISO 8601 datetime of last update
}
```

**Database Mapping** (snake_case → camelCase):

- `household_id` → `householdId`
- `resident_id` → `residentId`
- `tenant_id` → `tenantId`
- `vehicle_plate_number` → `vehiclePlateNumber`
- `vehicle_make` → `vehicleMake`
- `vehicle_model` → `vehicleModel`
- `vehicle_color` → `vehicleColor`
- `vehicle_year` → `vehicleYear`
- `registered_to` → `registeredTo`
- `sticker_type` → `stickerType`
- `submitted_at` → `submittedAt`
- `reviewed_at` → `reviewedAt`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

**Notes**:

- All optional fields use `| null` (not `| undefined`) to match database nullable columns
- Dates stored as ISO 8601 strings (e.g., "2025-10-20T14:30:00Z")
- This type is already defined in `/types/sticker.ts`

### 2. StickerType

Enumeration of sticker types for access classification.

```typescript
export type StickerType = "resident" | "beneficial_user";
```

**Values**:

- `"resident"`: Sticker for a household resident's vehicle
- `"beneficial_user"`: Sticker for authorized non-resident (e.g., helper, relative with access rights)

**Notes**:

- This type is already defined in `/types/sticker.ts`
- No changes needed

### 3. StickerRequestStatus

Enumeration of request lifecycle states.

```typescript
export type StickerRequestStatus =
  | "pending" // Awaiting admin review
  | "approved" // Admin approved, sticker will be issued
  | "rejected" // Admin rejected the request
  | "cancelled"; // User cancelled before admin review
```

**State Transitions**:

```
pending → approved   (admin approves)
pending → rejected   (admin rejects)
pending → cancelled  (user cancels)
```

**Terminal States**: `approved`, `rejected`, `cancelled` (no further transitions)

**Notes**:

- This type is already defined in `/types/sticker.ts`
- No changes needed

## Query Parameters & Filters

### 4. StickerFilterParams

Parameters for filtering and paginating sticker request lists.

```typescript
export interface StickerFilterParams {
  // Filtering
  status?: StickerRequestStatus; // Filter by request status
  householdId?: string; // Filter by household (usually from auth context)

  // Pagination
  page?: number; // Current page number (1-indexed, default: 1)
  pageSize?: number; // Items per page (default: 10)
}
```

**Usage**:

```typescript
const filters: StickerFilterParams = {
  status: "pending",
  householdId: currentUser.householdId,
  page: 2,
  pageSize: 10,
};
```

**Defaults**:

- `page`: 1
- `pageSize`: 10
- `status`: undefined (show all)
- `householdId`: Usually set from authenticated user's context

**Notes**:

- New interface - must be added to `/types/sticker.ts`
- Matches `GuestFilterParams` pattern from guests feature

### 5. StickerListResponse

Response structure for paginated sticker request lists.

```typescript
export interface StickerListResponse {
  requests: StickerRequest[]; // Array of sticker requests for current page
  count: number; // Total count of requests matching filters
  page: number; // Current page number
  pageSize: number; // Items per page
  totalPages: number; // Total pages available
}
```

**Example**:

```json
{
  "requests": [
    /* array of 10 StickerRequest objects */
  ],
  "count": 25,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3
}
```

**Calculation**:

```typescript
totalPages = Math.ceil(count / pageSize);
```

**Notes**:

- New interface - must be added to `/types/sticker.ts`
- Matches `fetchGuests()` return structure

## UI-Specific Data Structures

### 6. StatusBadgeConfig

Configuration for rendering status badges (component-specific, not exported).

```typescript
type StatusBadgeConfig = {
  label: string; // Display text
  colorClass: string; // DaisyUI badge class
};

const statusConfig: Record<StickerRequestStatus, StatusBadgeConfig> = {
  pending: {
    label: "Pending",
    colorClass: "badge-warning",
  },
  approved: {
    label: "Approved",
    colorClass: "badge-success",
  },
  rejected: {
    label: "Rejected",
    colorClass: "badge-error",
  },
  cancelled: {
    label: "Cancelled",
    colorClass: "badge-ghost",
  },
};
```

**Location**: Internal to `StickerStatusBadge.tsx` component
**Purpose**: Maps request status to visual presentation
**DaisyUI Classes Used**:

- `badge-warning`: Yellow/orange (pending review)
- `badge-success`: Green (approved)
- `badge-error`: Red (rejected)
- `badge-ghost`: Gray (cancelled)

## Data Transformation Layer

### snake_case → camelCase Mapping

All data from Supabase (snake_case) is transformed to camelCase at the API boundary.

**Example Transformation**:

```typescript
// From database (snake_case)
const dbRow = {
  id: "123",
  household_id: "h-456",
  vehicle_plate_number: "ABC1234",
  vehicle_make: "Toyota",
  vehicle_model: "Corolla",
  sticker_type: "resident",
  status: "pending",
  submitted_at: "2025-10-20T10:00:00Z",
  reviewed_at: null,
  created_at: "2025-10-20T10:00:00Z",
  updated_at: "2025-10-20T10:00:00Z",
};

// To frontend (camelCase)
const stickerRequest: StickerRequest = {
  id: dbRow.id,
  householdId: dbRow.household_id,
  vehiclePlateNumber: dbRow.vehicle_plate_number,
  vehicleMake: dbRow.vehicle_make,
  vehicleModel: dbRow.vehicle_model,
  stickerType: dbRow.sticker_type,
  status: dbRow.status,
  submittedAt: dbRow.submitted_at,
  reviewedAt: dbRow.reviewed_at,
  createdAt: dbRow.created_at,
  updatedAt: dbRow.updated_at,
};
```

**Transformation Location**: `/lib/api/stickers.ts` (new file)

**Rationale**:

- Follows constitution principle IV (Naming & Code Organization)
- Maintains consistency with guest list implementation
- Prevents snake_case from leaking into React components

## Query Keys (TanStack Query)

### Structured Query Key Factory

```typescript
export const stickerKeys = {
  all: ["stickers"] as const,
  lists: () => [...stickerKeys.all, "list"] as const,
  list: (filters?: StickerFilterParams) =>
    [...stickerKeys.lists(), filters] as const,
  details: () => [...stickerKeys.all, "detail"] as const,
  detail: (id: string) => [...stickerKeys.details(), id] as const,
};
```

**Example Keys**:

- All stickers: `["stickers"]`
- Lists: `["stickers", "list"]`
- Filtered list: `["stickers", "list", { status: "pending", page: 1 }]`
- Detail: `["stickers", "detail", "sticker-id-123"]`

**Benefits**:

- Type-safe query key generation
- Precise cache invalidation
- Prevents stale data issues
- Enables efficient refetching strategies

**Location**: `/lib/hooks/useStickers.ts` (add to existing file)

## Validation Rules

### StickerRequest Validation

**Required Fields** (non-null):

- `id`, `householdId`, `residentId`, `tenantId`
- `vehiclePlateNumber`, `vehicleMake`, `vehicleModel`
- `stickerType`, `status`
- `submittedAt`, `createdAt`, `updatedAt`

**Optional Fields** (nullable):

- `vehicleColor`, `vehicleYear`, `registeredTo`
- `reviewedAt` (only set when admin reviews)

**String Length Constraints** (database level):

- `vehiclePlateNumber`: 2-15 characters (typical plate format)
- `vehicleMake`, `vehicleModel`: 1-100 characters
- `vehicleColor`: 1-50 characters

**Number Constraints**:

- `vehicleYear`: 1900-2100 (reasonable vehicle year range)

**Enum Validation**:

- `stickerType`: Must be one of `StickerType` values
- `status`: Must be one of `StickerRequestStatus` values

**Notes**:

- Frontend validation is defensive only (backend enforces constraints)
- This feature is read-only from frontend perspective (list/view only)
- No form validation needed for this feature

## Database Schema Reference

**Table**: `vehicle_sticker`

**Key Columns**:

- `id` (UUID, primary key)
- `household_id` (UUID, foreign key to households)
- `resident_id` (UUID, foreign key to residents)
- `tenant_id` (UUID, foreign key to tenants)
- `vehicle_plate_number` (VARCHAR)
- `sticker_type` (ENUM or VARCHAR)
- `status` (ENUM or VARCHAR)
- `submitted_at` (TIMESTAMP)
- `reviewed_at` (TIMESTAMP, nullable)

**Indexes**:

- Primary: `id`
- Foreign keys: `household_id`, `resident_id`, `tenant_id`
- Filtering: `status` (for efficient status filter queries)
- Composite: `(household_id, status)` for optimal query performance

**Notes**:

- Schema already exists in Supabase
- No migrations needed for this feature
- This is a read-only feature from frontend perspective

## Real-time Subscription Model

**Table Subscribed**: `vehicle_sticker`

**Events Monitored**:

- `INSERT`: New sticker request created
- `UPDATE`: Status or field changes
- `DELETE`: Request cancelled/removed

**Invalidation Strategy**:

```typescript
useRealtime({
  table: "vehicle_sticker",
  onInsert: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
  onUpdate: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
  onDelete: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
});
```

**Rationale**:

- Invalidating root key `["stickers"]` refetches all related queries
- Ensures list and detail views stay synchronized
- Handles concurrent household member actions
- Reflects admin approvals/rejections in real-time

## Summary

This data model defines:

1. **Core Entities**: `StickerRequest`, `StickerType`, `StickerRequestStatus` (already exist)
2. **New Types**: `StickerFilterParams`, `StickerListResponse` (must add to `/types/sticker.ts`)
3. **Query Keys**: Structured factory for TanStack Query (add to `/lib/hooks/useStickers.ts`)
4. **UI Config**: `StatusBadgeConfig` (internal to component)
5. **Transformations**: snake_case → camelCase at API boundary (new `/lib/api/stickers.ts`)

**Next Step**: Define API contracts in `contracts/stickers-api.md`
