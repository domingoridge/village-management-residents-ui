# Research: Vehicle Sticker List Implementation Patterns

**Date**: 2025-10-20
**Feature**: Vehicle Sticker Request List Page
**Objective**: Analyze existing guest list implementation to replicate patterns for sticker requests

## Research Summary

This research analyzes the existing guest list implementation (`/app/(dashboard)/guests/page.tsx`) and supporting infrastructure to establish clear patterns for implementing the vehicle sticker request list page. The goal is to minimize new architectural decisions by reusing proven patterns.

## 1. Guest List Implementation Pattern Analysis

### 1.1 Page Component Structure (`/app/(dashboard)/guests/page.tsx`)

**Decision**: Use identical component structure for stickers list page

**Key Patterns Identified**:

```typescript
// State management
const [currentPage, setCurrentPage] = useState(1);
const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
const pageSize = 10; // Constant

// TanStack Query hook usage
const { data, isLoading } = useGuests({
  page: currentPage,
  pageSize,
  status: statusFilter === "all" ? undefined : statusFilter,
});

// Real-time subscription
useRealtime({
  table: "guest",
  onInsert: () => queryClient.invalidateQueries({ queryKey: ["guests"] }),
  onUpdate: () => queryClient.invalidateQueries({ queryKey: ["guests"] }),
  onDelete: () => queryClient.invalidateQueries({ queryKey: ["guests"] }),
});
```

**Adaptation for Stickers**:

- Replace `useGuests` with `useStickerRequests`
- Change table name to `"vehicle_sticker"`
- Use `StickerRequestStatus` type instead of `GuestStatus`
- Query key: `["stickers"]` instead of `["guests"]`

### 1.2 Layout Structure

**Decision**: Use identical 3-section layout

1. **Header Section**:
   - Title and description
   - Primary action button (Request New Sticker)

2. **Filter Section**:
   - Filter icon + label
   - Status filter buttons (all, pending, approved, rejected, cancelled)

3. **Content Section**:
   - Loading state: `<SkeletonList items={5} />`
   - Empty state: Dashed border card with message and CTA
   - Data state: Grid of cards + pagination

**Grid Pattern**:

```typescript
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {requests.map((request) => (
    <StickerCard key={request.id} request={request} />
  ))}
</div>
```

### 1.3 Filter Implementation

**Decision**: Use same button-based filter pattern

```typescript
const handleStatusFilterChange = (status: StickerRequestStatus | "all") => {
  setStatusFilter(status);
  setCurrentPage(1); // Reset to first page
};
```

**Filter Options**:

- Guests: all, pending, approved, at_gate, completed, denied
- Stickers: all, pending, approved, rejected, cancelled

**UI Pattern**:

- Active filter: `variant="primary"`
- Inactive filters: `variant="outline"`
- Size: `size="sm"`

## 2. Data Hook Pattern (`/lib/hooks/useGuests.ts`)

### 2.1 Query Key Factory

**Decision**: Implement identical query key factory for stickers

**Pattern**:

```typescript
const stickerKeys = {
  all: ["stickers"] as const,
  lists: () => [...stickerKeys.all, "list"] as const,
  list: (filters?: StickerFilterParams) =>
    [...stickerKeys.lists(), filters] as const,
  details: () => [...stickerKeys.all, "detail"] as const,
  detail: (id: string) => [...stickerKeys.details(), id] as const,
};
```

**Rationale**: Structured query keys enable precise cache invalidation and prevent unnecessary refetches.

### 2.2 List Query Hook

**Decision**: Create `useStickerRequests` hook matching `useGuests` signature

**Pattern**:

```typescript
export function useStickerRequests(filters?: StickerFilterParams) {
  return useQuery({
    queryKey: stickerKeys.list(filters),
    queryFn: () => fetchStickerRequests(filters),
  });
}
```

**Current State**: `useStickers.ts` exists with:

- `useHouseholdQuota(householdId)`
- `useStickerRequests(householdId)` - ALREADY EXISTS but needs extension
- `useCreateStickerRequests()`

**Required Changes**:

- Extend existing `useStickerRequests` to accept `StickerFilterParams`
- Add pagination support (currently missing)
- Keep existing quota hooks unchanged

## 3. API Client Pattern (`/lib/api/guests.ts`)

### 3.1 Fetch Function Structure

**Decision**: Create `/lib/api/stickers.ts` with `fetchStickerRequests` function

**Pattern from Guests**:

```typescript
export async function fetchGuests(filters?: GuestFilterParams) {
  const supabase = createClient();

  let query = supabase
    .from("guests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.status) query = query.eq("status", filters.status);

  // Apply pagination
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  // Transform snake_case to camelCase
  const guests: Guest[] = data.map((g) => ({...}));

  return { guests, count, page, pageSize, totalPages };
}
```

**Adaptation for Stickers**:

- Table: `"vehicle_sticker"` instead of `"guests"`
- Return type: `{ requests, count, page, pageSize, totalPages }`
- Transform to `StickerRequest[]` type

**Current State**: `stickerService.ts` exists with:

- `getStickerRequests(householdId)` - Returns `StickerRequest[]`
- Missing: pagination, filtering, count

**Decision**: Create NEW `/lib/api/stickers.ts` instead of modifying service

- Service layer handles business logic (quota, file uploads)
- API layer handles data fetching with filters/pagination
- Follows guests pattern exactly

### 3.2 snake_case to camelCase Transformation

**Decision**: Apply at API boundary (same pattern as guests)

**Current Sticker Service Pattern**:

```typescript
return data.map((item) => ({
  id: item.id,
  householdId: item.household_id,
  residentId: item.resident_id,
  // ... all fields transformed
}));
```

**Consistency**: This pattern is already established in `stickerService.ts` and must be maintained in new API client.

## 4. Component Pattern Analysis

### 4.1 Card Component (`GuestCard.tsx`)

**Structure**:

```tsx
<Link href={ROUTES.GUESTS.DETAIL(guest.id)}>
  <Card className="transition-shadow hover:shadow-lg">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-lg">{guest.guestName}</CardTitle>
          <p className="mt-1 text-sm text-neutral/70">{guest.purpose}</p>
        </div>
        <GuestStatusBadge status={guest.status} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">{/* Icon + text rows */}</div>
    </CardContent>
  </Card>
</Link>
```

**Decision**: Create `StickerCard.tsx` with identical structure

**Adaptations**:

- Title: `vehiclePlateNumber` instead of `guestName`
- Subtitle: `${vehicleMake} ${vehicleModel}` instead of `purpose`
- Status badge: `<StickerStatusBadge />`
- Link: `ROUTES.STICKERS.DETAIL(request.id)`

**Icon Rows for Stickers**:

1. Car icon + Vehicle details (make, model, color)
2. Tag icon + Sticker type (Resident / Beneficial User)
3. Calendar icon + Submitted date
4. CheckCircle/XCircle icon + Reviewed date (if reviewed)

### 4.2 Status Badge Component

**Decision**: Create `StickerStatusBadge.tsx` mirroring `GuestStatusBadge.tsx`

**Pattern**:

```typescript
type StatusConfig = {
  label: string;
  colorClass: string; // DaisyUI badge classes
};

const statusConfig: Record<StickerRequestStatus, StatusConfig> = {
  pending: { label: "Pending", colorClass: "badge-warning" },
  approved: { label: "Approved", colorClass: "badge-success" },
  rejected: { label: "Rejected", colorClass: "badge-error" },
  cancelled: { label: "Cancelled", colorClass: "badge-ghost" },
};
```

## 5. Real-time Subscription Pattern

### 5.1 useRealtime Hook Usage

**Decision**: Use identical pattern, change table name

**Pattern**:

```typescript
useRealtime({
  table: "vehicle_sticker",
  onInsert: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
  onUpdate: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
  onDelete: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
});
```

**Rationale**: Existing `useRealtime` hook abstracts Supabase subscription complexity. No changes needed to hook itself.

## 6. Pagination Pattern

### 6.1 Component Usage

**Pattern**:

```tsx
<div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
  <PaginationInfo
    currentPage={currentPage}
    pageSize={pageSize}
    totalItems={totalCount}
  />
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={handlePageChange}
  />
</div>
```

**Decision**: Use identical pagination components and layout

## 7. Empty States Pattern

### 7.1 No Data State

**Pattern**:

```tsx
<div className="rounded-lg border-2 border-dashed border-neutral/40 p-12 text-center">
  <h3 className="mb-2 text-lg font-semibold text-neutral">No requests found</h3>
  <p className="mb-6 text-neutral/70">
    {statusFilter === "all"
      ? "You haven't requested any stickers yet."
      : `No requests with status "${statusFilter}".`}
  </p>
  <Link href={ROUTES.STICKERS.NEW}>
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Request First Sticker
    </Button>
  </Link>
</div>
```

**Decision**: Use identical pattern with appropriate messaging

## 8. Type Definitions

### 8.1 Filter Parameters Interface

**Decision**: Create `StickerFilterParams` matching `GuestFilterParams` structure

```typescript
export interface StickerFilterParams {
  page?: number;
  pageSize?: number;
  status?: StickerRequestStatus;
  householdId?: string; // Required for stickers
}
```

**Note**: `householdId` is required for stickers (from auth context) unlike guests which may filter across households for admins.

### 8.2 List Response Interface

**Decision**: Create consistent response structure

```typescript
export interface StickerListResponse {
  requests: StickerRequest[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## 9. Alternatives Considered

### 9.1 Alternative: Extend Existing stickerService.ts

**Rejected Because**:

- Service layer should handle business logic (quota, uploads)
- API layer should handle data fetching (pagination, filters)
- Separation of concerns matches guest implementation
- Easier to maintain and test

### 9.2 Alternative: Different Card Layout

**Rejected Because**:

- User explicitly requested "similar to GuestCard"
- Consistency improves user experience
- Proven working pattern reduces risk

### 9.3 Alternative: Combined Status Filter (Dropdown)

**Rejected Because**:

- Button-based filter is more accessible
- Mobile-friendly (no dropdown menu)
- Matches existing pattern in guests
- Clear visual indication of current filter

## 10. Implementation Checklist

Based on research, implementation requires:

- [ ] Create `/lib/api/stickers.ts` with `fetchStickerRequests()`
- [ ] Extend `/lib/hooks/useStickers.ts` with `useStickerRequests(filters)` - UPDATE existing
- [ ] Create `/components/features/stickers/StickerCard.tsx`
- [ ] Create `/components/features/stickers/StickerStatusBadge.tsx`
- [ ] Create `/app/(dashboard)/stickers/page.tsx`
- [ ] Add `StickerFilterParams` interface to `/types/sticker.ts`
- [ ] Add `StickerListResponse` interface to `/types/sticker.ts`
- [ ] Ensure `ROUTES.STICKERS.DETAIL` exists in `/constants/routes.ts` (already exists)

## 11. Risk Assessment

**Low Risk Items** (proven patterns):

- Page structure and layout
- Filter implementation
- Pagination
- Real-time subscriptions
- Card component structure

**Medium Risk Items** (minor adaptations):

- Extending existing `useStickerRequests` without breaking current usage
- Ensuring household filtering is always applied

**No High Risk Items Identified**

## 12. Conclusion

The research confirms that the vehicle sticker list page can be implemented by directly adapting the guest list implementation with minimal changes. All required patterns are established, tested, and documented in the existing codebase.

**Key Decisions Summary**:

1. **Architecture**: Copy guests pattern exactly - proven and working
2. **API Layer**: Create new `/lib/api/stickers.ts` separate from service layer
3. **Hooks**: Extend existing `useStickers.ts` with filtered list support
4. **Components**: Create `StickerCard` and `StickerStatusBadge` mirroring guest equivalents
5. **State Management**: TanStack Query with query key factory pattern
6. **Real-time**: Reuse `useRealtime` hook with table name change
7. **UI/UX**: Identical layout, filters, pagination, and empty states

**Next Steps**: Proceed to Phase 1 (Data Model, Contracts, Quickstart)
