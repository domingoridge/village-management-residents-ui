import { createClient } from "@/lib/supabase/browser";
import type { Guest } from "@/types";
import type {
  CreateGuestInput,
  UpdateGuestInput,
  GuestFilterParams,
} from "@/lib/schemas/guest";

/**
 * Guest API client functions
 * All functions use camelCase DTOs and handle snake_case conversion
 */

/**
 * Fetch all guests for the current user's household
 */
export async function fetchGuests(filters?: GuestFilterParams) {
  const supabase = createClient();

  let query = supabase
    .from("guests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.startDate) {
    query = query.gte("expected_arrival_date", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("expected_arrival_date", filters.endDate);
  }

  if (filters?.search) {
    query = query.or(
      `guest_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,vehicle_plate.ilike.%${filters.search}%`,
    );
  }

  // Apply pagination
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  // Transform to camelCase
  const guests: Guest[] = data.map((g) => ({
    id: g.id,
    tenantId: g.tenant_id,
    householdId: g.household_id,
    guestName: g.guest_name,
    phone: g.phone,
    vehiclePlate: g.vehicle_plate,
    purpose: g.purpose,
    expectedArrivalDate: g.expected_arrival_date,
    expectedArrivalTime: g.expected_arrival_time,
    specialInstructions: g.special_instructions,
    status: g.status,
    createdBy: g.created_by,
    approvedBy: g.approved_by,
    arrivalTime: g.arrival_time,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
  }));

  return {
    guests,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Fetch a single guest by ID
 */
export async function fetchGuestById(id: string): Promise<Guest> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("guest")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    tenantId: data.tenant_id,
    householdId: data.household_id,
    guestName: data.guest_name,
    phone: data.phone,
    vehiclePlate: data.vehicle_plate,
    purpose: data.purpose,
    expectedArrivalDate: data.expected_arrival_date,
    expectedArrivalTime: data.expected_arrival_time,
    specialInstructions: data.special_instructions,
    status: data.status,
    createdBy: data.created_by,
    approvedBy: data.approved_by,
    arrivalTime: data.arrival_time,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Create a new guest pre-authorization
 */
export async function createGuest(
  input: CreateGuestInput,
  householdId: string,
): Promise<Guest> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("guests")
    .insert({
      household_id: householdId,
      guest_name: input.guestName,
      phone: input.phone || null,
      vehicle_plate: input.vehiclePlate || null,
      purpose: input.purpose,
      expected_arrival_date: input.expectedArrivalDate,
      expected_arrival_time: input.expectedArrivalTime || null,
      special_instructions: input.specialInstructions || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    tenantId: data.tenant_id,
    householdId: data.household_id,
    guestName: data.guest_name,
    phone: data.phone,
    vehiclePlate: data.vehicle_plate,
    purpose: data.purpose,
    expectedArrivalDate: data.expected_arrival_date,
    expectedArrivalTime: data.expected_arrival_time,
    specialInstructions: data.special_instructions,
    status: data.status,
    createdBy: data.created_by,
    approvedBy: data.approved_by,
    arrivalTime: data.arrival_time,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update an existing guest
 */
export async function updateGuest(
  id: string,
  input: UpdateGuestInput,
): Promise<Guest> {
  const supabase = createClient();

  const updateData: Record<string, unknown> = {};
  if (input.guestName !== undefined) updateData.guest_name = input.guestName;
  if (input.phone !== undefined) updateData.phone = input.phone || null;
  if (input.vehiclePlate !== undefined)
    updateData.vehicle_plate = input.vehiclePlate || null;
  if (input.purpose !== undefined) updateData.purpose = input.purpose;
  if (input.expectedArrivalDate !== undefined)
    updateData.expected_arrival_date = input.expectedArrivalDate;
  if (input.expectedArrivalTime !== undefined)
    updateData.expected_arrival_time = input.expectedArrivalTime || null;
  if (input.specialInstructions !== undefined)
    updateData.special_instructions = input.specialInstructions || null;

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    tenantId: data.tenant_id,
    householdId: data.household_id,
    guestName: data.guest_name,
    phone: data.phone,
    vehiclePlate: data.vehicle_plate,
    purpose: data.purpose,
    expectedArrivalDate: data.expected_arrival_date,
    expectedArrivalTime: data.expected_arrival_time,
    specialInstructions: data.special_instructions,
    status: data.status,
    createdBy: data.created_by,
    approvedBy: data.approved_by,
    arrivalTime: data.arrival_time,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Delete a guest
 */
export async function deleteGuest(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("guests").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Get guest statistics for dashboard
 */
export async function fetchGuestStats() {
  const supabase = createClient();

  const { data, error } = await supabase.from("guests").select("status");

  if (error) throw error;

  const stats = {
    total: data.length,
    pending: data.filter((g) => g.status === "pending").length,
    approved: data.filter((g) => g.status === "approved").length,
    atGate: data.filter((g) => g.status === "at_gate").length,
    completed: data.filter((g) => g.status === "completed").length,
    denied: data.filter((g) => g.status === "denied").length,
  };

  return stats;
}
