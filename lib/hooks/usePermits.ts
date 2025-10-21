/**
 * usePermits Hook
 *
 * TanStack Query hooks for permit applications using Supabase.
 * Provides query and mutation hooks with optimistic updates and cache management.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { useAuthStore } from "@/store/auth";
import type { PermitApplication, PermitStatus } from "@/types/permit";
import type { PermitType } from "@/constants/permitTypes";

// ============================================================================
// Type Definitions
// ============================================================================

export interface PermitFilterParams {
  status?: PermitStatus;
  permitType?: PermitType;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CreatePermitInput {
  permitType: PermitType;
  projectDetails: Record<string, unknown>;
  status?: PermitStatus;
}

export interface UpdatePermitInput {
  id: string;
  projectDetails?: Record<string, unknown>;
  contractorInfo?: Record<string, unknown>;
  documents?: Array<{ url: string; type: string; name: string }>;
  status?: PermitStatus;
}

export interface SubmitPermitInput {
  id: string;
  paymentMethod?: string;
}

// ============================================================================
// Internal Helper Functions
// ============================================================================

/**
 * Transform database record to PermitApplication type
 */
function transformPermitFromDb(
  data: Record<string, unknown>,
): PermitApplication {
  return {
    id: data.id as string,
    residentId: (data.requested_by as string) || (data.resident_id as string),
    permitType: data.permit_type as PermitType,
    status: data.status as PermitStatus,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formAnswers: (data.form_answers as Record<string, any>) || {},
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    submittedAt: data.created_at as string | undefined, // Use created_at since submitted_at doesn't exist
  };
}

// ============================================================================
// Internal API Functions
// ============================================================================

/**
 * Fetch all permit applications for the current user
 */
async function fetchPermits(filters?: PermitFilterParams) {
  const supabase = createClient();

  // Get auth data from store
  const { user, resident } = useAuthStore.getState();

  if (!user) {
    throw new Error("User not authenticated");
  }

  let query = supabase
    .from("permit")
    .select("*", { count: "exact" })
    .eq("household_id", resident?.householdId)
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.permitType) {
    query = query.eq("permit_type", filters.permitType);
  }

  if (filters?.search) {
    // Search in project details (JSONB field) - searching for description or other text fields
    query = query.or(
      `permit_type.ilike.%${filters.search}%,project_details->>description.ilike.%${filters.search}%`,
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

  const permits = data.map(transformPermitFromDb);

  return {
    permits,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Fetch a single permit by ID
 */
async function fetchPermitById(id: string): Promise<PermitApplication> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("permit")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch permit application: ${error.message}`);
  }

  if (!data) {
    throw new Error("Permit application not found");
  }

  return transformPermitFromDb(data);
}

/**
 * Create a new permit application
 */
async function createPermit(
  input: CreatePermitInput,
): Promise<PermitApplication> {
  const supabase = createClient();

  // Get auth data from store
  const { user, tenantUser, resident } = useAuthStore.getState();

  if (!user || !tenantUser || !resident) {
    throw new Error("User not authenticated");
  }

  // Insert permit application
  const { data, error } = await supabase
    .from("permit")
    .insert({
      tenant_id: tenantUser.tenantId,
      household_id: resident.householdId,
      requested_by: resident.tenantUserId,
      permit_type: input.permitType,
      form_answers: input.projectDetails,
      status: input.status || "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create permit application: ${error.message}`);
  }

  return transformPermitFromDb(data);
}

/**
 * Update an existing permit application
 */
async function updatePermit(
  input: UpdatePermitInput,
): Promise<PermitApplication> {
  const supabase = createClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.projectDetails) {
    updateData.form_answers = input.projectDetails;
  }

  if (input.status) {
    updateData.status = input.status;
  }

  const { data, error } = await supabase
    .from("permit")
    .update(updateData)
    .eq("id", input.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update permit application: ${error.message}`);
  }

  return transformPermitFromDb(data);
}

/**
 * Submit a permit application (mark as submitted)
 * Note: Payment is handled separately via permit_payment table
 */
async function submitPermit(permitId: string): Promise<PermitApplication> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("permit")
    .update({
      status: "submitted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", permitId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit permit application: ${error.message}`);
  }

  return transformPermitFromDb(data);
}

/**
 * Delete a draft permit application
 */
async function deletePermit(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("permit").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete permit application: ${error.message}`);
  }
}

/**
 * Get permit statistics for dashboard
 */
async function fetchPermitStats() {
  const supabase = createClient();

  // Get auth data from store
  const { user, resident } = useAuthStore.getState();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("permit")
    .select("status")
    .eq("household_id", resident?.householdId);

  if (error) throw error;

  const stats = {
    total: data.length,
    draft: data.filter((p) => p.status === "draft").length,
    submitted: data.filter((p) => p.status === "submitted").length,
    underReview: data.filter((p) => p.status === "under_review").length,
    approved: data.filter((p) => p.status === "approved").length,
    rejected: data.filter((p) => p.status === "rejected").length,
    pendingPayment: data.filter((p) => p.status === "pending_payment").length,
  };

  return stats;
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Query key factory for permits
 */
const permitKeys = {
  all: ["permits"] as const,
  lists: () => [...permitKeys.all, "list"] as const,
  list: (filters?: PermitFilterParams) =>
    [...permitKeys.lists(), filters] as const,
  details: () => [...permitKeys.all, "detail"] as const,
  detail: (id: string) => [...permitKeys.details(), id] as const,
  stats: () => [...permitKeys.all, "stats"] as const,
};

/**
 * Hook to fetch permits with optional filters and pagination
 *
 * @example
 * ```tsx
 * const { data, isLoading } = usePermits({
 *   page: 1,
 *   pageSize: 10,
 *   status: 'submitted',
 * });
 * ```
 */
export function usePermits(filters?: PermitFilterParams) {
  return useQuery({
    queryKey: permitKeys.list(filters),
    queryFn: () => fetchPermits(filters),
  });
}

/**
 * Hook to fetch a single permit by ID
 *
 * @example
 * ```tsx
 * const { data: permit, isLoading } = usePermit(permitId);
 * ```
 */
export function usePermit(id: string) {
  return useQuery({
    queryKey: permitKeys.detail(id),
    queryFn: () => fetchPermitById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch permit statistics
 *
 * @example
 * ```tsx
 * const { data: stats } = usePermitStats();
 * console.log(stats.total, stats.draft, stats.approved);
 * ```
 */
export function usePermitStats() {
  return useQuery({
    queryKey: permitKeys.stats(),
    queryFn: fetchPermitStats,
  });
}

/**
 * Hook to create a new permit application
 *
 * @example
 * ```tsx
 * const createMutation = useCreatePermit();
 *
 * await createMutation.mutateAsync({
 *   permitType: 'construction',
 *   projectDetails: { ... },
 * });
 * ```
 */
export function useCreatePermit() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreatePermitInput) => createPermit(input),
    onSuccess: (data) => {
      // Invalidate all permit queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: permitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permitKeys.stats() });

      // Navigate to the edit page for the newly created permit
      if (data.status === "draft") {
        router.push(`/permits/${data.id}/edit`);
      }
    },
    onError: (error: Error) => {
      console.error("Error creating permit:", error);
      alert(error.message || "Failed to create permit application");
    },
  });
}

/**
 * Hook to update an existing permit application
 *
 * @example
 * ```tsx
 * const updateMutation = useUpdatePermit();
 *
 * await updateMutation.mutateAsync({
 *   id: permitId,
 *   projectDetails: { ... },
 * });
 * ```
 */
export function useUpdatePermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePermitInput) => updatePermit(input),
    onSuccess: (data, variables) => {
      // Invalidate the specific permit detail query
      queryClient.invalidateQueries({
        queryKey: permitKeys.detail(variables.id),
      });
      // Invalidate all permit list queries
      queryClient.invalidateQueries({ queryKey: permitKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: permitKeys.stats() });
    },
    onError: (error: Error) => {
      console.error("Error updating permit:", error);
      alert(error.message || "Failed to update permit application");
    },
  });
}

/**
 * Hook to submit a permit application
 * Note: Only updates permit status. Payment is handled separately.
 *
 * @example
 * ```tsx
 * const submitMutation = useSubmitPermit();
 *
 * await submitMutation.mutateAsync(permitId);
 * ```
 */
export function useSubmitPermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permitId: string) => submitPermit(permitId),
    onSuccess: (data) => {
      // Invalidate all permit queries
      queryClient.invalidateQueries({
        queryKey: permitKeys.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: permitKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permitKeys.stats() });
    },
    onError: (error: Error) => {
      console.error("Error submitting permit:", error);
      alert(error.message || "Failed to submit permit application");
    },
  });
}

/**
 * Hook to delete a draft permit application
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeletePermit();
 *
 * await deleteMutation.mutateAsync(permitId);
 * ```
 */
export function useDeletePermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePermit(id),
    onSuccess: (_, id) => {
      // Invalidate the specific permit detail query
      queryClient.invalidateQueries({ queryKey: permitKeys.detail(id) });
      // Invalidate all permit list queries
      queryClient.invalidateQueries({ queryKey: permitKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: permitKeys.stats() });
    },
    onError: (error: Error) => {
      console.error("Error deleting permit:", error);
      alert(error.message || "Failed to delete permit application");
    },
  });
}
