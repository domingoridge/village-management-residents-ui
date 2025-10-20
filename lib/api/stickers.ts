import { createClient } from "@/lib/supabase/browser";
import type {
  StickerRequest,
  StickerFilterParams,
  StickerListResponse,
} from "@/types/sticker";

/**
 * Sticker API client functions
 * Fetch sticker requests with filtering and pagination
 */

/**
 * Fetch sticker requests for a household with optional filters and pagination
 * @param filters - Optional filter parameters (status, householdId, page, pageSize)
 * @returns Paginated list of sticker requests with count and page info
 */
export async function fetchStickerRequests(
  filters?: StickerFilterParams,
): Promise<StickerListResponse> {
  const supabase = createClient();

  // 1. Build base query with count and ordering
  let query = supabase
    .from("vehicle_sticker")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // 2. Apply status filter if provided
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  // 3. Apply householdId filter if provided (CRITICAL for security)
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
  const requests: StickerRequest[] = (data || []).map((item) => ({
    id: item.id,
    householdId: item.household_id,
    residentId: item.issued_to,
    tenantId: item.tenant_id,
    vehiclePlateNumber: item.vehicle_plate_number,
    vehicleMake: item.vehicle_make,
    vehicleModel: item.vehicle_model,
    vehicleColor: item.vehicle_color,
    vehicleYear: item.vehicle_year,
    registeredTo: item.vehicle_registered_to,
    stickerType: item.sticker_type,
    status: item.status,
    submittedAt: item.created_at,
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
