/**
 * Permit Payment Hooks
 *
 * TanStack Query hooks for permit payment operations.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPermitPayment,
  fetchPaymentByPermitId,
  type CreatePermitPaymentInput,
} from "@/lib/api/payments";

/**
 * Query key factory for payment queries
 */
const paymentKeys = {
  all: ["payments"] as const,
  byPermit: (permitId: string) =>
    [...paymentKeys.all, "permit", permitId] as const,
};

/**
 * Hook to fetch payment by permit ID
 */
export function usePaymentByPermit(permitId: string) {
  return useQuery({
    queryKey: paymentKeys.byPermit(permitId),
    queryFn: () => fetchPaymentByPermitId(permitId),
    enabled: !!permitId,
  });
}

/**
 * Hook to create a permit payment
 */
export function useCreatePermitPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPermitPayment,
    onSuccess: (data) => {
      // Invalidate and refetch payment queries
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({
        queryKey: paymentKeys.byPermit(data.permitId),
      });
    },
  });
}
