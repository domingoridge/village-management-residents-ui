# Quickstart: Vehicle Sticker Request List

**Feature**: Vehicle Sticker Request List Page
**Date**: 2025-10-20
**For**: Developers implementing or extending this feature

## Overview

This guide helps you run, test, and extend the vehicle sticker request list page locally. It assumes you're familiar with the codebase structure and have already read `spec.md`, `research.md`, and `data-model.md`.

## Prerequisites

- Node.js 18+ installed
- Repository cloned and dependencies installed (`npm install`)
- Supabase project configured with `.env.local` file
- Authenticated user session (login required to access dashboard)

## Quick Start

### 1. Run the Development Server

```bash
npm run dev
```

Navigate to: `http://localhost:3000/stickers`

**Expected**:

- If logged in: Sticker list page loads
- If not logged in: Redirected to `/auth/login`

### 2. View the Page

```bash
# Open in browser
open http://localhost:3000/stickers
```

**What You Should See**:

- Header: "Vehicle Sticker Requests" + "Request New Sticker" button
- Filter Section: Status filter buttons
- Content:
  - If requests exist: Grid of sticker cards
  - If no requests: Empty state with "Request First Sticker" button
- Pagination (if >10 requests)

### 3. Test with Mock Data

#### Option A: Create Requests via UI

1. Navigate to `/stickers/new`
2. Fill out sticker request form
3. Submit request
4. Return to `/stickers` - new request appears

#### Option B: Insert Mock Data (Supabase Dashboard)

```sql
-- In Supabase SQL Editor
INSERT INTO vehicle_sticker (
  household_id,
  resident_id,
  tenant_id,
  vehicle_plate_number,
  vehicle_make,
  vehicle_model,
  sticker_type,
  status,
  submitted_at
) VALUES
  ('your-household-uuid', 'your-resident-uuid', 'your-tenant-uuid', 'ABC1234', 'Toyota', 'Corolla', 'resident', 'pending', NOW()),
  ('your-household-uuid', 'your-resident-uuid', 'your-tenant-uuid', 'XYZ5678', 'Honda', 'Civic', 'beneficial_user', 'approved', NOW() - INTERVAL '1 day');
```

Refresh `/stickers` - mock requests appear.

## Project Structure

```
app/(dashboard)/stickers/
└── page.tsx                          # Main list page

components/features/stickers/
├── StickerCard.tsx                   # Card component (displays one request)
├── StickerStatusBadge.tsx            # Status badge component
└── [existing files]                  # Form, quota, etc. (unchanged)

lib/api/
└── stickers.ts                       # NEW - API client (fetchStickerRequests)

lib/hooks/
└── useStickers.ts                    # MODIFIED - extended with list hooks

types/
└── sticker.ts                        # MODIFIED - added StickerFilterParams, StickerListResponse
```

## Key Files to Understand

### 1. Page Component (`app/(dashboard)/stickers/page.tsx`)

**Purpose**: Main sticker list page
**Pattern**: Mirrors `app/(dashboard)/guests/page.tsx`

**Key Sections**:

```typescript
// State
const [currentPage, setCurrentPage] = useState(1);
const [statusFilter, setStatusFilter] = useState<StickerRequestStatus | "all">(
  "all",
);

// Data fetching
const { data, isLoading } = useStickerRequests({
  householdId: resident.householdId,
  status: statusFilter === "all" ? undefined : statusFilter,
  page: currentPage,
  pageSize: 10,
});

// Real-time updates
useRealtime({
  table: "vehicle_sticker",
  onInsert: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
  onUpdate: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
  onDelete: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
});
```

### 2. API Client (`lib/api/stickers.ts`)

**Purpose**: Fetch sticker requests from Supabase
**Key Function**: `fetchStickerRequests(filters?)`

```typescript
import { createClient } from "@/lib/supabase/browser";
import type { StickerFilterParams, StickerListResponse } from "@/types/sticker";

export async function fetchStickerRequests(
  filters?: StickerFilterParams,
): Promise<StickerListResponse> {
  // 1. Build Supabase query
  // 2. Apply filters (status, householdId)
  // 3. Apply pagination
  // 4. Transform snake_case → camelCase
  // 5. Return structured response
}
```

### 3. Data Hook (`lib/hooks/useStickers.ts`)

**Purpose**: TanStack Query hooks for sticker data
**Key Addition**: `useStickerRequests(filters)`

```typescript
export function useStickerRequests(filters?: StickerFilterParams) {
  return useQuery({
    queryKey: stickerKeys.list(filters),
    queryFn: () => fetchStickerRequests(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 4. Card Component (`components/features/stickers/StickerCard.tsx`)

**Purpose**: Display individual sticker request
**Pattern**: Mirrors `GuestCard.tsx`

```tsx
<Link href={ROUTES.STICKERS.DETAIL(request.id)}>
  <Card>
    <CardHeader>
      <CardTitle>{request.vehiclePlateNumber}</CardTitle>
      <StickerStatusBadge status={request.status} />
    </CardHeader>
    <CardContent>{/* Vehicle details, dates, etc. */}</CardContent>
  </Card>
</Link>
```

## Common Development Tasks

### Add a New Filter

**Example**: Add filter for stickerType (resident vs beneficial_user)

1. **Update State** (page.tsx):

```typescript
const [typeFilter, setTypeFilter] = useState<StickerType | "all">("all");
```

2. **Pass to Hook**:

```typescript
const { data } = useStickerRequests({
  ...filters,
  stickerType: typeFilter === "all" ? undefined : typeFilter,
});
```

3. **Update API Client** (lib/api/stickers.ts):

```typescript
if (filters?.stickerType) {
  query = query.eq("sticker_type", filters.stickerType);
}
```

4. **Add Filter UI** (page.tsx):

```tsx
<Button
  variant={typeFilter === "resident" ? "primary" : "outline"}
  onClick={() => setTypeFilter("resident")}
>
  Resident
</Button>
```

### Change Page Size

**Current**: 10 items per page

**To Change**:

```typescript
// In page.tsx
const pageSize = 20; // Change from 10 to 20

const { data } = useStickerRequests({
  ...filters,
  pageSize, // Pass updated size
});
```

### Add Sorting

**Example**: Sort by plate number instead of submission date

**Update API Client**:

```typescript
// In fetchStickerRequests()
let query = supabase
  .from("vehicle_sticker")
  .select("*", { count: "exact" })
  .order("vehicle_plate_number", { ascending: true }); // Changed from submitted_at
```

### Customize Card Content

**Example**: Add vehicle color to card

**Update StickerCard.tsx**:

```tsx
<CardContent>
  {/* Existing content */}
  {request.vehicleColor && (
    <div className="flex items-center gap-2 text-sm">
      <Palette className="h-4 w-4 text-neutral/50" />
      <span>{request.vehicleColor}</span>
    </div>
  )}
</CardContent>
```

## Testing

### Manual Testing Checklist

- [ ] Page loads without errors
- [ ] Sticker cards display correctly with all expected fields
- [ ] Status filter buttons work (all, pending, approved, rejected, cancelled)
- [ ] Pagination works (next/prev, direct page navigation)
- [ ] Empty state shows when no requests exist
- [ ] Loading skeleton appears during initial load
- [ ] Real-time updates work (submit new request, see it appear)
- [ ] "Request New Sticker" button navigates to /stickers/new
- [ ] Status badges display correct colors
- [ ] Clicking card navigates to detail page (when implemented)
- [ ] Mobile responsive (test at 375px, 768px, 1024px widths)

### Test Scenarios

#### Scenario 1: Household with No Requests

1. Navigate to `/stickers`
2. **Expected**: Empty state with message and "Request First Sticker" button

#### Scenario 2: Filter by Status

1. Create requests with mixed statuses (pending, approved, rejected)
2. Click "Pending" filter
3. **Expected**: Only pending requests shown
4. Click "Approved" filter
5. **Expected**: Only approved requests shown

#### Scenario 3: Pagination

1. Create 25+ sticker requests
2. Navigate to `/stickers`
3. **Expected**: See 10 requests, pagination shows "Page 1 of 3"
4. Click "Next" or "Page 2"
5. **Expected**: See next 10 requests

#### Scenario 4: Real-time Update

1. Open `/stickers` in browser
2. In another tab/window, submit a new sticker request
3. **Expected**: New request appears in list automatically (within 3 seconds)

### Automated Testing

**Unit Tests** (example for API client):

```typescript
// lib/api/__tests__/stickers.test.ts
describe("fetchStickerRequests", () => {
  it("returns paginated results", async () => {
    const result = await fetchStickerRequests({
      householdId: "h1",
      page: 1,
      pageSize: 10,
    });

    expect(result.requests).toHaveLength(10);
    expect(result.totalPages).toBeGreaterThan(0);
  });

  it("filters by status", async () => {
    const result = await fetchStickerRequests({
      householdId: "h1",
      status: "pending",
    });

    result.requests.forEach((req) => {
      expect(req.status).toBe("pending");
    });
  });
});
```

**Component Tests** (example for StickerCard):

```typescript
// components/features/stickers/__tests__/StickerCard.test.tsx
describe("StickerCard", () => {
  it("displays vehicle information", () => {
    const request = mockStickerRequest({ vehiclePlateNumber: "ABC123" });
    render(<StickerCard request={request} />);

    expect(screen.getByText("ABC123")).toBeInTheDocument();
  });

  it("shows status badge", () => {
    const request = mockStickerRequest({ status: "approved" });
    render(<StickerCard request={request} />);

    expect(screen.getByText("Approved")).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Issue: Page shows "No requests" but data exists in database

**Possible Causes**:

1. `householdId` filter not matching
2. RLS policy blocking access
3. Wrong table name in query

**Debug Steps**:

```typescript
// In page.tsx, temporarily log:
console.log("Household ID:", resident.householdId);
console.log("Data:", data);
```

Check Supabase RLS policies - ensure user can read `vehicle_sticker` table.

### Issue: Filters not working

**Debug**:

```typescript
// In lib/api/stickers.ts
console.log("Filters applied:", filters);
```

Verify filter values are correctly passed through:

1. Page component state
2. Hook call
3. API function
4. Supabase query

### Issue: Real-time updates not appearing

**Possible Causes**:

1. Supabase realtime not enabled for table
2. Query key invalidation not working
3. Subscription not established

**Debug**:

```typescript
// Add logging to useRealtime callbacks
useRealtime({
  table: "vehicle_sticker",
  onInsert: () => {
    console.log("INSERT event received");
    queryClient.invalidateQueries({ queryKey: ["stickers"] });
  },
});
```

Check Supabase dashboard - ensure realtime is enabled for `vehicle_sticker` table.

### Issue: Pagination shows incorrect total pages

**Possible Cause**: Count query not working

**Debug**:

```typescript
// In lib/api/stickers.ts
const { data, error, count } = await query;
console.log("Count:", count, "Data length:", data?.length);
```

Verify `count: "exact"` is set in `.select()` call.

### Issue: TypeScript errors on StickerRequest

**Possible Cause**: Type definitions out of sync

**Fix**:

```bash
# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

Verify `/types/sticker.ts` has all required interfaces.

## Performance Optimization

### Reduce Unnecessary Refetches

**Current**: 5-minute stale time
**To Adjust**:

```typescript
export function useStickerRequests(filters) {
  return useQuery({
    ...config,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### Optimize Real-time Subscriptions

**Instead of invalidating all**:

```typescript
// More targeted invalidation
onUpdate: (payload) => {
  queryClient.setQueryData(
    stickerKeys.detail(payload.new.id),
    transformToStickerRequest(payload.new)
  );
},
```

### Add Database Indexes

```sql
-- Composite index for common queries
CREATE INDEX idx_vehicle_sticker_household_status_submitted
ON vehicle_sticker (household_id, status, submitted_at DESC);
```

## Next Steps

1. **Implement remaining components** (`StickerCard.tsx`, `StickerStatusBadge.tsx`)
2. **Add automated tests** (unit + component tests)
3. **Test accessibility** (keyboard navigation, screen readers)
4. **Implement detail page** (`/stickers/[id]/page.tsx`)
5. **Add analytics** (track filter usage, page views)

## Related Documentation

- [Specification](./spec.md) - Feature requirements
- [Research](./research.md) - Pattern analysis from guests feature
- [Data Model](./data-model.md) - Type definitions and structures
- [API Contract](./contracts/stickers-api.md) - Detailed API documentation

## Getting Help

- **Questions about patterns**: Review `research.md` - compares with guests implementation
- **Type errors**: Check `data-model.md` for correct interfaces
- **API issues**: See `contracts/stickers-api.md` for function signatures
- **Component structure**: Compare with `app/(dashboard)/guests/page.tsx`

## Summary

**To Run**:

```bash
npm run dev
# Visit http://localhost:3000/stickers
```

**To Test**:

1. Create mock data via UI or SQL
2. Test filters, pagination, real-time updates
3. Verify mobile responsive

**To Extend**:

- Add filters: Update state, API client, and UI
- Change page size: Modify constant in page.tsx
- Customize cards: Edit StickerCard.tsx component

**Key Pattern**: This feature mirrors the guests list implementation. When in doubt, check how guests does it and adapt for stickers.
