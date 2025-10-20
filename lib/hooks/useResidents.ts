import { useQuery } from "@tanstack/react-query";
import { residentService } from "@/lib/services/residentService";

// Query keys for React Query
export const RESIDENT_QUERIES = {
  all: ["residents"] as const,
  byHousehold: (householdId: string) =>
    [...RESIDENT_QUERIES.all, "household", householdId] as const,
};

/**
 * Hook to fetch residents for a household
 * @param householdId - The household ID
 * @returns Query result with list of residents
 */
export function useHouseholdResidents(householdId: string | undefined) {
  return useQuery({
    queryKey: RESIDENT_QUERIES.byHousehold(householdId!),
    queryFn: () => residentService.getHouseholdResidents(householdId!),
    enabled: !!householdId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
