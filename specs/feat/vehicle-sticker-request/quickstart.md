# Quickstart Guide: Vehicle Sticker Request System

**Feature**: Vehicle Sticker Request System
**Branch**: `feat/vehicle-sticker-request`
**Last Updated**: 2025-10-20

## Overview

This guide helps developers quickly understand and start working on the vehicle sticker request feature. It covers the architecture, key components, and development workflow.

## 📋 Prerequisites

Before implementing this feature, ensure you have:

- [x] Node.js 18+ installed
- [x] Access to Supabase project with database and storage
- [x] Development environment set up (Next.js 15.5.5, React 19.2.0)
- [x] Familiarity with React Hook Form and Zod validation
- [x] Read the feature [spec.md](./spec.md) and [plan.md](./plan.md)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│  Page: app/(dashboard)/stickers/new/page.tsx                │
│    └─> StickerRequestForm (main form component)             │
│          ├─> VehicleSection (per vehicle, useFieldArray)    │
│          │     ├─> Input components (plate, make, model...) │
│          │     └─> DocumentUploadField × 3                  │
│          ├─> QuotaWarning (quota indicator)                 │
│          └─> Submit Button                                  │
│                                                              │
│  Hooks:                                                      │
│    - useStickers (TanStack Query mutations)                 │
│    - useHouseholdQuota (quota validation)                   │
│    - useForm (React Hook Form with Zod)                     │
│    - useFieldArray (dynamic vehicle management)             │
│                                                              │
│  State:                                                      │
│    - Form State: React Hook Form (vehicles[], errors)       │
│    - Server State: TanStack Query (quota, submissions)      │
│    - UI State: Zustand (toasts, loading indicators)         │
└─────────────────────────────────────────────────────────────┘
                              ↓ ↑
                    Supabase Client SDK
                              ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                   Supabase (Backend Services)                │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database:                                        │
│    - sticker_requests table (new)                           │
│    - households table (add sticker_quota column)            │
│    - Row-Level Security (RLS) policies                      │
│                                                              │
│  Supabase Storage:                                           │
│    - sticker-documents bucket (private)                     │
│    - {household_id}/{request_id}/document.pdf              │
│                                                              │
│  Auth:                                                       │
│    - JWT tokens for authenticated residents                 │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Implementation Steps

### Step 1: Database Setup

Run the database migration to create necessary tables and policies:

```bash
# Apply migration from data-model.md
# File: supabase/migrations/20251020_create_sticker_requests.sql

# Key changes:
# 1. CREATE TABLE sticker_requests (...)
# 2. ALTER TABLE households ADD COLUMN sticker_quota
# 3. CREATE RLS policies for sticker_requests
# 4. CREATE storage bucket and policies
```

**Verification**:

```sql
-- Check table exists
SELECT * FROM sticker_requests LIMIT 0;

-- Check households has quota
SELECT id, sticker_quota FROM households LIMIT 1;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'sticker-documents';
```

### Step 2: Type Definitions

Create TypeScript types for type safety:

**File**: `types/sticker.ts`

```typescript
export type StickerType = "resident" | "beneficial_user";
export type StickerRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface StickerRequest {
  id: string;
  householdId: string;
  residentId: string;
  // ... (see data-model.md for full interface)
}

export interface VehicleFormData {
  plateNumber: string;
  make: string;
  model: string;
  // ... (see data-model.md)
}

export interface HouseholdQuota {
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  pendingRequests: number;
  approvedStickers: number;
}
```

### Step 3: Zod Validation Schemas

Create validation schemas for form data:

**File**: `lib/schemas/sticker.ts`

```typescript
import { z } from "zod";

// File validation helpers
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

const fileSchema = (acceptedTypes: string[], maxSize: number) =>
  z
    .instanceof(File)
    .refine(
      (file) => file.size <= maxSize,
      `File size must be less than ${maxSize / (1024 * 1024)}MB`,
    )
    .refine((file) => acceptedTypes.includes(file.type), "Invalid file type");

// Single vehicle schema
export const vehicleFormSchema = z.object({
  plateNumber: z
    .string()
    .min(1, "Plate number is required")
    .max(15, "Max 15 characters"),
  make: z.string().min(1, "Make is required").max(50),
  model: z.string().min(1, "Model is required").max(50),
  color: z.string().min(1, "Color is required").max(30),
  year: z
    .number()
    .int()
    .min(1900, "Year too old")
    .max(new Date().getFullYear(), "Cannot be a future year"),
  registeredTo: z.string().min(1, "Registered owner is required").max(100),
  stickerType: z.enum(["resident", "beneficial_user"], {
    errorMap: () => ({ message: "Please select a sticker type" }),
  }),
  officialReceipt: fileSchema(ACCEPTED_DOC_TYPES, MAX_FILE_SIZE),
  certRegistration: fileSchema(ACCEPTED_DOC_TYPES, MAX_FILE_SIZE),
  vehiclePhoto: fileSchema(ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE).optional(),
});

// Full form schema with array
export const stickerRequestFormSchema = z.object({
  vehicles: z
    .array(vehicleFormSchema)
    .min(1, "At least one vehicle is required")
    .max(10, "Maximum 10 vehicles per submission"),
});

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;
export type StickerRequestFormData = z.infer<typeof stickerRequestFormSchema>;
```

### Step 4: Supabase Service Layer

Create service functions for database operations:

**File**: `lib/services/stickerService.ts`

```typescript
import { createClient } from "@/lib/supabase/browser";
import type { StickerRequest, HouseholdQuota } from "@/types/sticker";

export const stickerService = {
  // Get household quota info
  async getHouseholdQuota(householdId: string): Promise<HouseholdQuota> {
    const supabase = createClient();

    // Get household quota
    const { data: household, error: householdError } = await supabase
      .from("households")
      .select("sticker_quota")
      .eq("id", householdId)
      .single();

    if (householdError) throw householdError;

    // Count active requests (pending + approved)
    const { count: usedCount, error: countError } = await supabase
      .from("sticker_requests")
      .select("*", { count: "exact", head: true })
      .eq("household_id", householdId)
      .in("status", ["pending", "approved"]);

    if (countError) throw countError;

    // Count pending only
    const { count: pendingCount } = await supabase
      .from("sticker_requests")
      .select("*", { count: "exact", head: true })
      .eq("household_id", householdId)
      .eq("status", "pending");

    const totalQuota = household.sticker_quota;
    const usedQuota = usedCount || 0;
    const pendingRequests = pendingCount || 0;

    return {
      totalQuota,
      usedQuota,
      remainingQuota: totalQuota - usedQuota,
      pendingRequests,
      approvedStickers: usedQuota - pendingRequests,
    };
  },

  // Upload document to Supabase Storage
  async uploadDocument(
    file: File,
    householdId: string,
    requestId: string,
    documentType: string,
  ): Promise<string> {
    const supabase = createClient();
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filePath = `${householdId}/${requestId}/${documentType}_${timestamp}.${ext}`;

    const { data, error } = await supabase.storage
      .from("sticker-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Return public URL
    const { data: urlData } = supabase.storage
      .from("sticker-documents")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  // Create sticker request
  async createStickerRequest(payload: {
    householdId: string;
    residentId: string;
    tenantId: string;
    vehiclePlateNumber: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleColor: string;
    vehicleYear: number;
    registeredTo: string;
    stickerType: string;
    officialReceiptUrl: string;
    certRegistrationUrl: string;
    vehiclePhotoUrl?: string;
  }): Promise<StickerRequest> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("sticker_requests")
      .insert({
        household_id: payload.householdId,
        resident_id: payload.residentId,
        tenant_id: payload.tenantId,
        vehicle_plate_number: payload.vehiclePlateNumber,
        vehicle_make: payload.vehicleMake,
        vehicle_model: payload.vehicleModel,
        vehicle_color: payload.vehicleColor,
        vehicle_year: payload.vehicleYear,
        registered_to: payload.registeredTo,
        sticker_type: payload.stickerType,
        official_receipt_url: payload.officialReceiptUrl,
        cert_registration_url: payload.certRegistrationUrl,
        vehicle_photo_url: payload.vehiclePhotoUrl || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Transform snake_case to camelCase
    return {
      id: data.id,
      householdId: data.household_id,
      residentId: data.resident_id,
      tenantId: data.tenant_id,
      vehiclePlateNumber: data.vehicle_plate_number,
      vehicleMake: data.vehicle_make,
      vehicleModel: data.vehicle_model,
      vehicleColor: data.vehicle_color,
      vehicleYear: data.vehicle_year,
      registeredTo: data.registered_to,
      stickerType: data.sticker_type,
      officialReceiptUrl: data.official_receipt_url,
      certRegistrationUrl: data.cert_registration_url,
      vehiclePhotoUrl: data.vehicle_photo_url,
      requestNumber: data.request_number,
      status: data.status,
      submittedAt: data.submitted_at,
      reviewedAt: data.reviewed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },
};
```

### Step 5: TanStack Query Hooks

Create React Query hooks for data fetching and mutations:

**File**: `lib/hooks/useStickers.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stickerService } from "@/lib/services/stickerService";
import { useUIStore } from "@/store/ui";
import type { VehicleFormData } from "@/lib/schemas/sticker";

export const STICKER_QUERIES = {
  all: ["stickers"] as const,
  quota: (householdId: string) =>
    [...STICKER_QUERIES.all, "quota", householdId] as const,
};

// Quota hook
export function useHouseholdQuota(householdId: string | undefined) {
  return useQuery({
    queryKey: STICKER_QUERIES.quota(householdId!),
    queryFn: () => stickerService.getHouseholdQuota(householdId!),
    enabled: !!householdId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create sticker requests (multi-vehicle)
export function useCreateStickerRequests() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (params: {
      vehicles: VehicleFormData[];
      householdId: string;
      residentId: string;
      tenantId: string;
    }) => {
      const { vehicles, householdId, residentId, tenantId } = params;
      const createdRequests = [];
      const tempRequestId = crypto.randomUUID(); // For file uploads

      try {
        for (const vehicle of vehicles) {
          // 1. Upload documents
          const [orUrl, crUrl, photoUrl] = await Promise.all([
            stickerService.uploadDocument(
              vehicle.officialReceipt,
              householdId,
              tempRequestId,
              "official_receipt",
            ),
            stickerService.uploadDocument(
              vehicle.certRegistration,
              householdId,
              tempRequestId,
              "cert_registration",
            ),
            vehicle.vehiclePhoto
              ? stickerService.uploadDocument(
                  vehicle.vehiclePhoto,
                  householdId,
                  tempRequestId,
                  "vehicle_photo",
                )
              : Promise.resolve(undefined),
          ]);

          // 2. Create sticker request
          const request = await stickerService.createStickerRequest({
            householdId,
            residentId,
            tenantId,
            vehiclePlateNumber: vehicle.plateNumber,
            vehicleMake: vehicle.make,
            vehicleModel: vehicle.model,
            vehicleColor: vehicle.color,
            vehicleYear: vehicle.year,
            registeredTo: vehicle.registeredTo,
            stickerType: vehicle.stickerType,
            officialReceiptUrl: orUrl,
            certRegistrationUrl: crUrl,
            vehiclePhotoUrl: photoUrl,
          });

          createdRequests.push(request);
        }

        return createdRequests;
      } catch (error) {
        // Rollback: delete created requests
        // (implement rollback logic if needed)
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate quota query
      queryClient.invalidateQueries({
        queryKey: STICKER_QUERIES.quota(variables.householdId),
      });

      // Show success toast
      const requestNumbers = data.map((r) => r.requestNumber).join(", ");
      addToast({
        type: "success",
        message: `Sticker request(s) submitted! Request #: ${requestNumbers}`,
      });
    },
    onError: (error) => {
      addToast({
        type: "error",
        message: `Failed to submit request: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    },
  });
}
```

### Step 6: Form Component

Create the main form component with React Hook Form:

**File**: `components/features/stickers/StickerRequestForm.tsx`

```typescript
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stickerRequestFormSchema, type StickerRequestFormData } from '@/lib/schemas/sticker';
import { VehicleSection } from './VehicleSection';
import { QuotaWarning } from './QuotaWarning';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

interface StickerRequestFormProps {
  householdId: string;
  residentId: string;
  tenantId: string;
  maxQuota: number;
  remainingQuota: number;
  onSubmit: (data: StickerRequestFormData) => void;
  isLoading: boolean;
}

export function StickerRequestForm({
  householdId,
  residentId,
  tenantId,
  maxQuota,
  remainingQuota,
  onSubmit,
  isLoading,
}: StickerRequestFormProps) {
  const form = useForm<StickerRequestFormData>({
    resolver: zodResolver(stickerRequestFormSchema),
    defaultValues: {
      vehicles: [
        {
          plateNumber: '',
          make: '',
          model: '',
          color: '',
          year: new Date().getFullYear(),
          registeredTo: '',
          stickerType: 'resident',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'vehicles',
  });

  const handleAddVehicle = () => {
    if (fields.length >= remainingQuota) {
      // Show error
      return;
    }
    append({
      plateNumber: '',
      make: '',
      model: '',
      color: '',
      year: new Date().getFullYear(),
      registeredTo: '',
      stickerType: 'resident',
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <QuotaWarning
        used={maxQuota - remainingQuota}
        total={maxQuota}
        currentVehicles={fields.length}
      />

      {fields.map((field, index) => (
        <VehicleSection
          key={field.id}
          index={index}
          form={form}
          onRemove={() => remove(index)}
          canRemove={fields.length > 1}
        />
      ))}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddVehicle}
          disabled={fields.length >= remainingQuota}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Another Vehicle
        </Button>

        <Button type="submit" disabled={isLoading || fields.length === 0}>
          {isLoading ? 'Submitting...' : `Submit ${fields.length} Request(s)`}
        </Button>
      </div>
    </form>
  );
}
```

### Step 7: Page Component

Create the main page that ties everything together:

**File**: `app/(dashboard)/stickers/new/page.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { StickerRequestForm } from '@/components/features/stickers/StickerRequestForm';
import { useHouseholdQuota, useCreateStickerRequests } from '@/lib/hooks/useStickers';
import { useAuthStore } from '@/store/auth';
import { ROUTES } from '@/constants/routes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function NewStickerRequestPage() {
  const router = useRouter();
  const { resident, tenantUser } = useAuthStore();
  const householdId = resident?.householdId;
  const residentId = resident?.id;
  const tenantId = tenantUser?.tenantId;

  const { data: quota, isLoading: quotaLoading } = useHouseholdQuota(householdId);
  const createRequests = useCreateStickerRequests();

  if (!householdId || !residentId || !tenantId) {
    return <div>Loading...</div>;
  }

  if (quotaLoading) {
    return <div>Loading quota information...</div>;
  }

  const handleSubmit = async (data: StickerRequestFormData) => {
    await createRequests.mutateAsync({
      vehicles: data.vehicles,
      householdId,
      residentId,
      tenantId,
    });

    // Redirect on success
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Vehicle Sticker</CardTitle>
        </CardHeader>
        <CardContent>
          <StickerRequestForm
            householdId={householdId}
            residentId={residentId}
            tenantId={tenantId}
            maxQuota={quota?.totalQuota || 0}
            remainingQuota={quota?.remainingQuota || 0}
            onSubmit={handleSubmit}
            isLoading={createRequests.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🧪 Testing Checklist

- [ ] Database migration applied successfully
- [ ] RLS policies prevent cross-household access
- [ ] File upload size limit enforced (5MB)
- [ ] File type validation works (PDF/JPG/PNG only)
- [ ] Quota validation prevents over-quota submissions
- [ ] Form validation shows appropriate error messages
- [ ] Multi-vehicle form adds/removes vehicles correctly
- [ ] Submission creates correct number of database records
- [ ] Request numbers generated correctly (STK-XXXXXX)
- [ ] Success toast displays all request numbers
- [ ] Redirect to dashboard after successful submission
- [ ] Form data preserved on validation error
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader announces errors
- [ ] Mobile responsive design

## 📚 Key Files Reference

| File                                    | Purpose                                 |
| --------------------------------------- | --------------------------------------- |
| `spec.md`                               | Feature requirements and user scenarios |
| `plan.md`                               | Technical implementation plan           |
| `research.md`                           | Technical decisions and best practices  |
| `data-model.md`                         | Database schema and entity definitions  |
| `contracts/api-schema.yaml`             | API contract documentation              |
| `types/sticker.ts`                      | TypeScript type definitions             |
| `lib/schemas/sticker.ts`                | Zod validation schemas                  |
| `lib/services/stickerService.ts`        | Supabase service layer                  |
| `lib/hooks/useStickers.ts`              | React Query hooks                       |
| `components/features/stickers/`         | UI components                           |
| `app/(dashboard)/stickers/new/page.tsx` | Main page                               |

## 🐛 Common Issues & Solutions

### Issue: Quota not updating after submission

**Solution**: Ensure TanStack Query cache is invalidated after mutation. Check `onSuccess` callback in `useCreateStickerRequests`.

### Issue: File upload fails with 403 error

**Solution**: Verify RLS policies on `storage.objects` table allow the authenticated user's household ID in the file path.

### Issue: Form validation not triggering

**Solution**: Ensure Zod resolver is properly configured in `useForm` and schemas match field names exactly.

### Issue: Duplicate plate number error

**Solution**: Expected behavior - database constraint prevents duplicate plates per household. Show user-friendly error message.

## 📖 Next Steps

After completing this implementation:

1. Run `/speckit.tasks` to generate task breakdown
2. Implement tasks in priority order (P1 → P2 → P3)
3. Test thoroughly with the checklist above
4. Create pull request with reference to spec
5. Request code review focusing on constitution compliance

## 🔗 Related Documentation

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Research Findings](./research.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api-schema.yaml)
- [Project Constitution](../../.specify/memory/constitution.md)

---

**Questions?** Refer to research.md for technical decisions or plan.md for architecture details.
