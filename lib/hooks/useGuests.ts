/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/store/ui";
import type {
  CreateGuestInput,
  UpdateGuestInput,
  GuestFilterParams,
} from "@/lib/schemas/guest";
import {
  fetchGuests as apiFetchGuests,
  fetchGuestById as apiFetchGuestById,
  createGuest as apiCreateGuest,
  updateGuest as apiUpdateGuest,
  deleteGuest as apiDeleteGuest,
  fetchGuestStats as apiFetchGuestStats,
} from "@/lib/api/guests";

/**
 * Query key factory for guests
 */
const guestKeys = {
  all: ["guests"] as const,
  lists: () => [...guestKeys.all, "list"] as const,
  list: (filters?: GuestFilterParams) =>
    [...guestKeys.lists(), filters] as const,
  details: () => [...guestKeys.all, "detail"] as const,
  detail: (id: string) => [...guestKeys.details(), id] as const,
  stats: () => [...guestKeys.all, "stats"] as const,
};

/**
 * Hook to fetch guests with optional filters and pagination
 */
export function useGuests(filters?: GuestFilterParams) {
  return useQuery({
    queryKey: guestKeys.list(filters),
    queryFn: () => apiFetchGuests(filters),
  });
}

/**
 * Hook to fetch a single guest by ID
 */
export function useGuest(id: string) {
  return useQuery({
    queryKey: guestKeys.detail(id),
    queryFn: () => apiFetchGuestById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch guest statistics
 */
export function useGuestStats() {
  return useQuery({
    queryKey: guestKeys.stats(),
    queryFn: apiFetchGuestStats,
  });
}

/**
 * Hook to create a new guest
 */
export function useCreateGuest() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({
      input,
      householdId,
      tenantId,
      tenantUserId,
    }: {
      input: CreateGuestInput;
      householdId: string;
      tenantId: string;
      tenantUserId: string;
    }) => apiCreateGuest(input, householdId, tenantId, tenantUserId),
    onSuccess: () => {
      // Invalidate all guest queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.stats() });
      addToast({ type: "success", message: "Guest created successfully" });
    },
    onError: (error: any) => {
      console.error("Error creating guest:", error);
      addToast({
        type: "error",
        message: error.message || "Failed to create guest",
      });
    },
  });
}

/**
 * Hook to update a guest
 */
export function useUpdateGuest() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGuestInput }) =>
      apiUpdateGuest(id, input),
    onSuccess: (data, variables) => {
      // Invalidate the specific guest detail query
      queryClient.invalidateQueries({
        queryKey: guestKeys.detail(variables.id),
      });
      // Invalidate all guest list queries
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: guestKeys.stats() });
      addToast({ type: "success", message: "Guest updated successfully" });
    },
    onError: (error: any) => {
      console.error("Error updating guest:", error);
      addToast({
        type: "error",
        message: error.message || "Failed to update guest",
      });
    },
  });
}

/**
 * Hook to delete a guest
 */
export function useDeleteGuest() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => apiDeleteGuest(id),
    onSuccess: (_, id) => {
      // Invalidate the specific guest detail query
      queryClient.invalidateQueries({ queryKey: guestKeys.detail(id) });
      // Invalidate all guest list queries
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: guestKeys.stats() });
      addToast({ type: "success", message: "Guest deleted successfully" });
    },
    onError: (error: any) => {
      console.error("Error deleting guest:", error);
      addToast({
        type: "error",
        message: error.message || "Failed to delete guest",
      });
    },
  });
}
