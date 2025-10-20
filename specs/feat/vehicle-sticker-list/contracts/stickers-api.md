# API Contract: Sticker Requests List

**Feature**: Vehicle Sticker Request List Page
**Date**: 2025-10-20
**Version**: 1.0.0

## Overview

This document defines the API contract for fetching vehicle sticker requests. The implementation uses Supabase client-side queries (not REST endpoints) following the pattern established in the guests feature.

**Implementation Pattern**: Direct Supabase client queries (not HTTP REST API)
**Client Library**: `@supabase/supabase-js 2.75.0`
**Module**: `/lib/api/stickers.ts` (new file)

## Function: fetchStickerRequests

Fetches a paginated, filtered list of vehicle sticker requests for a household.

### Signature

```typescript
async function fetchStickerRequests(
  filters?: StickerFilterParams,
): Promise<StickerListResponse>;
```

### Parameters

#### StickerFilterParams (optional)

```typescript
interface StickerFilterParams {
  status?: StickerRequestStatus; // Filter by request status
  householdId?: string; // Filter by household ID (required in practice)
  page?: number; // Page number (1-indexed, default: 1)
  pageSize?: number; // Items per page (default: 10)
}
```

**Parameter Details**:

| Parameter   | Type                   | Required | Default   | Description                                                                                            |
| ----------- | ---------------------- | -------- | --------- | ------------------------------------------------------------------------------------------------------ |
| status      | `StickerRequestStatus` | No       | undefined | Filter by request status (pending, approved, rejected, cancelled). If undefined, returns all statuses. |
| householdId | `string`               | No\*     | undefined | Filter by household. \*Required in practice - set from authenticated user context.                     |
| page        | `number`               | No       | 1         | Current page number (1-indexed).                                                                       |
| pageSize    | `number`               | No       | 10        | Number of items per page.                                                                              |

**Validation**:

- `page`: Must be >= 1
- `pageSize`: Must be between 1 and 100
- `status`: Must be valid `StickerRequestStatus` value
- `householdId`: Must be valid UUID format

### Return Value

#### StickerListResponse

```typescript
interface StickerListResponse {
  requests: StickerRequest[]; // Array of sticker requests
  count: number; // Total count matching filters
  page: number; // Current page number
  pageSize: number; // Items per page
  totalPages: number; // Total pages available
}
```

**Field Details**:

| Field      | Type               | Description                                                                    |
| ---------- | ------------------ | ------------------------------------------------------------------------------ |
| requests   | `StickerRequest[]` | Array of sticker requests for the current page, transformed to camelCase.      |
| count      | `number`           | Total number of requests matching the filter criteria (not just current page). |
| page       | `number`           | Echo of requested page number.                                                 |
| pageSize   | `number`           | Echo of requested page size.                                                   |
| totalPages | `number`           | Calculated as `Math.ceil(count / pageSize)`.                                   |

### Example Usage

#### Example 1: Fetch All Requests (First Page)

```typescript
const response = await fetchStickerRequests({
  householdId: "household-uuid-123",
});

// Response:
{
  requests: [
    {
      id: "sticker-001",
      householdId: "household-uuid-123",
      vehiclePlateNumber: "ABC1234",
      vehicleMake: "Toyota",
      vehicleModel: "Corolla",
      stickerType: "resident",
      status: "pending",
      submittedAt: "2025-10-20T10:00:00Z",
      reviewedAt: null,
      // ... other fields
    },
    // ... 9 more requests
  ],
  count: 15,
  page: 1,
  pageSize: 10,
  totalPages: 2
}
```

#### Example 2: Fetch Pending Requests Only

```typescript
const response = await fetchStickerRequests({
  householdId: "household-uuid-123",
  status: "pending",
});

// Response:
{
  requests: [ /* array of pending requests */ ],
  count: 3,
  page: 1,
  pageSize: 10,
  totalPages: 1
}
```

#### Example 3: Fetch Second Page

```typescript
const response = await fetchStickerRequests({
  householdId: "household-uuid-123",
  page: 2,
  pageSize: 10,
});

// Response:
{
  requests: [ /* requests 11-15 */ ],
  count: 15,
  page: 2,
  pageSize: 10,
  totalPages: 2
}
```

### Implementation Details

#### Supabase Query Structure

```typescript
export async function fetchStickerRequests(
  filters?: StickerFilterParams,
): Promise<StickerListResponse> {
  const supabase = createClient();

  // 1. Build base query with count
  let query = supabase
    .from("vehicle_sticker")
    .select("*", { count: "exact" })
    .order("submitted_at", { ascending: false });

  // 2. Apply status filter
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  // 3. Apply household filter (CRITICAL - security boundary)
  if (filters?.householdId) {
    query = query.eq("household_id", filters.householdId);
  }

  // 4. Apply pagination
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // 5. Execute query
  const { data, error, count } = await query;

  if (error) throw error;

  // 6. Transform snake_case to camelCase
  const requests: StickerRequest[] = data.map((item) => ({
    id: item.id,
    householdId: item.household_id,
    residentId: item.resident_id,
    tenantId: item.tenant_id,
    vehiclePlateNumber: item.vehicle_plate_number,
    vehicleMake: item.vehicle_make,
    vehicleModel: item.vehicle_model,
    vehicleColor: item.vehicle_color,
    vehicleYear: item.vehicle_year,
    registeredTo: item.vehicle_registered_to,
    stickerType: item.sticker_type,
    status: item.status,
    submittedAt: item.submitted_at,
    reviewedAt: item.reviewed_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));

  // 7. Return structured response
  return {
    requests,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}
```

#### Query Order

- **Primary Sort**: `submitted_at DESC` (newest requests first)
- **Rationale**: Recent requests are most relevant to residents

#### Pagination Calculation

```typescript
// 1-indexed page to 0-indexed range
const from = (page - 1) * pageSize; // Page 1 → from=0, Page 2 → from=10
const to = from + pageSize - 1; // Page 1 → to=9, Page 2 → to=19

// Supabase range is inclusive on both ends
query = query.range(from, to);
```

**Example**:

- Page 1, pageSize 10: range(0, 9) → items 0-9
- Page 2, pageSize 10: range(10, 19) → items 10-19
- Page 3, pageSize 10: range(20, 29) → items 20-29

### Error Handling

#### Supabase Errors

```typescript
if (error) throw error;
```

**Error Types**:

- `PostgrestError`: Database query errors
- `AuthError`: Unauthenticated/unauthorized access
- `NetworkError`: Connection issues

**Handling Strategy**:

- Throw errors to be caught by TanStack Query's error boundary
- Display user-friendly error messages via toast notifications
- Log errors for debugging (respecting no console.log rule)

#### Error Responses

Errors are thrown, not returned. TanStack Query handles them.

```typescript
// In component:
const { data, error, isLoading } = useStickerRequests(filters);

if (error) {
  // TanStack Query error boundary handles this
  // Toast notification shown automatically (via onError callback)
}
```

### Security & Authorization

#### Row-Level Security (RLS)

**Assumption**: Supabase RLS policies enforce:

- Users can only query sticker requests for their own household
- Household ID must match authenticated user's household
- Tenant ID must match authenticated user's tenant

**Frontend Protection** (defense in depth):

```typescript
// Always set householdId from auth context
const { resident } = useAuthStore();
const filters = {
  householdId: resident.householdId, // From authenticated user
  status: statusFilter,
};
```

**Note**: Even if frontend doesn't filter by household, backend RLS prevents unauthorized access.

### Performance Considerations

#### Database Indexes

**Required Indexes**:

- `household_id` (for filtering)
- `status` (for filtering)
- `submitted_at` (for ordering)
- Composite: `(household_id, status, submitted_at DESC)` (optimal for common query)

**Query Plan** (expected):

```
Index Scan using idx_vehicle_sticker_household_status_submitted
  Index Cond: (household_id = 'uuid' AND status = 'pending')
  Order: submitted_at DESC
```

#### Count Query Performance

```typescript
.select("*", { count: "exact" })
```

**Impact**: Count query adds overhead but is necessary for pagination.
**Mitigation**: Composite index makes count efficient (same index scan).

#### Page Size Limits

- Default: 10 items
- Maximum: 100 items (reasonable upper bound)
- Typical household: 1-20 requests (single page usually sufficient)

### Caching Strategy (TanStack Query)

#### Query Keys

```typescript
// Query key includes filters for precise cache management
const queryKey = ["stickers", "list", { householdId, status, page, pageSize }];
```

**Cache Invalidation**:

```typescript
// Invalidate all sticker lists when data changes
queryClient.invalidateQueries({ queryKey: ["stickers"] });

// Or invalidate specific filter combination
queryClient.invalidateQueries({
  queryKey: ["stickers", "list", { householdId }],
});
```

#### Stale Time

```typescript
useQuery({
  queryKey: stickerKeys.list(filters),
  queryFn: () => fetchStickerRequests(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes (reasonable for this data)
});
```

**Rationale**: Sticker requests change infrequently; 5-minute cache reduces unnecessary queries.

### Real-time Updates

#### Supabase Subscription

```typescript
useRealtime({
  table: "vehicle_sticker",
  onInsert: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
  onUpdate: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
  onDelete: () => queryClient.invalidateQueries({ queryKey: ["stickers"] }),
});
```

**Events Handled**:

- `INSERT`: New request submitted (by household member)
- `UPDATE`: Status changed (admin approval/rejection)
- `DELETE`: Request cancelled

**Effect**: List automatically refetches when changes occur, keeping UI synchronized.

## Alternative Approaches Considered

### Alternative 1: Server-Side Pagination with Cursors

**Rejected Because**:

- Offset-based pagination is simpler and sufficient for small datasets (<100 items)
- Cursor-based pagination adds complexity without meaningful benefit
- Typical household has <20 requests (single page)

### Alternative 2: Fetch All, Filter Client-Side

**Rejected Because**:

- Violates scalability principle
- Wastes bandwidth for large households
- Makes count calculation unreliable
- Guests feature uses server-side filtering (consistency)

### Alternative 3: Separate Count Query

**Rejected Because**:

- Supabase `count: "exact"` returns count efficiently in same query
- Two queries would require synchronization
- Adds complexity without benefit

## Testing Scenarios

### Unit Tests (API Function)

1. **Test**: Returns paginated results
   - Input: `{ householdId: "h1", page: 1, pageSize: 5 }`
   - Expected: 5 items, correct count and totalPages

2. **Test**: Filters by status
   - Input: `{ householdId: "h1", status: "pending" }`
   - Expected: Only pending requests returned

3. **Test**: Handles empty results
   - Input: `{ householdId: "h1", status: "approved" }` (no approved requests)
   - Expected: `{ requests: [], count: 0, totalPages: 0 }`

4. **Test**: Transforms snake_case to camelCase
   - Verify all fields correctly transformed

5. **Test**: Throws on Supabase error
   - Mock Supabase error
   - Expected: Error thrown (not returned)

### Integration Tests (with Supabase)

1. **Test**: Real pagination
   - Create 25 test requests
   - Fetch page 1, page 2, page 3
   - Verify correct items on each page

2. **Test**: Filter + pagination combination
   - Create mixed status requests
   - Filter by "pending" + page 2
   - Verify results

3. **Test**: Order verification
   - Verify newest requests appear first (submitted_at DESC)

## Migration & Rollout

**No Backend Changes Required**:

- Table `vehicle_sticker` already exists
- RLS policies already configured
- Indexes may need verification/addition

**Rollout Steps**:

1. Add indexes if missing (database performance)
2. Deploy frontend code (new API client, components, page)
3. Update agent context (CLAUDE.md)
4. Monitor query performance and adjust indexes if needed

## Summary

This API contract defines:

1. **Function**: `fetchStickerRequests(filters?)` in `/lib/api/stickers.ts`
2. **Parameters**: `StickerFilterParams` (status, householdId, page, pageSize)
3. **Response**: `StickerListResponse` (requests, count, page, pageSize, totalPages)
4. **Implementation**: Direct Supabase client queries (not REST endpoints)
5. **Security**: RLS enforcement + defensive householdId filtering
6. **Performance**: Indexed queries, reasonable page sizes, 5-min cache
7. **Real-time**: Supabase subscriptions with query invalidation

**Next Step**: Generate `quickstart.md` developer guide
