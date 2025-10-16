# Data Model

**Feature**: Village Management Resident Web Application
**Date**: 2025-10-16
**Status**: Complete
**Source**: Supabase database schema (docs/supabase/database.types.ts)

## Overview

This document defines the data entities for the Village Management Resident Web Application based on the existing Supabase database schema. All entities are already defined in the database with TypeScript type definitions auto-generated.

## Core Entities (From Existing Schema)

### 1. user_profile

Represents user identity with basic profile information.

**Fields** (from database.types.ts):

- `id`: UUID (primary key)
- `auth_user_id`: string (links to Supabase auth.users)
- `first_name`: string
- `last_name`: string
- `avatar_url`: string | null
- `preferences`: Json
- `created_at`: string (timestamp)
- `updated_at`: string (timestamp)

**Derived Full Name**: Concatenate first_name + last_name for display

---

### 2. tenant_user

Represents a user's association with a tenant (village) including role and permissions.

**Fields**:

- `id`: UUID (primary key)
- `user_profile_id`: UUID (foreign key → user_profile.id)
- `tenant_id`: UUID (foreign key → tenant.id)
- `role_id`: UUID (foreign key → role.id)
- `permissions`: Json
- `is_active`: boolean
- `joined_at`: string (timestamp)
- `created_at`: string (timestamp)
- `updated_at`: string (timestamp)

**Key Functions** (from schema):

- `get_current_tenant_id()`: Get active tenant for current user
- `get_current_role_id()`: Get active role
- `get_current_user_permissions()`: Get permissions JSON
- `check_user_permission(p_permission_key)`: Check specific permission

---

### 3. resident

Represents a household resident with visiting and signatory rights.

**Fields**:

- `id`: UUID (primary key)
- `tenant_user_id`: UUID (foreign key → tenant_user.id)
- `household_id`: UUID (foreign key → household.id)
- `is_primary_contact`: boolean
- `has_signatory_rights`: boolean (can sign permits, approvals)
- `has_visiting_rights`: boolean (can pre-register guests)
- `id_type`: string | null
- `id_url`: string | null (uploaded ID document)
- `created_at`: string (timestamp)
- `updated_at`: string (timestamp)

**Permission Model**:

- `has_signatory_rights: true` → Can request stickers, permits, payments (household-head/household-member equivalent)
- `has_visiting_rights: true` → Can pre-register guests
- Both false → beneficial-user equivalent (view-only)

---

### 4. household

Represents a residential unit.

**Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `address`: string (full address)
- `block`: string | null
- `lot`: string | null
- `street_number`: string | null
- `house_number`: string | null
- `alias`: string | null (friendly name)
- `sticker_quota`: number (default 3)
- `status`: 'active' | 'inactive' | 'suspended'
- `metadata`: Json (flexible additional data)
- `created_at`: string (timestamp)
- `updated_at`: string (timestamp)

**Status Enum**: `household_status` = 'active' | 'inactive' | 'suspended'

---

### 5. vehicle_sticker

Represents a vehicle pass with RFID tracking.

**Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `household_id`: UUID | null (foreign key → household.id)
- `issued_to`: UUID (foreign key → tenant_user.id)
- `sticker_type`: 'beneficial_user' | 'resident'
- `rfid_code`: string (RFID tag identifier)
- `vehicle_plate_number`: string
- `vehicle_make`: string | null
- `vehicle_model`: string | null
- `vehicle_color`: string | null
- `vehicle_year`: string | null
- `vehicle_registered_to`: string | null
- `holder_name`: string
- `issue_date`: string (timestamp)
- `expiry_date`: string (timestamp)
- `status`: 'active' | 'expired' | 'revoked' | 'pending_renewal'
- `created_at`: string (timestamp)
- `updated_at`: string (timestamp)

**Status Enum**: `sticker_status` = 'active' | 'expired' | 'revoked' | 'pending_renewal'
**Type Enum**: `sticker_type` = 'beneficial_user' | 'resident'

**Related**: vehicle_sticker_document (OR/CR documents)

---

### 6. vehicle_sticker_document

Stores uploaded vehicle documents (OR, CR, insurance, etc.).

**Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `vehicle_sticker_id`: UUID (foreign key → vehicle_sticker.id)
- `document_type`: 'or' | 'cr' | 'insurance' | 'drivers_license' | 'deed_of_sale' | 'other'
- `file_name`: string
- `mime_type`: string
- `storage_url`: string (Supabase Storage URL)
- `expiry_date`: string | null (timestamp)
- `created_at`: string (timestamp)
- `updated_at`: string (timestamp)

**Document Type Enum**: `vehicle_document_type` = 'or' | 'cr' | 'insurance' | 'drivers_license' | 'deed_of_sale' | 'other'

---

### 7. permit

Represents construction/renovation permits.

**Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `household_id`: UUID (foreign key → household.id)
- `requested_by`: UUID (foreign key → tenant_user.id)
- `permit_number`: string (unique identifier)
- `permit_type`: 'construction' | 'renovation' | 'maintenance' | 'miscellaneous'
- `project_description`: string
- `start_date`: string (timestamp)
- `end_date`: string (timestamp)
- `status`: 'draft' | 'submitted' | 'pending_payment' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled'
- `fee_amount`: number (road fee)
- `fee_paid`: boolean
- `fee_paid_at`: string | null (timestamp)
- `fee_receipt_url`: string | null
- `approved_by`: UUID | null (foreign key → tenant_user.id)
- `approved_at`: string | null (timestamp)
- `rejection_reason`: string | null
- `documents`: Json | null (array of file references)
- `distributed_to_guardhouse_at`: string | null (timestamp)
- `created_at`: string (timestamp)
- `updated_at`: string (timestamp)

**Permit Type Enum**: `permit_type` = 'construction' | 'renovation' | 'maintenance' | 'miscellaneous'
**Status Enum**: `permit_status` = 'draft' | 'submitted' | 'pending_payment' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled'

**Related**: permit_payment (fee payments)

---

### 8. permit_payment

Tracks permit fee payments.

**Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `permit_id`: UUID (foreign key → permit.id)
- `amount`: number
- `payment_method`: 'cash' | 'bank_transfer' | 'gcash' | 'paymaya' | 'card'
- `payment_date`: string (timestamp)
- `receipt_number`: string
- `receipt_url`: string | null
- `collected_by`: UUID (foreign key → tenant_user.id)
- `payment_metadata`: Json | null
- `created_at`: string (timestamp)

**Payment Method Enum**: `payment_method` = 'cash' | 'bank_transfer' | 'gcash' | 'paymaya' | 'card'

---

### 9. gate_entry_log

Tracks all entry/exit events at village gates.

**Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `entry_type`: 'vehicle_rfid' | 'guest' | 'delivery' | 'permit_holder' | 'visitor'
- `verification_method`: 'rfid_auto' | 'manual' | 'guest_list' | 'phone_call' | 'qr_code'
- `outcome`: 'allowed' | 'denied'
- `gate`: string (gate location)
- `entry_time`: string (timestamp)
- `exit_time`: string | null (timestamp)
- `vehicle_sticker_id`: UUID | null (foreign key → vehicle_sticker.id)
- `guest_id`: UUID | null (if guest entry)
- `delivery_id`: UUID | null (if delivery)
- `permit_id`: UUID | null (foreign key → permit.id if construction)
- `visitor_name`: string | null
- `plate_number`: string | null
- `purpose`: string | null
- `verified_by`: UUID | null (foreign key → tenant_user.id - guard)
- `metadata`: Json | null
- `created_at`: string (timestamp)

**Entry Type Enum**: `entry_type` = 'vehicle_rfid' | 'guest' | 'delivery' | 'permit_holder' | 'visitor'
**Verification Method Enum**: `verification_method` = 'rfid_auto' | 'manual' | 'guest_list' | 'phone_call' | 'qr_code'
**Outcome Enum**: `entry_outcome` = 'allowed' | 'denied'

---

### 10. residential_community_config

Stores village-wide configuration and rules.

**Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id, one-to-one)
- `curfew_settings`: Json
- `gate_operating_hours`: Json
- `visitor_policies`: Json
- `rules_and_guidelines`: Json
- `emergency_contacts`: Json
- `maintenance_schedule`: Json
- `notification_preferences`: Json
- `updated_by`: UUID | null (foreign key → tenant_user.id)
- `created_at`: string (timestamp)
- `updated_at`: string (timestamp)

**JSON Structure Examples**:

```typescript
// rules_and_guidelines
{
  rules: [
    {
      id: string,
      category: 'Curfew' | 'Speed Limit' | 'Parking' | 'Noise' | 'Construction Hours' | 'Pet Policy' | 'Visitor Policy' | 'General',
      title: string,
      description: string,
      effectiveDate: string,
      penaltyAmount?: number,
      relatedDocuments?: { url: string, filename: string }[]
    }
  ]
}

// curfew_settings
{
  enabled: boolean,
  startTime: string, // "22:00"
  endTime: string,   // "05:00"
  exemptions: string[]
}

// gate_operating_hours
{
  mainGate: { open: string, close: string },
  backGate: { open: string, close: string }
}
```

---

### 11. role

Defines user roles and permissions.

**Fields**:

- `id`: UUID (primary key)
- `code`: string (unique identifier like 'resident', 'guard', 'admin')
- `name`: string (display name)
- `description`: string | null
- `scope`: 'platform' | 'tenant' | 'household' | 'security'
- `hierarchy_level`: number (1 = highest authority)
- `permissions`: Json (permission keys)
- `is_active`: boolean
- `created_at`: string (timestamp)
- `updated_at`: string (timestamp)

**Scope Enum**: `role_scope` = 'platform' | 'tenant' | 'household' | 'security'

**Resident Role Codes** (expected):

- `'resident_head'`: Household head with signatory rights
- `'resident_member'`: Household member with visiting rights
- `'beneficial_user'`: Non-resident with vehicle pass only

---

## Entities Not Yet in Schema (To Be Added)

These entities are required by the spec but not yet in the Supabase schema:

### Guest (Pre-authorization)

**Proposed Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `household_id`: UUID (foreign key → household.id)
- `guest_name`: string
- `phone`: string | null
- `vehicle_plate`: string | null
- `purpose`: string
- `expected_arrival_date`: date
- `expected_arrival_time`: time | null
- `special_instructions`: string | null
- `status`: 'pending' | 'approved' | 'at_gate' | 'denied' | 'completed'
- `created_by`: UUID (foreign key → tenant_user.id)
- `approved_by`: UUID | null (foreign key → tenant_user.id)
- `arrival_time`: timestamp | null
- `created_at`: timestamp
- `updated_at`: timestamp

**Status Enum**: `'pending' | 'approved' | 'at_gate' | 'denied' | 'completed'`

---

### Announcement

**Proposed Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `type`: 'event' | 'maintenance' | 'emergency' | 'general' | 'rule_change' | 'fee_notice'
- `priority`: 'low' | 'normal' | 'high' | 'urgent'
- `title`: string
- `content`: string (rich text)
- `attachments`: Json | null (file references)
- `publish_date`: timestamp
- `expiry_date`: timestamp | null
- `published_by`: UUID (foreign key → tenant_user.id)
- `created_at`: timestamp
- `updated_at`: timestamp

---

### Announcement_Read (Junction Table)

**Proposed Fields**:

- `id`: UUID (primary key)
- `announcement_id`: UUID (foreign key → announcement.id)
- `user_id`: UUID (foreign key → tenant_user.id)
- `read_at`: timestamp

**Unique Constraint**: (announcement_id, user_id)

---

### Payment (Household Billing)

**Proposed Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `household_id`: UUID (foreign key → household.id)
- `amount`: decimal
- `type`: 'association_fee' | 'road_fee' | 'sticker_fee' | 'penalty'
- `status`: 'pending' | 'paid' | 'overdue' | 'failed'
- `due_date`: date
- `payment_date`: timestamp | null
- `payment_method`: 'gcash' | 'paymaya' | 'card' | 'bank_transfer' | null
- `transaction_reference`: string | null
- `receipt_url`: string | null
- `created_at`: timestamp
- `updated_at`: timestamp

---

### Incident

**Proposed Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `reporter_id`: UUID | null (foreign key → tenant_user.id, null if anonymous)
- `type`: 'security_threat' | 'traffic_violation' | 'noise_complaint' | 'suspicious_activity' | 'emergency' | 'fire' | 'medical' | 'other'
- `title`: string
- `description`: string
- `location`: Json | null ({ lat, lng, address })
- `severity`: 'low' | 'medium' | 'high' | 'critical'
- `status`: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed'
- `photos`: Json | null (file references)
- `is_anonymous`: boolean
- `assigned_guard_id`: UUID | null (foreign key → tenant_user.id)
- `resolution_notes`: string | null
- `created_at`: timestamp
- `updated_at`: timestamp
- `resolved_at`: timestamp | null

---

### Message (Resident-Admin Communication)

**Proposed Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `conversation_id`: UUID (group related messages)
- `sender_id`: UUID (foreign key → tenant_user.id)
- `category`: 'general_inquiry' | 'complaint' | 'request' | 'feedback'
- `content`: string
- `attachments`: Json | null (file references)
- `is_read`: boolean
- `created_at`: timestamp

---

### Notification

**Proposed Fields**:

- `id`: UUID (primary key)
- `tenant_id`: UUID (foreign key → tenant.id)
- `user_id`: UUID (foreign key → tenant_user.id)
- `type`: 'guest_arrival' | 'payment_due' | 'sticker_expiring' | 'announcement_new' | 'incident_update' | 'message_reply'
- `priority`: 'critical' | 'high' | 'normal' | 'low'
- `title`: string
- `content`: string
- `action_buttons`: Json | null
- `related_entity_id`: UUID | null
- `related_entity_type`: string | null
- `is_read`: boolean
- `created_at`: timestamp

---

## TypeScript Type Mappings

Use the auto-generated types from `docs/supabase/database.types.ts`:

```typescript
import type { Database, Tables, Enums } from "@/docs/supabase/database.types";

// Table row types
type UserProfile = Tables<"user_profile">;
type TenantUser = Tables<"tenant_user">;
type Resident = Tables<"resident">;
type Household = Tables<"household">;
type VehicleSticker = Tables<"vehicle_sticker">;
type Permit = Tables<"permit">;
type GateEntryLog = Tables<"gate_entry_log">;

// Enum types
type HouseholdStatus = Enums<"household_status">;
type StickerStatus = Enums<"sticker_status">;
type PermitStatus = Enums<"permit_status">;
type PaymentMethod = Enums<"payment_method">;
type EntryType = Enums<"entry_type">;
```

## Frontend Data Transformation

**snake_case → camelCase conversion required** per constitution:

```typescript
// Example: Transform household from database
const transformHousehold = (dbRow: Tables<"household">) => ({
  id: dbRow.id,
  tenantId: dbRow.tenant_id,
  address: dbRow.address,
  block: dbRow.block,
  lot: dbRow.lot,
  streetNumber: dbRow.street_number,
  houseNumber: dbRow.house_number,
  alias: dbRow.alias,
  stickerQuota: dbRow.sticker_quota,
  status: dbRow.status,
  metadata: dbRow.metadata,
  createdAt: dbRow.created_at,
  updatedAt: dbRow.updated_at,
});
```

**Alternatively, use Supabase column aliasing**:

```typescript
const { data } = await supabase.from("household").select(`
    id,
    tenantId:tenant_id,
    address,
    block,
    lot,
    streetNumber:street_number,
    houseNumber:house_number,
    stickerQuota:sticker_quota,
    status,
    createdAt:created_at,
    updatedAt:updated_at
  `);
```

## Zod Schema Strategy

Create Zod schemas that match the database types for validation:

```typescript
// lib/schemas/household.ts
import { z } from "zod";
import type { Enums } from "@/docs/supabase/database.types";

export const householdSchema = z.object({
  address: z.string().min(1, "Address is required"),
  block: z.string().nullable(),
  lot: z.string().nullable(),
  streetNumber: z.string().nullable(),
  houseNumber: z.string().nullable(),
  alias: z.string().nullable(),
  stickerQuota: z.number().min(1).default(3),
  status: z.enum([
    "active",
    "inactive",
    "suspended",
  ] satisfies Enums<"household_status">[]),
});
```

## Next Steps

1. **Add missing tables** to Supabase schema (Guest, Announcement, Payment, Incident, Message, Notification)
2. **Run Supabase type generation** to update database.types.ts
3. **Create Zod schemas** for all entities in `/lib/schemas`
4. **Implement RLS policies** for tenant isolation and permission checks
5. **Create database migrations** for new tables

**Phase 1 Artifacts**: See `contracts/` for API endpoint specifications using these entities.
