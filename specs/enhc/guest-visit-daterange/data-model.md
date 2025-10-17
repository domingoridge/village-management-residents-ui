# Data Model: Guest Visit Date Range

**Feature**: Guest Visit Date Range Picker
**Date**: 2025-10-17
**Status**: Design Phase

## Overview

This document defines the data model changes required to support date range selection for guest pre-authorizations. The model extends the existing Guest entity with visit start/end dates and auto-calculated duration while maintaining backward compatibility.

## Entity Changes

### Guest (Enhanced)

**Description**: Represents a pre-authorized guest entry to the village. Enhanced to support multi-day visit durations.

**Storage**: Supabase PostgreSQL table `guests`

#### Schema Changes

| Field                   | Type    | Required | Default          | Constraints                                     | Notes                                                             |
| ----------------------- | ------- | -------- | ---------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| `visit_start_date`      | DATE    | Yes      | -                | NOT NULL, >= CURRENT_DATE, <= CURRENT_DATE + 30 | **[MODIFIED]** Renamed from `expected_arrival_date`               |
| `visit_end_date`        | DATE    | Yes      | visit_start_date | NOT NULL, >= visit_start_date                   | **[NEW]** Last day of authorized visit                            |
| `visit_duration`        | INTEGER | No       | -                | CHECK (visit_duration > 0)                      | **[NEW]** Auto-calculated: days between start and end (inclusive) |
| `expected_arrival_time` | TIME    | No       | -                | -                                               | **[UNCHANGED]** Optional arrival time                             |

#### Existing Fields (Unchanged)

| Field                  | Type         | Required | Notes                                         |
| ---------------------- | ------------ | -------- | --------------------------------------------- |
| `id`                   | UUID         | Yes      | Primary key                                   |
| `household_id`         | UUID         | Yes      | Foreign key to households table               |
| `guest_name`           | VARCHAR(100) | Yes      | Full name of guest                            |
| `phone`                | VARCHAR(20)  | No       | Contact number                                |
| `vehicle_plate`        | VARCHAR(20)  | No       | Vehicle registration                          |
| `purpose`              | VARCHAR(200) | Yes      | Purpose of visit                              |
| `special_instructions` | TEXT         | No       | Additional notes for guards                   |
| `status`               | ENUM         | Yes      | pending, approved, at_gate, denied, completed |
| `created_at`           | TIMESTAMP    | Yes      | Auto-generated                                |
| `updated_at`           | TIMESTAMP    | Yes      | Auto-updated                                  |

### Migration Strategy

**Database Migration**:

```sql
-- Add new columns
ALTER TABLE guests
  ADD COLUMN visit_end_date DATE,
  ADD COLUMN visit_duration INTEGER;

-- Rename expected_arrival_date to visit_start_date
ALTER TABLE guests
  RENAME COLUMN expected_arrival_date TO visit_start_date;

-- Set defaults for existing records
UPDATE guests
  SET visit_end_date = visit_start_date,
      visit_duration = 1
  WHERE visit_end_date IS NULL;

-- Add constraints
ALTER TABLE guests
  ALTER COLUMN visit_end_date SET NOT NULL,
  ADD CONSTRAINT visit_end_after_start CHECK (visit_end_date >= visit_start_date),
  ADD CONSTRAINT visit_start_future CHECK (visit_start_date >= CURRENT_DATE),
  ADD CONSTRAINT visit_start_max_advance CHECK (visit_start_date <= CURRENT_DATE + INTERVAL '30 days'),
  ADD CONSTRAINT visit_duration_positive CHECK (visit_duration > 0 OR visit_duration IS NULL);

-- Create trigger for auto-calculating duration
CREATE OR REPLACE FUNCTION calculate_visit_duration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.visit_duration := (NEW.visit_end_date - NEW.visit_start_date) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_visit_duration
  BEFORE INSERT OR UPDATE OF visit_start_date, visit_end_date ON guests
  FOR EACH ROW
  EXECUTE FUNCTION calculate_visit_duration();
```

## TypeScript Type Definitions

### Frontend Types (camelCase)

```typescript
// types/guest.ts

/**
 * Guest entity as used in the frontend application
 * All fields use camelCase per project naming conventions
 */
export interface Guest {
  id: string;
  householdId: string;
  guestName: string;
  phone?: string;
  vehiclePlate?: string;
  purpose: string;
  visitDateStart: string; // ISO 8601 date string (YYYY-MM-DD)
  visitDateEnd: string; // ISO 8601 date string (YYYY-MM-DD)
  visitDuration?: number; // Auto-calculated, may be undefined before save
  expectedArrivalTime?: string; // HH:mm format
  specialInstructions?: string;
  status: GuestStatus;
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}

/**
 * Input type for creating a new guest
 * Omits auto-generated fields
 */
export interface CreateGuestInput {
  guestName: string;
  phone?: string;
  vehiclePlate?: string;
  purpose: string;
  visitDateStart: string; // ISO 8601 date string
  visitDateEnd: string; // ISO 8601 date string
  visitDuration?: number; // Optional, will be auto-calculated
  expectedArrivalTime?: string;
  specialInstructions?: string;
}

/**
 * Input type for updating an existing guest
 * All fields optional except those that identify the guest
 */
export interface UpdateGuestInput {
  guestName?: string;
  phone?: string;
  vehiclePlate?: string;
  purpose?: string;
  visitDateStart?: string;
  visitDateEnd?: string;
  visitDuration?: number;
  expectedArrivalTime?: string;
  specialInstructions?: string;
}

/**
 * Guest status enumeration
 */
export enum GuestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  AT_GATE = "at_gate",
  DENIED = "denied",
  COMPLETED = "completed",
}

/**
 * Date range type for the calendar component
 */
export type DateRange = [Date | null, Date | null];

/**
 * Formatted date range for display
 */
export interface FormattedDateRange {
  startDate: string; // Human-readable: "Dec 20, 2025"
  endDate: string; // Human-readable: "Dec 27, 2025"
  duration: number; // Number of days
  rangeText: string; // Combined: "Dec 20-27, 2025" or "Dec 20, 2025" for single day
}
```

### Backend API Types (snake_case)

```typescript
// types/api.ts

/**
 * Guest entity as received from Supabase API
 * All fields use snake_case per database conventions
 */
export interface GuestAPIResponse {
  id: string;
  household_id: string;
  guest_name: string;
  phone?: string;
  vehicle_plate?: string;
  purpose: string;
  visit_start_date: string; // DATE type from PostgreSQL
  visit_end_date: string; // DATE type from PostgreSQL
  visit_duration?: number; // INTEGER type from PostgreSQL
  expected_arrival_time?: string;
  special_instructions?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Payload for creating a guest via API
 */
export interface CreateGuestAPIPayload {
  household_id: string;
  guest_name: string;
  phone?: string;
  vehicle_plate?: string;
  purpose: string;
  visit_start_date: string;
  visit_end_date: string;
  visit_duration?: number;
  expected_arrival_time?: string;
  special_instructions?: string;
}
```

## Validation Rules

### Zod Schema (Frontend)

```typescript
// lib/schemas/guest.ts

import { z } from "zod";
import {
  isValidPhoneNumber,
  isValidPlateNumber,
  isNotPastDate,
  isWithin30Days,
} from "@/lib/utils/validation";

export const createGuestSchema = z
  .object({
    guestName: z
      .string()
      .min(1, "Guest name is required")
      .max(100, "Guest name must be less than 100 characters"),

    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || isValidPhoneNumber(val),
        "Invalid phone number format (use 09XX-XXX-XXXX or +639XXXXXXXXX)",
      ),

    vehiclePlate: z
      .string()
      .optional()
      .transform((val) => val?.toUpperCase())
      .refine(
        (val) => !val || isValidPlateNumber(val),
        "Invalid plate number format",
      ),

    purpose: z
      .string()
      .min(1, "Purpose is required")
      .max(200, "Purpose must be less than 200 characters"),

    // NEW: Visit start date validation
    visitDateStart: z
      .string()
      .min(1, "Visit start date is required")
      .refine(isNotPastDate, "Start date cannot be in the past")
      .refine(
        isWithin30Days,
        "Cannot pre-authorize more than 30 days in advance",
      ),

    // NEW: Visit end date validation
    visitDateEnd: z.string().min(1, "Visit end date is required"),

    // NEW: Auto-calculated, optional on input
    visitDuration: z.number().int().positive().optional(),

    expectedArrivalTime: z.string().optional(),

    specialInstructions: z
      .string()
      .max(500, "Special instructions must be less than 500 characters")
      .optional(),
  })
  .refine(
    (data) => {
      // End date must be >= start date
      const start = new Date(data.visitDateStart);
      const end = new Date(data.visitDateEnd);
      return end >= start;
    },
    {
      message: "Visit end date must be on or after start date",
      path: ["visitDateEnd"],
    },
  );
```

### Validation Utilities

```typescript
// lib/utils/validation.ts (NEW FUNCTIONS)

/**
 * Checks if a date is within 30 days from today
 */
export function isWithin30Days(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  return inputDate <= maxDate;
}

/**
 * Validates that end date is on or after start date
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
}
```

## Data Transformation

### API Mapping Functions

```typescript
// lib/api/guests.ts

/**
 * Transform frontend Guest object to API payload
 * Converts camelCase to snake_case
 */
export function mapGuestToAPI(
  guest: CreateGuestInput,
  householdId: string,
): CreateGuestAPIPayload {
  return {
    household_id: householdId,
    guest_name: guest.guestName,
    phone: guest.phone,
    vehicle_plate: guest.vehiclePlate,
    purpose: guest.purpose,
    visit_start_date: guest.visitDateStart, // [MODIFIED] Renamed mapping
    visit_end_date: guest.visitDateEnd, // [NEW] Added field
    visit_duration: guest.visitDuration, // [NEW] Added field
    expected_arrival_time: guest.expectedArrivalTime,
    special_instructions: guest.specialInstructions,
  };
}

/**
 * Transform API response to frontend Guest object
 * Converts snake_case to camelCase
 */
export function mapAPIToGuest(apiGuest: GuestAPIResponse): Guest {
  return {
    id: apiGuest.id,
    householdId: apiGuest.household_id,
    guestName: apiGuest.guest_name,
    phone: apiGuest.phone,
    vehiclePlate: apiGuest.vehicle_plate,
    purpose: apiGuest.purpose,
    visitDateStart: apiGuest.visit_start_date, // [MODIFIED] Renamed mapping
    visitDateEnd: apiGuest.visit_end_date, // [NEW] Added field
    visitDuration: apiGuest.visit_duration, // [NEW] Added field
    expectedArrivalTime: apiGuest.expected_arrival_time,
    specialInstructions: apiGuest.special_instructions,
    status: apiGuest.status as GuestStatus,
    createdAt: apiGuest.created_at,
    updatedAt: apiGuest.updated_at,
  };
}
```

## Relationships

### Guest ↔ Household

**Type**: Many-to-One (Guest belongs to Household)
**Foreign Key**: `guest.household_id` → `household.id`
**Cascade**: ON DELETE CASCADE (if household deleted, guests deleted)

### Existing Relationships (Unchanged)

- Guest → Resident (created_by relationship, if tracked)
- Guest → Guard (approved_by, checked_in_by relationships, if tracked)

## Indexes

### Recommended Database Indexes

```sql
-- Existing indexes (assumed)
CREATE INDEX idx_guests_household_id ON guests(household_id);
CREATE INDEX idx_guests_status ON guests(status);

-- NEW: Performance indexes for date range queries
CREATE INDEX idx_guests_visit_start_date ON guests(visit_start_date);
CREATE INDEX idx_guests_visit_end_date ON guests(visit_end_date);

-- NEW: Composite index for active visit lookups
CREATE INDEX idx_guests_active_visits ON guests(visit_start_date, visit_end_date, status)
  WHERE status IN ('approved', 'at_gate');
```

## Business Rules

### Date Range Rules

1. **Start Date**:
   - Cannot be in the past
   - Cannot be more than 30 days in the future
   - Required field

2. **End Date**:
   - Must be on or after start date
   - Defaults to start date if not specified (single-day visit)
   - Required field

3. **Duration**:
   - Auto-calculated: `(end_date - start_date) + 1`
   - Includes both start and end days
   - Stored in database for query performance
   - Frontend calculates before submission, backend validates

### State Transitions

Guest status flow (unchanged, but duration affects "completed" transition):

```
pending → approved → at_gate → completed
   ↓          ↓
 denied    denied
```

**Duration Impact**: A guest authorization is considered "expired" when `CURRENT_DATE > visit_end_date`. Expired authorizations should automatically transition to `completed` status via scheduled job (out of scope for this feature).

## Example Data

### Single-Day Visit

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "householdId": "987fcdeb-51a2-43d1-b9c8-142516273000",
  "guestName": "Juan Dela Cruz",
  "phone": "0917-123-4567",
  "vehiclePlate": "ABC-1234",
  "purpose": "House visit",
  "visitDateStart": "2025-10-20",
  "visitDateEnd": "2025-10-20",
  "visitDuration": 1,
  "expectedArrivalTime": "14:00",
  "specialInstructions": null,
  "status": "approved",
  "createdAt": "2025-10-17T10:30:00Z",
  "updatedAt": "2025-10-17T10:30:00Z"
}
```

### Multi-Day Visit

```json
{
  "id": "223e4567-e89b-12d3-a456-426614174001",
  "householdId": "987fcdeb-51a2-43d1-b9c8-142516273000",
  "guestName": "Maria Santos",
  "phone": "0918-987-6543",
  "vehiclePlate": null,
  "purpose": "Family visit for holidays",
  "visitDateStart": "2025-12-20",
  "visitDateEnd": "2025-12-27",
  "visitDuration": 8,
  "expectedArrivalTime": null,
  "specialInstructions": "Relatives from province, multiple entries expected",
  "status": "pending",
  "createdAt": "2025-10-17T11:15:00Z",
  "updatedAt": "2025-10-17T11:15:00Z"
}
```

## Backward Compatibility

### Deprecated Field Handling

**Frontend**: The field `expectedArrivalDate` is removed. All code must migrate to `visitDateStart`.

**Backend**: If the backend still expects `expected_arrival_date`, the API mapping function can provide it:

```typescript
// Backward compatibility mapping (if needed)
export function mapGuestToAPILegacy(
  guest: CreateGuestInput,
  householdId: string,
) {
  return {
    ...mapGuestToAPI(guest, householdId),
    expected_arrival_date: guest.visitDateStart, // Alias for legacy systems
  };
}
```

### Migration Timeline

1. **Phase 1** (This feature): Frontend uses new fields
2. **Phase 2** (Coordinate with backend): Database migration executed
3. **Phase 3** (After migration): Remove legacy compatibility layer

---

**Data Model Complete**: All entities, types, validations, and transformations defined. Ready for contract generation.
